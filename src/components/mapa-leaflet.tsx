'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix para ícones do Leaflet no Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface Providencia {
  id: string
  titulo: string
  latitude: number
  longitude: number
  status: string
  prioridade: string
  localizacao_descricao?: string
  cidadao?: { nome: string } | null
  categoria?: { nome: string } | null
}

interface MapaLeafletProps {
  providencias: Providencia[]
  uf?: string
}

// Centros dos estados brasileiros
const estadosCentros: Record<string, { lat: number; lng: number; zoom: number }> = {
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

// Cores por status
const statusColors: Record<string, string> = {
  pendente: '#f59e0b',
  em_analise: '#3b82f6',
  em_andamento: '#8b5cf6',
  concluida: '#22c55e',
  arquivada: '#6b7280'
}

// Labels de status
const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  em_analise: 'Em Análise',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  arquivada: 'Arquivada'
}

export default function MapaLeaflet({ providencias, uf = 'RO' }: MapaLeafletProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.CircleMarker[]>([])
  const [mapReady, setMapReady] = useState(false)

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Determinar centro do mapa
    let center = estadosCentros[uf] || estadosCentros['RO']
    
    // Se tiver providências, centralizar nelas
    if (providencias.length > 0) {
      const lats = providencias.map(p => p.latitude)
      const lngs = providencias.map(p => p.longitude)
      const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length
      const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length
      center = { lat: avgLat, lng: avgLng, zoom: 12 }
    }

    // Criar mapa
    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: center.zoom,
      zoomControl: true,
      scrollWheelZoom: true
    })

    // Adicionar camada de tiles (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map)

    mapInstanceRef.current = map
    setMapReady(true)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Atualizar marcadores quando providências mudarem
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return

    const map = mapInstanceRef.current

    // Limpar marcadores existentes
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    if (providencias.length === 0) return

    // Criar marcadores para cada providência
    providencias.forEach(p => {
      const color = statusColors[p.status] || '#6b7280'
      
      // Criar marcador circular
      const marker = L.circleMarker([p.latitude, p.longitude], {
        radius: p.prioridade === 'urgente' ? 12 : p.prioridade === 'alta' ? 10 : p.prioridade === 'media' ? 8 : 6,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      })

      // Popup com informações
      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui, sans-serif;">
          <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1f2937;">
            ${p.titulo}
          </h4>
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #6b7280;">
            <p style="margin: 0;">
              <strong>Status:</strong> 
              <span style="color: ${color}; font-weight: 500;">${statusLabels[p.status] || p.status}</span>
            </p>
            <p style="margin: 0;">
              <strong>Prioridade:</strong> ${p.prioridade}
            </p>
            ${p.cidadao?.nome ? `<p style="margin: 0;"><strong>Cidadão:</strong> ${p.cidadao.nome}</p>` : ''}
            ${p.categoria?.nome ? `<p style="margin: 0;"><strong>Categoria:</strong> ${p.categoria.nome}</p>` : ''}
            ${p.localizacao_descricao ? `<p style="margin: 0;"><strong>Localização:</strong> ${p.localizacao_descricao}</p>` : ''}
          </div>
        </div>
      `

      marker.bindPopup(popupContent)
      marker.addTo(map)
      markersRef.current.push(marker)
    })

    // Ajustar visualização para mostrar todos os marcadores
    if (providencias.length > 0) {
      const bounds = L.latLngBounds(providencias.map(p => [p.latitude, p.longitude]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
    }

  }, [providencias, mapReady])

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '500px', 
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#e5e7eb'
      }} 
    />
  )
}
