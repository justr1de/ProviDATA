import { supabase } from '$lib/supabase';
import type { Database } from '$lib/database.types';
import type { PostgrestError } from '@supabase/supabase-js';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type Gabinete = Database['public']['Tables']['gabinetes']['Row'];
type GabineteInsert = Database['public']['Tables']['gabinetes']['Insert'];

type InviteRequest = {
	email: string;
	role: 'admin' | 'manager' | 'user';
	gabinete_id?: string;
	organization_id?: string;
};

type InviteResponse = {
	data: {
		profile: Profile;
		inviteUrl?: string;
	} | null;
	error: PostgrestError | Error | null;
};

export class OnboardingService {
	static async getProfile(userId: string): Promise<{
		data: Profile | null;
		error: PostgrestError | null;
	}> {
		const { data, error } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', userId)
			.single();

		return { data, error };
	}

	static async updateProfile(
		userId: string,
		updates: ProfileUpdate
	): Promise<{
		data: Profile | null;
		error: PostgrestError | null;
	}> {
		const { data, error } = await supabase
			.from('profiles')
			.update(updates)
			.eq('id', userId)
			.select()
			.single();

		return { data, error };
	}

	static async inviteUser(
		inviterId: string,
		request: InviteRequest
	): Promise<InviteResponse> {
		try {
			// Get inviter's profile
			const { data: inviterProfile, error: inviterError } = await this.getProfile(inviterId);
			if (inviterError || !inviterProfile) {
				return { data: null, error: inviterError || new Error('Inviter not found') };
			}

			const gabineteId = request.gabinete_id || inviterProfile.gabinete_id;

			if (!gabineteId) {
				return { data: null, error: new Error('gabinete_id is required') };
			}

			// Check if user exists
			const { data: existingProfile } = await supabase
				.from('profiles')
				.select('*')
				.eq('email', request.email)
				.single();

			if (existingProfile) {
				// User exists, update their role and gabinete
				const { data: updatedProfile, error: updateError } = await this.updateProfile(
					existingProfile.id,
					{
						role: request.role,
						gabinete_id: gabineteId
					}
				);

				if (updateError) {
					return { data: null, error: updateError };
				}

				return { data: { profile: updatedProfile! }, error: null };
			}

			// Generate magic link for new user
			const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
				email: request.email,
				options: {
					emailRedirectTo: `${window.location.origin}/auth/callback`
				}
			});

			if (authError) {
				return { data: null, error: authError };
			}

			// Create profile for new user
			// Note: The profile will be created via trigger when they first sign in
			// We'll return a temporary profile object for the response
			const tempProfile: Profile = {
				id: '', // Will be set by the database trigger
				email: request.email,
				full_name: null,
				avatar_url: null,
				role: request.role,
				gabinete_id: gabineteId,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			};

