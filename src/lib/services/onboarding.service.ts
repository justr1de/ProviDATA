import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';
import { cache } from 'react';
import {
  Profile,
  GabineteInvite,
  InviteEmailResponseDto,
  Gabinete,
  ProfileWithGabinete,
} from '@/types';
import { formatReactEmailDate } from '@/lib/utils/date';
import { GabineteRole } from '@/lib/enums';
import { Resend } from 'resend';
import InviteUserEmail from '@/emails/InviteUserEmail';

type GabineteInviteCreateRequest = Database['public']['Tables']['gabinete_invites']['Insert'];

async function getLatestInvite(email: string): Promise<GabineteInvite | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('gabinete_invites')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching latest invite:', error);
    return null;
  }

  return data as GabineteInvite;
}

async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as Profile;
}

async function createInvite(
  request: GabineteInviteCreateRequest
): Promise<GabineteInvite | null> {
  const supabase = await createClient();

  // Get the inviter's profile
  const inviterProfile = await getProfile(request.inviter_id);
  if (!inviterProfile) {
    console.error('Inviter profile not found');
    return null;
  }

  // Use gabinete_id from request or fall back to inviter's gabinete_id
  const targetGabineteId = request.gabinete_id || inviterProfile.gabinete_id;

  if (!targetGabineteId) {
    console.error('No gabinete_id available');
    return null;
  }

  const { data, error } = await supabase
    .from('gabinete_invites')
    .insert([
      {
        email: request.email,
        role: request.role,
        inviter_id: request.inviter_id,
        gabinete_id: targetGabineteId,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating invite:', error);
    return null;
  }

  return data as GabineteInvite;
}

async function deleteInvite(inviteId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.from('gabinete_invites').delete().eq('id', inviteId);

  if (error) {
    console.error('Error deleting invite:', error);
    return false;
  }

  return true;
}

async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data as Profile;
}

const getProfileByIdCached = cache(async (id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*, gabinetes(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error in getProfileByIdCached:', error);
    return null;
  }

  return data as ProfileWithGabinete;
});

async function handleSignup(
  userId: string,
  email: string,
  fullName?: string
): Promise<Profile | null> {
  const supabase = await createClient();

  // Check if there's a pending invite for this email
  const invite = await getLatestInvite(email);

  if (invite) {
    // Create profile with the invite's gabinete_id and role
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email: email,
          full_name: fullName || '',
          gabinete_id: invite.gabinete_id,
          role: invite.role,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile with invite:', error);
      return null;
    }

    // Delete the invite after successful signup
    await deleteInvite(invite.id);

    return data as Profile;
  } else {
    // No invite found - create a new gabinete and profile
    const { data: gabineteData, error: gabineteError } = await supabase
      .from('gabinetes')
      .insert([{ name: `${fullName || email}'s Gabinete` }])
      .select()
      .single();

    if (gabineteError) {
      console.error('Error creating gabinete:', gabineteError);
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email: email,
          full_name: fullName || '',
          gabinete_id: gabineteData.id,
          role: GabineteRole.OWNER,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }

    return data as Profile;
  }
}

async function getInvitesByGabineteId(gabineteId: string): Promise<GabineteInvite[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('gabinete_invites')
    .select('*')
    .eq('gabinete_id', gabineteId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invites:', error);
    return [];
  }

  return data as GabineteInvite[];
}

async function getProfilesByGabineteId(gabineteId: string): Promise<Profile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('gabinete_id', gabineteId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }

  return data as Profile[];
}

async function sendInviteEmail(
  inviterName: string,
  inviteeEmail: string,
  gabineteId: string
): Promise<InviteEmailResponseDto> {
  try {
    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        error: 'Resend API key not configured',
      };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Get the gabinete name
    const supabase = await createClient();
    const { data: gabineteData, error: gabineteError } = await supabase
      .from('gabinetes')
      .select('name')
      .eq('id', gabineteId)
      .single();

    if (gabineteError) {
      return {
        success: false,
        error: 'Failed to fetch gabinete information',
      };
    }

    const gabineteName = gabineteData?.name || 'the gabinete';

    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'ProviDATA <noreply@providata.com.br>',
      to: inviteeEmail,
      subject: `${inviterName} invited you to join ${gabineteName} on ProviDATA`,
      react: InviteUserEmail({
        inviterName,
        inviteeEmail,
        gabineteName,
        inviteDate: formatReactEmailDate(new Date()),
        inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/signup?email=${encodeURIComponent(inviteeEmail)}`,
      }),
    });

    if (error) {
      console.error('Error sending invite email:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: {
        id: data?.id || '',
      },
    };
  } catch (error) {
    console.error('Error in sendInviteEmail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

async function updateGabinete(
  gabineteId: string,
  updates: { name?: string; cpf_cnpj?: string }
): Promise<Gabinete | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('gabinetes')
    .update(updates)
    .eq('id', gabineteId)
    .select()
    .single();

  if (error) {
    console.error('Error updating gabinete:', error);
    return null;
  }

  return data as Gabinete;
}

async function getGabinete(gabineteId: string): Promise<Gabinete | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('gabinetes')
    .select('*')
    .eq('id', gabineteId)
    .single();

  if (error) {
    console.error('Error in getGabinete:', error);
    return null;
  }

  return data as Gabinete;
}

export const OnboardingService = {
  getLatestInvite,
  getProfile,
  createInvite,
  deleteInvite,
  updateProfile,
  handleSignup,
  getInvitesByGabineteId,
  getProfilesByGabineteId,
  sendInviteEmail,
  updateGabinete,
  getGabinete,
  getProfileByIdCached,
};
