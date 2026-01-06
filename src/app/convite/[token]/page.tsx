'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import type { Gabinete, UserRole } from '@/types/onboarding';
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/types/onboarding';

interface InviteData {
  email: string;
  role: UserRole;
  gabinete?: Gabinete;
  gabinete_id?: string;
  expires_at: string;
}

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndLoadInvite();
  }, [token]);

  const checkAuthAndLoadInvite = async () => {
    try {
      setLoading(true);
      
      // Verificar autenticação
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      // Buscar dados do convite
      const response = await fetch(`/api/invites/accept?token=${token}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Convite inválido ou expirado');
      }

      const data = await response.json();
      setInvite(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar convite');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!isAuthenticated) {
      // Redirecionar para login com redirect de volta
      router.push(`/login?redirect=/convite/${token}`);
      return;
    }

    try {
      setAccepting(true);
      
      const response = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao aceitar convite');
      }

      // Sucesso! Redirecionar para dashboard
      alert('Convite aceito com sucesso! Bem-vindo ao gabinete.');
      router.push('/dashboard');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao aceitar convite');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = () => {
    if (confirm('Tem certeza que deseja recusar este convite?')) {
      router.push('/');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando convite...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <Card className="p-8 max-w-md w-full bg-white shadow-xl">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-800 mb-4">Convite Inválido</h1>
            <p className="text-red-600 mb-6">{error}</p>
            <Button
              onClick={() => router.push('/')}
              className="bg-red-600 hover:bg-red-700"
            >
              Voltar para Início
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!invite) {
    return null;
  }

  // Nome do gabinete (com fallback)
  const gabineteName = invite.gabinete?.nome || 'Gabinete';
  const gabineteType = invite.gabinete?.type || 'gabinete';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4">
      <Card className="p-8 max-w-2xl w-full bg-white shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Você foi convidado!
          </h1>
          <p className="text-gray-600">
            Junte-se ao gabinete e comece a colaborar
          </p>
        </div>

        {/* Invite Details */}
        <div className="space-y-6 mb-8">
          {/* Gabinete */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h2 className="text-sm font-medium text-gray-600 mb-2">Gabinete</h2>
            <p className="text-2xl font-bold text-gray-900">{gabineteName}</p>
            <p className="text-sm text-gray-600 mt-1 capitalize">
              Tipo: {gabineteType}
            </p>
          </div>

          {/* Email */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Email</h3>
            <p className="text-lg font-semibold text-gray-900">{invite.email}</p>
          </div>

          {/* Role */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Papel no Gabinete</h3>
            <p className="text-lg font-semibold text-green-800 mb-2">
              {ROLE_LABELS[invite.role]}
            </p>
            <p className="text-sm text-gray-700">
              {ROLE_DESCRIPTIONS[invite.role]}
            </p>
          </div>

          {/* Expiration */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Validade do Convite</h3>
            <p className="text-sm text-gray-700">
              Este convite expira em: <span className="font-semibold">{formatDate(invite.expires_at)}</span>
            </p>
          </div>
        </div>

        {/* Authentication Notice */}
        {!isAuthenticated && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              ℹ️ Você precisa estar autenticado para aceitar este convite. 
              Clique em "Aceitar Convite" para fazer login ou criar uma conta.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={handleAcceptInvite}
            disabled={accepting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
          >
            {accepting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Aceitando...
              </>
            ) : (
              <>
                ✅ Aceitar Convite
              </>
            )}
          </Button>
          <Button
            onClick={handleDecline}
            variant="outline"
            className="px-8 py-3"
          >
            Recusar
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Ao aceitar este convite, você concorda em fazer parte do gabinete{' '}
            <span className="font-semibold">{gabineteName}</span> com o papel de{' '}
            <span className="font-semibold">{ROLE_LABELS[invite.role]}</span>.
          </p>
        </div>
      </Card>
    </div>
  );
}