			return {
				data: {
					profile: tempProfile,
					inviteUrl: authData.properties?.action_link
				},
				error: null
			};
		} catch (error) {
			return {
				data: null,
				error: error instanceof Error ? error : new Error('Unknown error occurred')
			};
		}
	}

	static async listProfiles(gabineteId: string): Promise<{
		data: Profile[] | null;
		error: PostgrestError | null;
	}> {
		const { data, error } = await supabase
			.from('profiles')
			.select('*')
			.eq('gabinete_id', gabineteId)
			.order('created_at', { ascending: false });

		return { data, error };
	}

	static async removeUser(
		adminId: string,
		targetUserId: string
	): Promise<{
		data: boolean;
		error: PostgrestError | Error | null;
	}> {
		try {
			// Get admin's profile to verify they have permission
			const { data: adminProfile, error: adminError } = await this.getProfile(adminId);
			if (adminError || !adminProfile) {
				return { data: false, error: adminError || new Error('Admin not found') };
			}

			if (adminProfile.role !== 'admin') {
				return { data: false, error: new Error('Insufficient permissions') };
			}

			// Get target user's profile
			const { data: targetProfile, error: targetError } = await this.getProfile(targetUserId);
			if (targetError || !targetProfile) {
				return { data: false, error: targetError || new Error('Target user not found') };
			}

			// Verify both users are in the same gabinete
			if (adminProfile.gabinete_id !== targetProfile.gabinete_id) {
				return { data: false, error: new Error('Cannot remove users from different gabinetes') };
			}

			// Don't allow removing yourself
			if (adminId === targetUserId) {
				return { data: false, error: new Error('Cannot remove yourself') };
			}

			// Delete the user's profile
			const { error: deleteError } = await supabase
				.from('profiles')
				.delete()
				.eq('id', targetUserId);

			if (deleteError) {
				return { data: false, error: deleteError };
			}

			return { data: true, error: null };
		} catch (error) {
			return {
				data: false,
				error: error instanceof Error ? error : new Error('Unknown error occurred')
			};
		}
	}

	static async updateUserRole(
		adminId: string,
		targetUserId: string,
		newRole: 'admin' | 'manager' | 'user'
	): Promise<{
		data: Profile | null;
		error: PostgrestError | Error | null;
	}> {
		try {
			// Get admin's profile to verify they have permission
			const { data: adminProfile, error: adminError } = await this.getProfile(adminId);
			if (adminError || !adminProfile) {
				return { data: null, error: adminError || new Error('Admin not found') };
			}

			if (adminProfile.role !== 'admin') {
				return { data: null, error: new Error('Insufficient permissions') };
			}

			// Get target user's profile
			const { data: targetProfile, error: targetError } = await this.getProfile(targetUserId);
			if (targetError || !targetProfile) {
				return { data: null, error: targetError || new Error('Target user not found') };
			}

			// Verify both users are in the same gabinete
			if (adminProfile.gabinete_id !== targetProfile.gabinete_id) {
				return { data: null, error: new Error('Cannot update users from different gabinetes') };
			}

			// Don't allow updating yourself
			if (adminId === targetUserId) {
				return { data: null, error: new Error('Cannot update your own role') };
			}

			// Update the role
			const { data: updatedProfile, error: updateError } = await this.updateProfile(
				targetUserId,
				{ role: newRole }
			);

			if (updateError) {
				return { data: null, error: updateError };
			}

			return { data: updatedProfile, error: null };
		} catch (error) {
			return {
				data: null,
				error: error instanceof Error ? error : new Error('Unknown error occurred')
			};
		}
	}

	static async createGabinete(
		userId: string,
		gabineteData: Omit<GabineteInsert, 'id' | 'created_at' | 'updated_at'>
	): Promise<{
		data: Gabinete | null;
		error: PostgrestError | Error | null;
	}> {
		try {
			// Create the gabinete
			const { data: gabinete, error: gabineteError } = await supabase
				.from('gabinetes')
				.insert(gabineteData)
				.select()
				.single();

			if (gabineteError) {
				return { data: null, error: gabineteError };
			}

			// Update the user's profile with the new gabinete
			const { error: profileError } = await this.updateProfile(userId, {
				gabinete_id: gabinete.id,
				role: 'admin' // Creator becomes admin
			});

			if (profileError) {
				// Rollback: delete the gabinete if profile update fails
				await supabase.from('gabinetes').delete().eq('id', gabinete.id);
				return { data: null, error: profileError };
			}

			return { data: gabinete, error: null };
		} catch (error) {
			return {
				data: null,
				error: error instanceof Error ? error : new Error('Unknown error occurred')
			};
		}
	}

	static async updateGabinete(
		adminId: string,
		gabineteId: string,
		updates: Partial<Omit<GabineteInsert, 'id' | 'created_at' | 'updated_at'>>
	): Promise<{
		data: Gabinete | null;
		error: PostgrestError | Error | null;
	}> {
		try {
			// Verify admin has permission
			const { data: adminProfile, error: adminError } = await this.getProfile(adminId);
			if (adminError || !adminProfile) {
				return { data: null, error: adminError || new Error('Admin not found') };
			}

			if (adminProfile.role !== 'admin' || adminProfile.gabinete_id !== gabineteId) {
				return { data: null, error: new Error('Insufficient permissions') };
			}

			// Update the gabinete
			const { data: gabinete, error: updateError } = await supabase
				.from('gabinetes')
				.update(updates)
				.eq('id', gabineteId)
				.select()
				.single();

			if (updateError) {
				return { data: null, error: updateError };
			}

			return { data: gabinete, error: null };
		} catch (error) {
			return {
				data: null,
				error: error instanceof Error ? error : new Error('Unknown error occurred')
			};
		}
	}

	static async getGabinete(
		gabineteId: string
	): Promise<{
		data: Gabinete | null;
		error: PostgrestError | Error | null;
	}> {
		try {
			const { data: gabinete, error } = await supabase
				.from('gabinetes')
				.select('*')
				.eq('id', gabineteId)
				.single();

			if (error) {
				return { data: null, error };
			}

			return { data: gabinete as Gabinete, error: null };
		} catch (error) {
			console.error('Erro no getGabinete:', error);
			return {
				data: null,
				error: error instanceof Error ? error : new Error('Unknown error occurred')
			};
		}
	}
}
