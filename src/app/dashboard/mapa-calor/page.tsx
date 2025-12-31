'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { Providencia } from '@/types/database'
import { 
  MapPin, 
  Filter, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  X,
  Layers
} from 'lucide-react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

// Importar mapa dinamicamente para evitar SSR
const MapaLeaflet = dynamic(() => import('@/components/mapa-leaflet'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      width: '100%', 
      height: '500px', 
      backgroundColor: 'var(--muted)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--foreground-muted)'
    }}>
      Carregando mapa...
    </div>
  )
})

interface ProvidenciaComCoordenadas extends Providencia {
  latitude: number
  longitude: number
}

interface FiltrosMapa {
  status: string[]
  prioridade: string[]
  categoria_id: string
  periodo: {
    inicio: string
    fim: string
  }
}

export default function MapaCalorPage() {
  const [providencias, setProvidencias] = useState<ProvidenciaComCoordenadas[]>([])
  const [todasProvidencias, setTodasProvidencias] = useState<Providencia[]>([])
  const [loading, setLoading] = useState(true)
  const [geocodificando, setGeocodificando] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [categorias, setCategorias] = useState<{id: string, nome: string}[]>([])
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    comCoordenadas: 0,
    semCoordenadas: 0,
    porStatus: {} as Record<string, number>,
    porPrioridade: {} as Record<string, number>
  })
  const [filtros, setFiltros] = useState<FiltrosMapa>({
    status: [],
    prioridade: [],
    categoria_id: '',
    periodo: {
      inicio: '',
      fim: ''
    }
  })
  const [providenciasFiltradas, setProvidenciasFiltradas] = useState<ProvidenciaComCoordenadas[]>([])
  
  const { tenant } = useAuthStore()
  const supabase = createClient()

  // Carregar providências e categorias
  useEffect(() => {
    if (!tenant?.id) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Buscar providências
        const { data: providenciasData, error: provError } = await supabase
          .from('providencias')
          .select(`
            *,
            cidadao:cidadaos(*),
            categoria:categorias(*),
            orgao_destino:orgaos(*)
          `)
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false })

        if (provError) throw provError

        setTodasProvidencias(providenciasData || [])
        
        // Filtrar providências com coordenadas
        const comCoordenadas = (providenciasData || []).filter(
          p => p.latitude && p.longitude
        ) as ProvidenciaComCoordenadas[]
        
        setProvidencias(comCoordenadas)
        setProvidenciasFiltradas(comCoordenadas)

        // Calcular estatísticas
        const stats = {
          total: providenciasData?.length || 0,
          comCoordenadas: comCoordenadas.length,
          semCoordenadas: (providenciasData?.length || 0) - comCoordenadas.length,
          porStatus: {} as Record<string, number>,
          porPrioridade: {} as Record<string, number>
        }

        providenciasData?.forEach(p => {
          stats.porStatus[p.status] = (stats.porStatus[p.status] || 0) + 1
          stats.porPrioridade[p.prioridade] = (stats.porPrioridade[p.prioridade] || 0) + 1
        })

        setEstatisticas(stats)

        // Buscar categorias
        const { data: categoriasData } = await supabase
          .from('categorias')
          .select('id, nome')
          .eq('tenant_id', tenant.id)
          .eq('ativo', true)

        setCategorias(categoriasData || [])

      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast.error('Erro ao carregar dados do mapa')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tenant?.id, supabase])

  // Aplicar filtros
  const aplicarFiltros = useCallback(() => {
    let filtradas = [...providencias]

    if (filtros.status.length > 0) {
      filtradas = filtradas.filter(p => filtros.status.includes(p.status))
    }

    if (filtros.prioridade.length > 0) {
      filtradas = filtradas.filter(p => filtros.prioridade.includes(p.prioridade))
    }

    if (filtros.categoria_id) {
      filtradas = filtradas.filter(p => p.categoria_id === filtros.categoria_id)
    }

    if (filtros.periodo.inicio) {
      filtradas = filtradas.filter(p => new Date(p.created_at) >= new Date(filtros.periodo.inicio))
    }

    if (filtros.periodo.fim) {
      filtradas = filtradas.filter(p => new Date(p.created_at) <= new Date(filtros.periodo.fim))
    }

    setProvidenciasFiltradas(filtradas)
  }, [providencias, filtros])

  useEffect(() => {
    aplicarFiltros()
  }, [aplicarFiltros])

  // Geocodificar providências sem coordenadas
  const geocodificarProvidencias = async () => {
    const semCoordenadas = todasProvidencias.filter(p => !p.latitude || !p.longitude)
    
    if (semCoordenadas.length === 0) {
      toast.info('Todas as providências já possuem coordenadas')
      return
    }

    setGeocodificando(true)
    let geocodificadas = 0

    for (const providencia of semCoordenadas) {
      if (!providencia.localizacao_descricao) continue

      try {
        // Usar Nominatim (OpenStreetMap) para geocodificação gratuita
        const endereco = encodeURIComponent(`${providencia.localizacao_descricao}, Rondônia, Brasil`)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${endereco}&limit=1`
        )
        const data = await response.json()

        if (data && data.length > 0) {
          const { lat, lon } = data[0]
          
          await supabase
            .from('providencias')
            .update({ latitude: parseFloat(lat), longitude: parseFloat(lon) })
            .eq('id', providencia.id)

          geocodificadas++
        }

        // Aguardar 1 segundo entre requisições (limite do Nominatim)
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error('Erro ao geocodificar:', error)
      }
    }

    toast.success(`${geocodificadas} providências geocodificadas`)
    setGeocodificando(false)
    
    // Recarregar dados
    window.location.reload()
  }

  // Limpar filtros
  const limparFiltros = () => {
    setFiltros({
      status: [],
      prioridade: [],
      categoria_id: '',
      periodo: { inicio: '', fim: '' }
    })
  }

  const toggleStatus = (status: string) => {
    setFiltros(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }))
  }

  const togglePrioridade = (prioridade: string) => {
    setFiltros(prev => ({
      ...prev,
      prioridade: prev.prioridade.includes(prioridade)
        ? prev.prioridade.filter(p => p !== prioridade)
        : [...prev.prioridade, prioridade]
    }))
  }

  // Estilos
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    overflow: 'hidden'
  }

  const statCardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }

  const buttonPrimaryStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'var(--primary)',
    color: 'white',
    border: 'none'
  }

  const statusColors: Record<string, string> = {
    pendente: '#f59e0b',
    em_analise: '#3b82f6',
    em_andamento: '#8b5cf6',
    concluida: '#22c55e',
    arquivada: '#6b7280'
  }

  const statusLabels: Record<string, string> = {
    pendente: 'Pendente',
    em_analise: 'Em Análise',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
    arquivada: 'Arquivada'
  }

  const prioridadeColors: Record<string, string> = {
    baixa: '#22c55e',
    media: '#f59e0b',
    alta: '#f97316',
    urgente: '#ef4444'
  }

  return (
    <div style={{ padding: '0 24px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <MapPin style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--foreground)', margin: 0 }}>
              Mapa de Calor
            </h1>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--foreground-muted)', margin: 0, paddingLeft: '44px' }}>
            Visualize a concentração de pedidos por região
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            style={buttonStyle}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter style={{ width: '18px', height: '18px' }} />
            Filtros
          </button>
          <button 
            style={buttonPrimaryStyle}
            onClick={geocodificarProvidencias}
            disabled={geocodificando}
          >
            <RefreshCw style={{ width: '18px', height: '18px', animation: geocodificando ? 'spin 1s linear infinite' : 'none' }} />
            Geocodificar ({estatisticas.semCoordenadas})
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={statCardStyle}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '10px', 
            backgroundColor: 'var(--primary-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers style={{ width: '22px', height: '22px', color: 'var(--primary)' }} />
          </div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--foreground)', margin: 0 }}>
              {estatisticas.total}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', margin: 0 }}>
              Total de Providências
            </p>
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '10px', 
            backgroundColor: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle style={{ width: '22px', height: '22px', color: '#22c55e' }} />
          </div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--foreground)', margin: 0 }}>
              {estatisticas.comCoordenadas}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', margin: 0 }}>
              Com Coordenadas
            </p>
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '10px', 
            backgroundColor: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle style={{ width: '22px', height: '22px', color: '#f59e0b' }} />
          </div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--foreground)', margin: 0 }}>
              {estatisticas.semCoordenadas}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', margin: 0 }}>
              Sem Coordenadas
            </p>
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '10px', 
            backgroundColor: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp style={{ width: '22px', height: '22px', color: '#3b82f6' }} />
          </div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--foreground)', margin: 0 }}>
              {estatisticas.total > 0 ? Math.round((estatisticas.comCoordenadas / estatisticas.total) * 100) : 0}%
            </p>
            <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', margin: 0 }}>
              Taxa de Geocodificação
            </p>
          </div>
        </div>
      </div>

      {/* Painel de Filtros */}
      {showFilters && (
        <div style={{ ...cardStyle, marginBottom: '24px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)', margin: 0 }}>
              Filtros
            </h3>
            <button onClick={limparFiltros} style={{ ...buttonStyle, padding: '6px 12px', fontSize: '13px' }}>
              <X style={{ width: '14px', height: '14px' }} />
              Limpar
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {/* Status */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '10px' }}>
                Status
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={filtros.status.includes(key)}
                      onChange={() => toggleStatus(key)}
                      style={{ accentColor: statusColors[key] }}
                    />
                    <span style={{ 
                      width: '10px', 
                      height: '10px', 
                      borderRadius: '50%', 
                      backgroundColor: statusColors[key] 
                    }} />
                    <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Prioridade */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '10px' }}>
                Prioridade
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['baixa', 'media', 'alta', 'urgente'].map((p) => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={filtros.prioridade.includes(p)}
                      onChange={() => togglePrioridade(p)}
                      style={{ accentColor: prioridadeColors[p] }}
                    />
                    <span style={{ 
                      width: '10px', 
                      height: '10px', 
                      borderRadius: '50%', 
                      backgroundColor: prioridadeColors[p] 
                    }} />
                    <span style={{ fontSize: '14px', color: 'var(--foreground)', textTransform: 'capitalize' }}>{p}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Categoria */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '10px' }}>
                Categoria
              </label>
              <select
                value={filtros.categoria_id}
                onChange={(e) => setFiltros(prev => ({ ...prev, categoria_id: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                  fontSize: '14px'
                }}
              >
                <option value="">Todas</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>

            {/* Período */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '10px' }}>
                Período
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="date"
                  value={filtros.periodo.inicio}
                  onChange={(e) => setFiltros(prev => ({ ...prev, periodo: { ...prev.periodo, inicio: e.target.value } }))}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="date"
                  value={filtros.periodo.fim}
                  onChange={(e) => setFiltros(prev => ({ ...prev, periodo: { ...prev.periodo, fim: e.target.value } }))}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mapa */}
      <div style={cardStyle}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)', margin: 0 }}>
            Mapa de Rondônia - {providenciasFiltradas.length} providências no mapa
          </h2>
        </div>
        <div style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ 
              width: '100%', 
              height: '500px', 
              backgroundColor: 'var(--muted)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--foreground-muted)'
            }}>
              Carregando dados...
            </div>
          ) : (
            <MapaLeaflet 
              providencias={providenciasFiltradas}
              uf={tenant?.uf || 'RO'}
            />
          )}
        </div>
      </div>

      {/* Legenda */}
      <div style={{ ...cardStyle, marginTop: '24px', padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '16px' }}>
          Legenda
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '80px', 
              height: '12px', 
              borderRadius: '6px',
              background: 'linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444)'
            }} />
            <span style={{ fontSize: '13px', color: 'var(--foreground-muted)' }}>
              Baixa → Alta concentração
            </span>
          </div>
          {Object.entries(statusLabels).map(([key, label]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                backgroundColor: statusColors[key] 
              }} />
              <span style={{ fontSize: '13px', color: 'var(--foreground-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
