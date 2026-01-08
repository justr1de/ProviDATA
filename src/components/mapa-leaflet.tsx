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
  municipio?: string
}

// Centros dos municípios brasileiros (adicionar conforme necessário)
const municipiosCentros: Record<string, { lat: number; lng: number; zoom: number }> = {
  // Bahia
  'livramento de nossa senhora': { lat: -13.6432, lng: -41.8422, zoom: 13 },
  'salvador': { lat: -12.9714, lng: -38.5014, zoom: 12 },
  'feira de santana': { lat: -12.2667, lng: -38.9667, zoom: 12 },
  // Rondônia - Todos os 52 municípios
  'alta floresta d\'oeste': { lat: -11.9283, lng: -61.9953, zoom: 13 },
  'alto alegre dos parecis': { lat: -12.132, lng: -61.835, zoom: 13 },
  'alto paraíso': { lat: -9.7143, lng: -63.3188, zoom: 13 },
  'alvorada d\'oeste': { lat: -11.3463, lng: -62.2847, zoom: 13 },
  'ariquemes': { lat: -9.9057, lng: -63.0325, zoom: 12 },
  'buritis': { lat: -10.1943, lng: -63.8324, zoom: 13 },
  'cabixi': { lat: -13.4945, lng: -60.552, zoom: 13 },
  'cacaulândia': { lat: -10.349, lng: -62.9043, zoom: 13 },
  'cacoal': { lat: -11.4343, lng: -61.4562, zoom: 12 },
  'campo novo de rondônia': { lat: -10.5712, lng: -63.6266, zoom: 13 },
  'candeias do jamari': { lat: -8.7907, lng: -63.7005, zoom: 13 },
  'castanheiras': { lat: -11.4253, lng: -61.9482, zoom: 13 },
  'cerejeiras': { lat: -13.187, lng: -60.8168, zoom: 13 },
  'chupinguaia': { lat: -12.5611, lng: -60.8877, zoom: 13 },
  'colorado do oeste': { lat: -13.1174, lng: -60.5454, zoom: 13 },
  'corumbiara': { lat: -12.9551, lng: -60.8947, zoom: 13 },
  'costa marques': { lat: -12.4367, lng: -64.228, zoom: 13 },
  'cujubim': { lat: -9.3607, lng: -62.5846, zoom: 13 },
  'espigão d\'oeste': { lat: -11.5266, lng: -61.0252, zoom: 13 },
  'governador jorge teixeira': { lat: -10.61, lng: -62.7371, zoom: 13 },
  'guajará-mirim': { lat: -10.7889, lng: -65.3296, zoom: 12 },
  'itapuã do oeste': { lat: -9.1969, lng: -63.1809, zoom: 13 },
  'jaru': { lat: -10.4318, lng: -62.4788, zoom: 12 },
  'ji-paraná': { lat: -10.8777, lng: -61.9322, zoom: 12 },
  'machadinho d\'oeste': { lat: -9.4436, lng: -61.9818, zoom: 13 },
  'ministro andreazza': { lat: -11.196, lng: -61.5174, zoom: 13 },
  'mirante da serra': { lat: -11.029, lng: -62.6696, zoom: 13 },
  'monte negro': { lat: -10.2458, lng: -63.29, zoom: 13 },
  'nova brasilândia d\'oeste': { lat: -11.7247, lng: -62.3127, zoom: 13 },
  'nova mamoré': { lat: -10.4077, lng: -65.3346, zoom: 13 },
  'nova união': { lat: -10.9068, lng: -62.5564, zoom: 13 },
  'novo horizonte do oeste': { lat: -11.6961, lng: -61.9951, zoom: 13 },
  'ouro preto do oeste': { lat: -10.7167, lng: -62.2565, zoom: 12 },
  'parecis': { lat: -12.1754, lng: -61.6032, zoom: 13 },
  'pimenta bueno': { lat: -11.672, lng: -61.198, zoom: 12 },
  'pimenteiras do oeste': { lat: -13.4823, lng: -61.0471, zoom: 13 },
  'porto velho': { lat: -8.7608, lng: -63.8999, zoom: 12 },
  'presidente médici': { lat: -11.169, lng: -61.8986, zoom: 13 },
  'primavera de rondônia': { lat: -11.8295, lng: -61.3153, zoom: 13 },
  'rio crespo': { lat: -9.6997, lng: -62.9011, zoom: 13 },
  'rolim de moura': { lat: -11.7271, lng: -61.7714, zoom: 12 },
  'santa luzia d\'oeste': { lat: -11.9074, lng: -61.7777, zoom: 13 },
  'seringueiras': { lat: -11.8055, lng: -63.0182, zoom: 13 },
  'são felipe d\'oeste': { lat: -11.9023, lng: -61.5026, zoom: 13 },
  'são francisco do guaporé': { lat: -12.052, lng: -63.568, zoom: 13 },
  'são miguel do guaporé': { lat: -11.6953, lng: -62.7192, zoom: 13 },
  'teixeirópolis': { lat: -10.9056, lng: -62.242, zoom: 13 },
  'theobroma': { lat: -10.2483, lng: -62.3538, zoom: 13 },
  'urupá': { lat: -11.1261, lng: -62.3639, zoom: 13 },
  'vale do anari': { lat: -9.8622, lng: -62.1876, zoom: 13 },
  'vale do paraíso': { lat: -10.4465, lng: -62.1352, zoom: 13 },
  'vilhena': { lat: -12.7502, lng: -60.1488, zoom: 12 },
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

export default function MapaLeaflet({ providencias, uf = 'RO', municipio }: MapaLeafletProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.CircleMarker[]>([])
  const [mapReady, setMapReady] = useState(false)

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Determinar centro do mapa - prioridade: município > estado
    let center = estadosCentros[uf] || estadosCentros['RO']
    let usarMunicipio = false
    
    // Se tiver município configurado, usar como centro prioritário
    if (municipio) {
      const municipioNormalizado = municipio.toLowerCase().trim()
      if (municipiosCentros[municipioNormalizado]) {
        center = municipiosCentros[municipioNormalizado]
        usarMunicipio = true
      }
    }
    
    // Se não tiver município configurado e tiver providências, centralizar nelas
    if (!usarMunicipio && providencias.length > 0) {
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

    // Não ajustar bounds automaticamente - manter o centro do município
    // O usuário pode navegar manualmente pelo mapa

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
