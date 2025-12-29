'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Building2, 
  FolderOpen,
  Bell,
  Settings,
  Menu,
  X,
  ChevronDown,
  User,
  Plus,
  Search,
  Eye,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Providências', icon: FileText },
  { name: 'Cidadãos', icon: Users },
  { name: 'Órgãos', icon: Building2 },
  { name: 'Categorias', icon: FolderOpen },
];

const demoProvidencias = [
  { id: 'PROV-2024-001', cidadao: 'Maria Silva', assunto: 'Iluminação pública na Rua das Flores', status: 'em_andamento', prioridade: 'alta', data: '28/12/2024' },
  { id: 'PROV-2024-002', cidadao: 'João Santos', assunto: 'Buraco na Av. Principal', status: 'pendente', prioridade: 'urgente', data: '27/12/2024' },
  { id: 'PROV-2024-003', cidadao: 'Ana Costa', assunto: 'Poda de árvores no Bairro Centro', status: 'concluido', prioridade: 'media', data: '26/12/2024' },
  { id: 'PROV-2024-004', cidadao: 'Pedro Oliveira', assunto: 'Limpeza de terreno baldio', status: 'encaminhado', prioridade: 'baixa', data: '25/12/2024' },
  { id: 'PROV-2024-005', cidadao: 'Lucia Ferreira', assunto: 'Sinalização de trânsito', status: 'em_analise', prioridade: 'media', data: '24/12/2024' },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400' },
  em_analise: { label: 'Em Análise', color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400' },
  encaminhado: { label: 'Encaminhado', color: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400' },
  em_andamento: { label: 'Em Andamento', color: 'bg-pink-100 text-pink-800 dark:bg-pink-500/20 dark:text-pink-400' },
  concluido: { label: 'Concluído', color: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' },
};

const prioridadeLabels: Record<string, { label: string; color: string }> = {
  baixa: { label: 'Baixa', color: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400' },
  media: { label: 'Média', color: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' },
  alta: { label: 'Alta', color: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400' },
  urgente: { label: 'Urgente', color: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400' },
};

export default function DemoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="min-h-screen bg-[var(--background-secondary)] transition-colors">
      {/* Demo Banner */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-green-600 to-green-700 text-white text-center py-2.5 text-sm shadow-lg">
        <span className="font-semibold">Modo Demonstração</span>
        <span className="mx-3 opacity-50">|</span>
        <span className="opacity-90">Os dados exibidos são fictícios</span>
        <span className="mx-3 opacity-50">|</span>
        <Link href="/#contato" className="font-semibold hover:underline inline-flex items-center gap-1">
          Adquira o sistema completo
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-11 left-0 z-50 h-[calc(100%-44px)] w-64 bg-[var(--background)] border-r border-[var(--border)]
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-[var(--border)]">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/20">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-[var(--foreground)]">ProviDATA</span>
            </Link>
            <button 
              className="lg:hidden p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tenant info */}
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <p className="text-sm font-semibold text-[var(--foreground)] truncate">Vereador Demonstração</p>
            <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">
              Vereador(a) · DEMO
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all
                  ${activeTab === item.name 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white font-medium shadow-lg shadow-green-600/20' 
                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-[var(--border)] space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
              <Bell className="w-5 h-5" />
              Notificações
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
              <Settings className="w-5 h-5" />
              Configurações
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 pt-11">
        {/* Header */}
        <header className="sticky top-11 z-30 h-16 bg-[var(--background)] border-b border-[var(--border)]">
          <div className="flex items-center justify-between h-full px-4 md:px-6">
            <button
              className="lg:hidden p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              <div className="relative p-2.5 hover:bg-[var(--muted)] rounded-xl transition-colors hidden sm:flex">
                <Bell className="w-5 h-5 text-[var(--muted-foreground)]" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />
              </div>

              <div className="flex items-center gap-2 p-2 hover:bg-[var(--muted)] rounded-xl transition-colors">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-[var(--foreground)]">Demo</span>
                <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          {activeTab === 'Dashboard' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Visão geral das providências do gabinete
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total', value: '127', icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
                  { label: 'Pendentes', value: '23', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                  { label: 'Em Andamento', value: '45', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                  { label: 'Concluídas', value: '59', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
                ].map((stat, index) => (
                  <div key={index} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] card-hover">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-[var(--muted-foreground)]">{stat.label}</span>
                      <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-[var(--foreground)]">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Recent */}
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">Providências Recentes</h2>
                  <button 
                    onClick={() => setActiveTab('Providências')}
                    className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium"
                  >
                    Ver todas
                  </button>
                </div>
                <div className="space-y-3">
                  {demoProvidencias.slice(0, 3).map((prov) => (
                    <div key={prov.id} className="flex items-center justify-between p-4 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)]/80 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)] truncate">{prov.assunto}</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">{prov.cidadao} · {prov.data}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${statusLabels[prov.status].color}`}>
                        {statusLabels[prov.status].label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Providências' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[var(--foreground)]">Providências</h1>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Gerencie todas as solicitações do gabinete
                  </p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-medium hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/20">
                  <Plus className="w-5 h-5" />
                  Nova Providência
                </button>
              </div>

              {/* Search */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    placeholder="Buscar providências..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-4">Protocolo</th>
                        <th className="text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-4">Cidadão</th>
                        <th className="text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-4 hidden md:table-cell">Assunto</th>
                        <th className="text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-4">Status</th>
                        <th className="text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Prioridade</th>
                        <th className="text-right text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demoProvidencias.map((prov) => (
                        <tr key={prov.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">{prov.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-[var(--foreground)]">{prov.cidadao}</span>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className="text-sm text-[var(--foreground-secondary)] truncate max-w-xs block">{prov.assunto}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${statusLabels[prov.status].color}`}>
                              {statusLabels[prov.status].label}
                            </span>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${prioridadeLabels[prov.prioridade].color}`}>
                              {prioridadeLabels[prov.prioridade].label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
                              <Eye className="w-4 h-4 text-[var(--muted-foreground)]" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'Cidadãos' || activeTab === 'Órgãos' || activeTab === 'Categorias') && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[var(--foreground)]">{activeTab}</h1>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Gerencie os {activeTab.toLowerCase()} do gabinete
                  </p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-medium hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/20">
                  <Plus className="w-5 h-5" />
                  Novo
                </button>
              </div>

              <div className="p-12 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'Cidadãos' && <Users className="w-8 h-8 text-green-600 dark:text-green-400" />}
                  {activeTab === 'Órgãos' && <Building2 className="w-8 h-8 text-green-600 dark:text-green-400" />}
                  {activeTab === 'Categorias' && <FolderOpen className="w-8 h-8 text-green-600 dark:text-green-400" />}
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  Área de {activeTab}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto">
                  Esta é uma demonstração do sistema. No sistema completo, você poderá gerenciar todos os {activeTab.toLowerCase()} do seu gabinete.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="px-4 md:px-6 py-6 border-t border-[var(--border)] text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            Desenvolvido por{' '}
            <a 
              href="https://dataro-it.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-[var(--foreground)] hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              DATA-RO INTELIGÊNCIA TERRITORIAL
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
