'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Invite, UserRole } from '@/types/onboarding';
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/types/onboarding';

export default function ConvitesPage() {
  const router = useRouter();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('visualizador');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invites');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar convites');
      }
      
      const data = await response.json();
      setInvites(data.invites || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !role) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar convite');
      }

      // Limpar form e recarregar
      setEmail('');
      setRole('visualizador');
      setShowCreateForm(false);
      await loadInvites();
      
      alert('Convite criado com sucesso!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar convite');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!confirm('Tem certeza que deseja revogar este convite?')) {
      return;
    }

    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao revogar convite');
      }

      await loadInvites();
      alert('Convite revogado com sucesso!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao revogar convite');
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Erro ao reenviar convite');
      }

      await loadInvites();
      alert('Convite reenviado com sucesso!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao reenviar convite');
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/convite/${token}`;
    navigator.clipboard.writeText(link);
    alert('Link copiado para a área de transferência!');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'default',
      accepted: 'secondary',
      expired: 'destructive',
      revoked: 'outline',
    };

    const labels: Record<string, string> = {
      pending: 'Pendente',
      accepted: 'Aceito',
      expired: 'Expirado',
      revoked: 'Revogado',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando convites...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6 bg-red-50 border-red-200">
          <h2 className="text-xl font-bold text-red-800 mb-2">Erro</h2>
          <p className="text-red-600">{error}</p>
          <Button onClick={loadInvites} className="mt-4">
            Tentar Novamente
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Gerenciar Convites
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Convide novos usuários para sua organização
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm sm:text-base"
          >
            {showCreateForm ? 'Cancelar' : '+ Novo Convite'}
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="px-4 sm:px-6 lg:px-8">
          <Card className="p-6 sm:p-8 bg-blue-50 border-blue-200 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">Criar Novo Convite</h2>
            <form onSubmit={handleCreateInvite} className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">
                  Email do Convidado
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@exemplo.com"
                  required
                  className="w-full px-4 py-3 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">
                  Papel (Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="visualizador">Visualizador</option>
                  <option value="operador">Operador</option>
                  <option value="gestor">Gestor</option>
                  <option value="admin">Administrador</option>
                </select>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  {ROLE_DESCRIPTIONS[role]}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-blue-600 hover:bg-blue-700 px-5 py-3 text-sm sm:text-base"
                >
                  {creating ? 'Criando...' : 'Criar Convite'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  className="px-5 py-3 text-sm sm:text-base"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Invites List */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 sm:space-y-5">
          {invites.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center shadow-sm">
              <p className="text-gray-600 mb-6 text-sm sm:text-base">Nenhum convite encontrado</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm sm:text-base"
              >
                Criar Primeiro Convite
              </Button>
            </Card>
          ) : (
            invites.map((invite) => (
              <Card key={invite.id} className="p-5 sm:p-6 lg:p-8 shadow-sm">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-4 lg:gap-6">
                  <div className="flex-1 w-full lg:w-auto">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg font-semibold break-all">{invite.email}</h3>
                      {getStatusBadge(invite.status)}
                      <Badge variant="outline" className="text-xs sm:text-sm">{ROLE_LABELS[invite.role]}</Badge>
                    </div>
                    
                    <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                      <p>Criado em: {formatDate(invite.created_at)}</p>
                      <p>Expira em: {formatDate(invite.expires_at)}</p>
                      {invite.accepted_at && (
                        <p>Aceito em: {formatDate(invite.accepted_at)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col xl:flex-row gap-2 w-full lg:w-auto">
                    {invite.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => copyInviteLink(invite.token)}
                          variant="outline"
                          size="sm"
                          className="flex-1 lg:flex-none text-xs sm:text-sm px-3 py-2"
                        >
                          📋 Copiar Link
                        </Button>
                        <Button
                          onClick={() => handleResendInvite(invite.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 lg:flex-none text-xs sm:text-sm px-3 py-2"
                        >
                          🔄 Reenviar
                        </Button>
                        <Button
                          onClick={() => handleRevokeInvite(invite.id)}
                          variant="destructive"
                          size="sm"
                          className="flex-1 lg:flex-none text-xs sm:text-sm px-3 py-2"
                        >
                          ❌ Revogar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
