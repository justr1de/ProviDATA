'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  Shield, 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText,
  Activity,
  Settings,
  LogOut,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown
} from 'lucide-react';

// Dados de demonstração
const demoTenants = [
  { 
    id: '1', 
    nome: 'Gabinete Vereador Silva', 
    tipo: 'vereador',
    cidade: 'Porto Velho',
    estado: 'RO',
    plano: 'profissional',
    status: 'ativo',
    usuarios: 5,
    providencias: 127,
    criadoEm: '2024-01-15',
    ultimoAcesso: '2024-12-29'
  },
  { 
    id: '2', 
    nome: 'Gabinete Deputado Santos', 
    tipo: 'deputado_estadual',
    cidade: 'Ji-Paraná',
    estado: 'RO',
    plano: 'basico',
    status: 'ativo',
    usuarios: 3,
    providencias: 89,
    criadoEm: '2024-03-20',
    ultimoAcesso: '2024-12-28'
  },
  { 
    id: '3', 
    nome: 'Gabinete Vereadora Costa', 
    tipo: 'vereador',
    cidade: 'Ariquemes',
    estado: 'RO',
    plano: 'profissional',
    status: 'pendente',
    usuarios: 2,
    providencias: 45,
    criadoEm: '2024-06-10',
    ultimoAcesso: '2024-12-27'
  },
  { 
    id: '4', 
    nome: 'Gabinete Deputado Federal Lima', 
    tipo: 'deputado_federal',
    cidade: 'Brasília',
    estado: 'DF',
    plano: 'profissional',
    status: 'ativo',
    usuarios: 8,
    providencias: 234,
    criadoEm: '2024-02-01',
    ultimoAcesso: '2024-12-29'
  },
  { 
    id: '5', 
    nome: 'Gabinete Vereador Oliveira', 
    tipo: 'vereador',
    cidade: 'Vilhena',
    estado: 'RO',
    plano: 'basico',
    status: 'inativo',
    usuarios: 1,
    providencias: 12,
    criadoEm: '2024-08-15',
    ultimoAcesso: '2024-11-10'
  },
];

const demoLogs = [
  { id: '1', tenant: 'Gabinete Vereador Silva', usuario: 'joao@email.com', acao: 'Criou providência PROV-2024-128', data: '29/12/2024 14:32' },
  { id: '2', tenant: 'Gabinete Deputado Santos', usuario: 'maria@email.com', acao: 'Atualizou status para Concluído', data: '29/12/2024 14:15' },
  { id: '3', tenant: 'Gabinete Deputado Federal Lima', usuario: 'admin@email.com', acao: 'Cadastrou novo cidadão', data: '29/12/2024 13:58' },
  { id: '4', tenant: 'Gabinete Vereadora Costa', usuario: 'ana@email.com', acao: 'Encaminhou providência para SEMUSA', data: '29/12/2024 13:42' },
  { id: '5', tenant: 'Gabinete Vereador Silva', usuario: 'joao@email.com', acao: 'Login no sistema', data: '29/12/2024 13:30' },
];

const statusColors: Record<string, string> = {
  ativo: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400',
  pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-400',
  inativo: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400',
};

