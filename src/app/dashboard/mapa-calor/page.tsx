'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { Providencia } from '@/types/database'
import { 
  MapPin, 
  Filter, 
  RefreshCw, 
  Layers, 
  ZoomIn, 
  ZoomOut,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'

// Tipos para o Google Maps
/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

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
  const [mapLoaded, setMapLoaded] = useState(false)
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
  
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const heatmapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  
  const { tenant } = useAuthStore()
  const supabase = createClient()

  // Carregar script do Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setMapLoaded(true)
        return
      }

      const script = document.createElement('script')
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDd3l6wxd_nr_L3yGBmIQrLwLr1l2ao60c'
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization,places&callback=initMap`
      script.async = true
      script.defer = true
      
      window.initMap = () => {
        setMapLoaded(true)
      }
      
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

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

  // Inicializar mapa quando carregado
  useEffect(() => {
    console.log('Tentando inicializar mapa:', { mapLoaded, mapRef: !!mapRef.current, mapInstance: !!mapInstanceRef.current })
    if (!mapLoaded || !mapRef.current) return
    
    // Se já existe uma instância, não reinicializar
    if (mapInstanceRef.current) return
    
    console.log('Inicializando mapa...')

    // Centro padrão (Brasil)
    let centerLat = -14.235
    let centerLng = -51.9253
    let zoom = 4

    // Se tiver tenant com UF, centralizar no estado
    if (tenant?.uf) {
      const estadosCentros: Record<string, {lat: number, lng: number, zoom: number}> = {
        'RO': { lat: -10.9472, lng: -62.8277, zoom: 7 },
        'AC': { lat: -9.0238, lng: -70.8120, zoom: 7 },
        'AM': { lat: -3.4168, lng: -65.8561, zoom: 6 },
        'RR': { lat: 2.7376, lng: -62.0751, zoom: 7 },
        'PA': { lat: -3.4168, lng: -52.2166, zoom: 6 },
        'AP': { lat: 1.4102, lng: -51.7700, zoom: 7 },
        'TO': { lat: -10.1753, lng: -48.2982, zoom: 7 },
        'MA': { lat: -5.0694, lng: -45.2352, zoom: 7 },
        'PI': { lat: -7.7183, lng: -42.7289, zoom: 7 },
        'CE': { lat: -5.4984, lng: -39.3206, zoom: 7 },
        'RN': { lat: -5.7945, lng: -36.3540, zoom: 8 },
        'PB': { lat: -7.2399, lng: -36.7819, zoom: 8 },
        'PE': { lat: -8.3138, lng: -37.8612, zoom: 7 },
        'AL': { lat: -9.5713, lng: -36.7820, zoom: 8 },
        'SE': { lat: -10.5741, lng: -37.3857, zoom: 8 },
        'BA': { lat: -12.5797, lng: -41.7007, zoom: 6 },
        'MG': { lat: -18.5122, lng: -44.5550, zoom: 6 },
        'ES': { lat: -19.1834, lng: -40.3089, zoom: 7 },
        'RJ': { lat: -22.2533, lng: -42.8777, zoom: 8 },
        'SP': { lat: -22.1965, lng: -48.7972, zoom: 7 },
        'PR': { lat: -24.8946, lng: -51.5549, zoom: 7 },
        'SC': { lat: -27.2423, lng: -50.2189, zoom: 7 },
        'RS': { lat: -30.0346, lng: -51.2177, zoom: 7 },
        'MS': { lat: -20.7722, lng: -54.7852, zoom: 7 },
        'MT': { lat: -12.6819, lng: -56.9211, zoom: 6 },
        'GO': { lat: -15.8270, lng: -49.8362, zoom: 7 },
        'DF': { lat: -15.7801, lng: -47.9292, zoom: 10 }
      }

      const centro = estadosCentros[tenant.uf]
      if (centro) {
        centerLat = centro.lat
        centerLng = centro.lng
        zoom = centro.zoom
      }
    }

    // Se tiver providências com coordenadas, centralizar nelas
    if (providencias.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      providencias.forEach(p => {
        bounds.extend({ lat: p.latitude, lng: p.longitude })
      })
      const center = bounds.getCenter()
      centerLat = center.lat()
      centerLng = center.lng()
    }

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom: zoom,
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_RIGHT
      },
      fullscreenControl: true,
      streetViewControl: false
    })

    mapInstanceRef.current = map

    // Criar heatmap layer
    if (providencias.length > 0) {
      const heatmapData = providencias.map(p => ({
        location: new window.google.maps.LatLng(p.latitude, p.longitude),
        weight: p.prioridade === 'urgente' ? 4 : p.prioridade === 'alta' ? 3 : p.prioridade === 'media' ? 2 : 1
      }))

      const heatmap = new window.google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: map,
        radius: 30,
        opacity: 0.7,
        gradient: [
          'rgba(0, 255, 0, 0)',
          'rgba(0, 255, 0, 1)',
          'rgba(255, 255, 0, 1)',
          'rgba(255, 165, 0, 1)',
          'rgba(255, 0, 0, 1)'
        ]
      })

      heatmapRef.current = heatmap
    }

  }, [mapLoaded, providencias, tenant?.uf, loading])

  // Atualizar heatmap quando filtros mudarem
  const atualizarMapa = useCallback(() => {
    if (!mapInstanceRef.current) return

    // Limpar marcadores existentes
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Filtrar providências
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

    // Atualizar heatmap
    if (heatmapRef.current) {
      const heatmapData = filtradas.map(p => ({
        location: new window.google.maps.LatLng(p.latitude, p.longitude),
        weight: p.prioridade === 'urgente' ? 4 : p.prioridade === 'alta' ? 3 : p.prioridade === 'media' ? 2 : 1
      }))

      heatmapRef.current.setData(heatmapData)
    }

    // Adicionar marcadores
    filtradas.forEach(p => {
      const marker = new window.google.maps.Marker({
        position: { lat: p.latitude, lng: p.longitude },
        map: mapInstanceRef.current!,
        title: p.titulo,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getStatusColor(p.status),
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 300px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${p.titulo}</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
              <strong>Protocolo:</strong> ${p.numero_protocolo}
            </p>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
              <strong>Status:</strong> ${formatStatus(p.status)}
            </p>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
              <strong>Prioridade:</strong> ${formatPrioridade(p.prioridade)}
            </p>
            ${p.localizacao_descricao ? `
              <p style="margin: 0; font-size: 12px; color: #666;">
                <strong>Local:</strong> ${p.localizacao_descricao}
              </p>
            ` : ''}
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current!, marker)
      })

      markersRef.current.push(marker)
    })

    // Ajustar bounds se tiver providências
    if (filtradas.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      filtradas.forEach(p => {
        bounds.extend({ lat: p.latitude, lng: p.longitude })
      })
      mapInstanceRef.current.fitBounds(bounds)
    }

  }, [providencias, filtros])

  // Geocodificar providências sem coordenadas
  const geocodificarProvidencias = async () => {
    const semCoordenadas = todasProvidencias.filter(p => !p.latitude || !p.longitude)
    
    if (semCoordenadas.length === 0) {
      toast.info('Todas as providências já possuem coordenadas')
      return
    }

    setGeocodificando(true)
    let geocodificadas = 0
    let erros = 0

    for (const providencia of semCoordenadas) {
      // Construir endereço a partir dos dados disponíveis
      let endereco = ''
      
      if (providencia.localizacao_descricao) {
        endereco = providencia.localizacao_descricao
      } else if (providencia.cidadao) {
        const cidadao = providencia.cidadao
        const partes = []
        if (cidadao.endereco) partes.push(cidadao.endereco)
        if (cidadao.numero) partes.push(cidadao.numero)
        if (cidadao.bairro) partes.push(cidadao.bairro)
        if (cidadao.cidade) partes.push(cidadao.cidade)
        if (cidadao.uf) partes.push(cidadao.uf)
        endereco = partes.join(', ')
      }

      if (!endereco) {
        erros++
        continue
      }

      // Adicionar contexto do tenant se disponível
      if (tenant?.municipio && !endereco.includes(tenant.municipio)) {
        endereco += `, ${tenant.municipio}`
      }
      if (tenant?.uf && !endereco.includes(tenant.uf)) {
        endereco += `, ${tenant.uf}`
      }
      endereco += ', Brasil'

      try {
        const geocoder = new window.google.maps.Geocoder()
        const result = await new Promise<any>((resolve, reject) => {
          geocoder.geocode({ address: endereco }, (results: any, status: any) => {
            if (status === 'OK' && results) {
              resolve(results)
            } else {
              reject(new Error(status))
            }
          })
        })

        if (result.length > 0) {
          const location = result[0].geometry.location
          
          // Atualizar no banco de dados
          const { error } = await supabase
            .from('providencias')
            .update({
              latitude: location.lat(),
              longitude: location.lng()
            })
            .eq('id', providencia.id)

          if (!error) {
            geocodificadas++
          } else {
            erros++
          }
        }

        // Delay para não exceder rate limit da API
        await new Promise(resolve => setTimeout(resolve, 200))

      } catch (error) {
        console.error('Erro ao geocodificar:', error)
        erros++
      }
    }

    setGeocodificando(false)
    
    if (geocodificadas > 0) {
      toast.success(`${geocodificadas} providências geocodificadas com sucesso!`)
      // Recarregar dados
      window.location.reload()
    }
    
    if (erros > 0) {
      toast.warning(`${erros} providências não puderam ser geocodificadas`)
    }
  }

  const getStatusColor = (status: string) => {
    const cores: Record<string, string> = {
      'pendente': '#f59e0b',
      'em_analise': '#3b82f6',
      'encaminhado': '#8b5cf6',
      'em_andamento': '#06b6d4',
      'concluido': '#22c55e',
      'arquivado': '#6b7280'
    }
    return cores[status] || '#6b7280'
  }

  const formatStatus = (status: string) => {
    const labels: Record<string, string> = {
      'pendente': 'Pendente',
      'em_analise': 'Em Análise',
      'encaminhado': 'Encaminhado',
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'arquivado': 'Arquivado'
    }
    return labels[status] || status
  }

  const formatPrioridade = (prioridade: string) => {
    const labels: Record<string, string> = {
      'baixa': 'Baixa',
      'media': 'Média',
      'alta': 'Alta',
      'urgente': 'Urgente'
    }
    return labels[prioridade] || prioridade
  }

  const toggleFiltro = (tipo: 'status' | 'prioridade', valor: string) => {
    setFiltros(prev => {
      const lista = prev[tipo]
      const novaLista = lista.includes(valor)
        ? lista.filter(v => v !== valor)
        : [...lista, valor]
      return { ...prev, [tipo]: novaLista }
    })
  }

  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      atualizarMapa()
    }
  }, [filtros, mapLoaded, atualizarMapa])

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(22, 163, 74, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MapPin style={{ width: '24px', height: '24px', color: '#16a34a' }} />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: 'var(--text-color)',
              margin: 0
            }}>
              Mapa de Calor
            </h1>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--text-muted)',
              margin: '4px 0 0 0'
            }}>
              Visualize a concentração de pedidos por região
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: showFilters ? 'rgba(22, 163, 74, 0.1)' : 'var(--card)',
              color: showFilters ? '#16a34a' : 'var(--text-color)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Filter style={{ width: '18px', height: '18px' }} />
            Filtros
          </button>

          <button
            onClick={geocodificarProvidencias}
            disabled={geocodificando || estatisticas.semCoordenadas === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: estatisticas.semCoordenadas > 0 ? '#16a34a' : 'var(--muted)',
              color: 'white',
              cursor: estatisticas.semCoordenadas > 0 ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
              opacity: geocodificando ? 0.7 : 1
            }}
          >
            <RefreshCw style={{ 
              width: '18px', 
              height: '18px',
              animation: geocodificando ? 'spin 1s linear infinite' : 'none'
            }} />
            {geocodificando ? 'Geocodificando...' : `Geocodificar (${estatisticas.semCoordenadas})`}
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="stat-card" style={{
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Layers style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>
                {estatisticas.total}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Total de Providências
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card" style={{
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle style={{ width: '20px', height: '20px', color: '#22c55e' }} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>
                {estatisticas.comCoordenadas}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Com Coordenadas
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card" style={{
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>
                {estatisticas.semCoordenadas}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Sem Coordenadas
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card" style={{
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>
                {estatisticas.total > 0 ? Math.round((estatisticas.comCoordenadas / estatisticas.total) * 100) : 0}%
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Taxa de Geocodificação
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border-color)',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: 'var(--text-color)',
            margin: '0 0 16px 0'
          }}>
            Filtros do Mapa
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {/* Status */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: 'var(--text-color)',
                marginBottom: '8px'
              }}>
                Status
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['pendente', 'em_analise', 'encaminhado', 'em_andamento', 'concluido'].map(status => (
                  <button
                    key={status}
                    onClick={() => toggleFiltro('status', status)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: filtros.status.includes(status) ? getStatusColor(status) : 'transparent',
                      color: filtros.status.includes(status) ? 'white' : 'var(--text-color)',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    {formatStatus(status)}
                  </button>
                ))}
              </div>
            </div>

            {/* Prioridade */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: 'var(--text-color)',
                marginBottom: '8px'
              }}>
                Prioridade
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['baixa', 'media', 'alta', 'urgente'].map(prioridade => (
                  <button
                    key={prioridade}
                    onClick={() => toggleFiltro('prioridade', prioridade)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: filtros.prioridade.includes(prioridade) ? '#16a34a' : 'transparent',
                      color: filtros.prioridade.includes(prioridade) ? 'white' : 'var(--text-color)',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    {formatPrioridade(prioridade)}
                  </button>
                ))}
              </div>
            </div>

            {/* Categoria */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: 'var(--text-color)',
                marginBottom: '8px'
              }}>
                Categoria
              </label>
              <select
                value={filtros.categoria_id}
                onChange={(e) => setFiltros(prev => ({ ...prev, categoria_id: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--text-color)',
                  fontSize: '14px'
                }}
              >
                <option value="">Todas as categorias</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>

            {/* Período */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: 'var(--text-color)',
                marginBottom: '8px'
              }}>
                Período
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="date"
                  value={filtros.periodo.inicio}
                  onChange={(e) => setFiltros(prev => ({ 
                    ...prev, 
                    periodo: { ...prev.periodo, inicio: e.target.value }
                  }))}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-color)',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="date"
                  value={filtros.periodo.fim}
                  onChange={(e) => setFiltros(prev => ({ 
                    ...prev, 
                    periodo: { ...prev.periodo, fim: e.target.value }
                  }))}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-color)',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Limpar filtros */}
          <button
            onClick={() => setFiltros({
              status: [],
              prioridade: [],
              categoria_id: '',
              periodo: { inicio: '', fim: '' }
            })}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Mapa */}
      <div style={{
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--card)'
      }}>
        {loading ? (
          <div style={{
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <RefreshCw style={{ 
              width: '32px', 
              height: '32px', 
              color: '#16a34a',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Carregando mapa...
            </p>
          </div>
        ) : false ? (
          <div style={{
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px',
            padding: '24px'
          }}>
            <AlertTriangle style={{ width: '48px', height: '48px', color: '#f59e0b' }} />
            <h3 style={{ color: 'var(--text-color)', margin: 0 }}>
              Chave da API do Google Maps não configurada
            </h3>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px' }}>
              Para utilizar o mapa de calor, é necessário configurar a variável de ambiente 
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY com uma chave válida da API do Google Maps.
            </p>
          </div>
        ) : (
          <div 
            ref={mapRef} 
            style={{ 
              height: '600px', 
              width: '100%' 
            }} 
          />
        )}
      </div>

      {/* Legenda */}
      <div style={{
        marginTop: '16px',
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border-color)'
      }}>
        <h4 style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: 'var(--text-color)',
          margin: '0 0 12px 0'
        }}>
          Legenda
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '100px', 
              height: '12px', 
              borderRadius: '6px',
              background: 'linear-gradient(to right, rgba(0, 255, 0, 1), rgba(255, 255, 0, 1), rgba(255, 165, 0, 1), rgba(255, 0, 0, 1))'
            }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Baixa → Alta concentração
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {[
              { status: 'pendente', label: 'Pendente' },
              { status: 'em_analise', label: 'Em Análise' },
              { status: 'em_andamento', label: 'Em Andamento' },
              { status: 'concluido', label: 'Concluído' }
            ].map(item => (
              <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(item.status)
                }} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
