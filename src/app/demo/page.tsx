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
  Filter,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, active: true },
  { name: 'Providências', icon: FileText, active: false },
  { name: 'Cidadãos', icon: Users, active: false },
  { name: 'Órgãos', icon: Building2, active: false },
  { name: 'Categorias', icon: FolderOpen, active: false },
];

const demoProvidencias = [
  { id: 'PROV-2024-001', cidadao: 'Maria Silva', assunto: 'Iluminação pública na Rua das Flores', status: 'em_andamento', prioridade: 'alta', data: '28/12/2024' },
  { id: 'PROV-2024-002', cidadao: 'João Santos', assunto: 'Buraco na Av. Principal', status: 'pendente', prioridade: 'urgente', data: '27/12/2024' },
  { id: 'PROV-2024-003', cidadao: 'Ana Costa', assunto: 'Poda de árvores no Bairro Centro', status: 'concluido', prioridade: 'media', data: '26/12/2024' },
  { id: 'PROV-2024-004', cidadao: 'Pedro Oliveira', assunto: 'Limpeza de terreno baldio', status: 'encaminhado', prioridade: 'baixa', data: '25/12/2024' },
  { id: 'PROV-2024-005', cidadao: 'Lucia Ferreira', assunto: 'Sinalização de trânsito', status: 'em_analise', prioridade: 'media', data: '24/12/2024' },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-400' },
  em_analise: { label: 'Em Análise', color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400' },
  encaminhado: { label: 'Encaminhado', color: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-400' },
  em_andamento: { label: 'Em Andamento', color: 'bg-pink-100 text-pink-800 dark:bg-pink-500/15 dark:text-pink-400' },
  concluido: { label: 'Concluído', color: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400' },
};

const prioridadeLabels: Record<string, { label: string; color: string }> = {
  baixa: { label: 'Baixa', color: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400' },
  media: { label: 'Média', color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400' },
  alta: { label: 'Alta', color: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-400' },
  urgente: { label: 'Urgente', color: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400' },
};

export default function DemoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="min-h-screen bg-[var(--background-secondary)] transition-colors">
      {/* Demo Banner */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-blue-500 text-white text-center py-2 text-sm">
        <span className="font-medium">Modo Demonstração</span>
        <span className="mx-2">·</span>
        <span>Os dados exibidos são fictícios</span>
        <span className="mx-2">·</span>
        <Link href="/#contato" className="underline hover:no-underline">
          Adquira o sistema completo
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
        fixed top-10 left-0 z-50 h-[calc(100%-40px)] w-60 bg-[var(--background)] border-r border-[var(--border)]
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--border)]">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-[var(--foreground)]">ProviDATA</span>
            </Link>
            <button 
              className="lg:hidden p-1.5 hover:bg-[var(--muted)] rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tenant info */}
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <p className="text-sm font-medium text-[var(--foreground)] truncate">Vereador Demo</p>
            <p className="text-xs text-[var(--muted-foreground)] truncate">
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
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                  ${activeTab === item.name 
                    ? 'bg-[var(--foreground)] text-[var(--background)] font-medium' 
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-[var(--border)] space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
              <Bell className="w-4 h-4" />
              Notificações
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
              <Settings className="w-4 h-4" />
              Configurações
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-60 pt-10">
        {/* Header */}
        <header className="sticky top-10 z-30 h-14 bg-[var(--background)] border-b border-[var(--border)]">
          <div className="flex items-center justify-between h-full px-4">
            <button
              className="lg:hidden p-1.5 hover:bg-[var(--muted)] rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              <div className="relative p-2 hover:bg-[var(--muted)] rounded-lg transition-colors hidden sm:flex">
                <Bell className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </div>

              <div className="flex items-center gap-2 p-1.5 hover:bg-[var(--muted)] rounded-lg transition-colors">
                <div className="w-7 h-7 rounded-full bg-[var(--muted)] flex items-center justify-center">
                  <User className="w-4 h-4 text-[var(--muted-foreground)]" />
                </div>
                <span className="hidden sm:block text-sm text-[var(--foreground)]">Demo</span>
                <ChevronDown className="w-3 h-3 text-[var(--muted-foreground)]" />
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
                  { label: 'Total', value: '127', icon: FileText, color: 'text-blue-500' },
                  { label: 'Pendentes', value: '23', icon: Clock, color: 'text-yellow-500' },
                  { label: 'Em Andamento', value: '45', icon: TrendingUp, color: 'text-purple-500' },
                  { label: 'Concluídas', value: '59', icon: CheckCircle, color: 'text-green-500' },
                ].map((stat, index) => (
                  <div key={index} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--muted-foreground)]">{stat.label}</span>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Recent */}
              <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-[var(--foreground)]">Providências Recentes</h2>
                  <button className="text-sm text-blue-500 hover:underline">Ver todas</button>
                </div>
                <div className="space-y-3">
                  {demoProvidencias.slice(0, 3).map((prov) => (
                    <div key={prov.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--muted)]">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)] truncate">{prov.assunto}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{prov.cidadao} · {prov.data}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusLabels[prov.status].color}`}>
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
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-medium text-sm hover:opacity-90 transition-opacity">
                  <Plus className="w-4 h-4" />
                  Nova Providência
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    placeholder="Buscar providências..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] text-sm hover:bg-[var(--muted)] transition-colors">
                  <Filter className="w-4 h-4" />
                  Filtros
                </button>
              </div>

              {/* Table */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Protocolo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Cidadão</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase hidden md:table-cell">Assunto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase hidden sm:table-cell">Prioridade</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demoProvidencias.map((prov) => (
                        <tr key={prov.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">{prov.id}</td>
                          <td className="px-4 py-3 text-sm text-[var(--foreground)]">{prov.cidadao}</td>
                          <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] hidden md:table-cell max-w-[200px] truncate">{prov.assunto}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${statusLabels[prov.status].color}`}>
                              {statusLabels[prov.status].label}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${prioridadeLabels[prov.prioridade].color}`}>
                              {prioridadeLabels[prov.prioridade].label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="p-1.5 hover:bg-[var(--muted)] rounded transition-colors">
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

          {(activeTab !== 'Dashboard' && activeTab !== 'Providências') && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-[var(--muted-foreground)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">Módulo de Demonstração</h2>
              <p className="text-sm text-[var(--muted-foreground)] text-center max-w-md mb-6">
                Este módulo está disponível apenas na versão completa do sistema. 
                Entre em contato para adquirir o ProviDATA.
              </p>
              <Link 
                href="/#contato"
                className="px-4 py-2 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Falar com consultor
              </Link>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="px-4 md:px-6 py-4 border-t border-[var(--border)] text-center">
          <p className="text-xs text-[var(--muted-foreground)]">
            Desenvolvido por{' '}
            <a 
              href="https://dataro-it.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-[var(--foreground)] hover:underline"
            >
              DATA-RO INTELIGÊNCIA TERRITORIAL
            </a>
            . Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
}