const planoColors: Record<string, string> = {
  basico: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400',
  profissional: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400',
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar autenticação
    const session = localStorage.getItem('superadmin_session');
    if (!session) {
      router.push('/admin');
      return;
    }
    
    try {
      const parsed = JSON.parse(session);
      if (parsed.role === 'superadmin') {
        setIsAuthenticated(true);
      } else {
        router.push('/admin');
      }
    } catch {
      router.push('/admin');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('superadmin_session');
    router.push('/admin');
  };

  const filteredTenants = demoTenants.filter(tenant => 
    tenant.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-pulse text-[var(--muted-foreground)]">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-secondary)] transition-colors">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 z-50 h-full w-60 bg-[var(--background)] border-r border-[var(--border)]">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 h-14 px-4 border-b border-[var(--border)]">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-[var(--foreground)]">SuperAdmin</span>
          </div>

          {/* Admin info */}
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <p className="text-sm font-medium text-[var(--foreground)] truncate">DATA-RO</p>
            <p className="text-xs text-[var(--muted-foreground)] truncate">
              contato@dataro-it.com.br
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
              { id: 'tenants', name: 'Gabinetes', icon: Building2 },
              { id: 'usuarios', name: 'Usuários', icon: Users },
              { id: 'providencias', name: 'Providências', icon: FileText },
              { id: 'logs', name: 'Logs de Atividade', icon: Activity },
              { id: 'configuracoes', name: 'Configurações', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                  ${activeTab === item.id 
                    ? 'bg-red-500 text-white font-medium' 
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-[var(--border)]">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-60">
        {/* Header */}
        <header className="sticky top-0 z-30 h-14 bg-[var(--background)] border-b border-[var(--border)]">
          <div className="flex items-center justify-between h-full px-6">
            <h1 className="text-lg font-semibold text-[var(--foreground)]">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'tenants' && 'Gabinetes'}
              {activeTab === 'usuarios' && 'Usuários'}
              {activeTab === 'providencias' && 'Providências'}
              {activeTab === 'logs' && 'Logs de Atividade'}
              {activeTab === 'configuracoes' && 'Configurações'}
            </h1>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-sm">
                <Shield className="w-4 h-4" />
                SuperAdmin
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Gabinetes Ativos', value: '4', change: '+2', trend: 'up', icon: Building2 },
                  { label: 'Total de Usuários', value: '19', change: '+5', trend: 'up', icon: Users },
                  { label: 'Providências (Mês)', value: '507', change: '+12%', trend: 'up', icon: FileText },
                  { label: 'Taxa de Conclusão', value: '78%', change: '-3%', trend: 'down', icon: CheckCircle },
                ].map((stat, index) => (
                  <div key={index} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--muted-foreground)]">{stat.label}</span>
                      <stat.icon className="w-4 h-4 text-[var(--muted-foreground)]" />
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</span>
                      <span className={`text-xs flex items-center gap-0.5 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {stat.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent activity */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent tenants */}
                <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-[var(--foreground)]">Gabinetes Recentes</h2>
                    <button 
                      onClick={() => setActiveTab('tenants')}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Ver todos
                    </button>
                  </div>
                  <div className="space-y-3">
                    {demoTenants.slice(0, 4).map((tenant) => (
                      <div key={tenant.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--muted)]">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--foreground)] truncate">{tenant.nome}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{tenant.cidade}/{tenant.estado}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[tenant.status]}`}>
                          {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent logs */}
                <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-[var(--foreground)]">Atividade Recente</h2>
                    <button 
                      onClick={() => setActiveTab('logs')}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Ver todos
                    </button>
                  </div>
                  <div className="space-y-3">
                    {demoLogs.slice(0, 4).map((log) => (
                      <div key={log.id} className="p-3 rounded-lg bg-[var(--muted)]">
                        <p className="text-sm text-[var(--foreground)]">{log.acao}</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          {log.tenant} · {log.data}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tenants' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    placeholder="Buscar gabinetes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors">
                  <Plus className="w-4 h-4" />
                  Novo Gabinete
                </button>
              </div>

              {/* Table */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Gabinete</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase hidden md:table-cell">Localização</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Plano</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase hidden lg:table-cell">Usuários</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase hidden lg:table-cell">Providências</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTenants.map((tenant) => (
                        <tr key={tenant.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-[var(--foreground)]">{tenant.nome}</p>
                            <p className="text-xs text-[var(--muted-foreground)] capitalize">{tenant.tipo.replace('_', ' ')}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] hidden md:table-cell">
                            {tenant.cidade}/{tenant.estado}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${planoColors[tenant.plano]}`}>
                              {tenant.plano}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusColors[tenant.status]}`}>
                              {tenant.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--foreground)] hidden lg:table-cell">
                            {tenant.usuarios}
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--foreground)] hidden lg:table-cell">
                            {tenant.providencias}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1.5 hover:bg-[var(--muted)] rounded transition-colors" title="Visualizar">
                                <Eye className="w-4 h-4 text-[var(--muted-foreground)]" />
                              </button>
                              <button className="p-1.5 hover:bg-[var(--muted)] rounded transition-colors" title="Editar">
                                <Edit className="w-4 h-4 text-[var(--muted-foreground)]" />
                              </button>
                              <button className="p-1.5 hover:bg-red-500/10 rounded transition-colors" title="Excluir">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6 animate-fade-in">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    placeholder="Buscar logs..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
                <select className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:border-red-500">
                  <option value="">Todos os gabinetes</option>
                  {demoTenants.map(t => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </select>
              </div>

              {/* Logs list */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)]">
                {demoLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-[var(--muted)]/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--foreground)]">{log.acao}</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          <span className="font-medium">{log.tenant}</span> · {log.usuario}
                        </p>
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                        {log.data}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab !== 'dashboard' && activeTab !== 'tenants' && activeTab !== 'logs') && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-[var(--muted-foreground)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">Em Desenvolvimento</h2>
              <p className="text-sm text-[var(--muted-foreground)] text-center max-w-md">
                Este módulo está sendo desenvolvido e estará disponível em breve.
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-[var(--border)] text-center">
          <p className="text-xs text-[var(--muted-foreground)]">
            DATA-RO INTELIGÊNCIA TERRITORIAL · Painel de Superadministração · Todos os direitos reservados
          </p>
        </footer>
      </div>
    </div>
  );
}
