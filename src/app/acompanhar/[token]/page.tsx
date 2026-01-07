'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  Clock, 
  FileText, 
  Send, 
  MessageSquare, 
  CheckCircle, 
  RefreshCw,
  Paperclip,
  Download,
  AlertCircle,
  Plus,
  Bell,
  MapPin,
  User,
  Building,
  Tag,
  Calendar,
  Shield
} from 'lucide-react'

interface Anexo {
  id: string
  nome_original: string
  tipo_arquivo: string
  tamanho: number
  url_arquivo: string
}

interface Andamento {
  id: string
  tipo_acao: string
  descricao: string
  status_anterior: string | null
  status_novo: string | null
  created_at: string
  anexos?: Anexo[]
}

interface Providencia {
  id: string
  protocolo: string
  titulo: string
  descricao: string
  status: string
  prioridade: string
  created_at: string
  updated_at: string
  cidadao_nome: string
  orgao_nome: string
  categoria_nome: string
  gabinete_nome: string
  parlamentar: string
}

interface TokenInfo {
  criado_em: string
  expira_em: string
  total_acessos: number
}

const tipoAcaoConfig: Record<string, { icon: any; color: string; label: string }> = {
  criacao: { icon: Plus, color: '#16a34a', label: 'Criação' },
  atualizacao: { icon: RefreshCw, color: '#6366f1', label: 'Atualização' },
  encaminhamento: { icon: Send, color: '#f59e0b', label: 'Encaminhamento' },
  resposta: { icon: MessageSquare, color: '#8b5cf6', label: 'Resposta' },
  documento: { icon: FileText, color: '#0ea5e9', label: 'Documento' },
  comentario: { icon: MessageSquare, color: '#64748b', label: 'Comentário' },
  conclusao: { icon: CheckCircle, color: '#16a34a', label: 'Conclusão' },
  reabertura: { icon: AlertCircle, color: '#ef4444', label: 'Reabertura' },
  notificacao: { icon: Bell, color: '#ec4899', label: 'Notificação' }
}

const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  pendente: { color: '#f59e0b', bgColor: '#fef3c7', label: 'Pendente' },
  em_analise: { color: '#6366f1', bgColor: '#e0e7ff', label: 'Em Análise' },
  encaminhado: { color: '#8b5cf6', bgColor: '#ede9fe', label: 'Encaminhado' },
  em_andamento: { color: '#0ea5e9', bgColor: '#e0f2fe', label: 'Em Andamento' },
  concluido: { color: '#16a34a', bgColor: '#dcfce7', label: 'Concluído' }
}

export default function AcompanharProvidencia() {
  const params = useParams()
  const token = params.token as string
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [providencia, setProvidencia] = useState<Providencia | null>(null)
  const [andamentos, setAndamentos] = useState<Andamento[]>([])
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  
  useEffect(() => {
    carregarDados()
  }, [token])
  
  async function carregarDados() {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/public/acompanhar?token=${token}`)
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setProvidencia(data.providencia)
        setAndamentos(data.andamentos || [])
        setTokenInfo(data.token_info)
      }
    } catch (err) {
      setError('Erro ao carregar dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }
  
  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  function formatDateShort(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '4px solid #334155',
            borderTopColor: '#22c55e',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>Carregando sua providência...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }
  
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '24px'
      }}>
        <div style={{ 
          textAlign: 'center',
          maxWidth: '400px',
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          padding: '48px 32px',
          border: '1px solid #334155'
        }}>
          <AlertCircle style={{ width: '64px', height: '64px', color: '#ef4444', margin: '0 auto 24px' }} />
          <h1 style={{ color: '#f8fafc', fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
            Link Inválido
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.6' }}>
            {error}
          </p>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '24px' }}>
            Se você recebeu este link por email ou mensagem, entre em contato com o gabinete para obter um novo link de acesso.
          </p>
        </div>
      </div>
    )
  }
  
  if (!providencia) return null
  
  const statusInfo = statusConfig[providencia.status] || statusConfig.pendente
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#f8fafc' }}>
                ProviDATA
              </h1>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                Acompanhamento de Providência
              </p>
            </div>
          </div>
        </div>
      </header>
      
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
        {/* Card Principal */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          border: '1px solid #334155',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          {/* Status Banner */}
          <div style={{
            backgroundColor: statusInfo.bgColor,
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: statusInfo.color
              }} />
              <span style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: statusInfo.color 
              }}>
                {statusInfo.label}
              </span>
            </div>
            <span style={{ fontSize: '14px', color: '#64748b' }}>
              Protocolo: <strong style={{ color: '#1e293b' }}>{providencia.protocolo}</strong>
            </span>
          </div>
          
          {/* Conteúdo */}
          <div style={{ padding: '24px' }}>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: '600', 
              color: '#f8fafc',
              marginBottom: '12px'
            }}>
              {providencia.titulo}
            </h2>
            
            <p style={{ 
              fontSize: '15px', 
              color: '#94a3b8', 
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              {providencia.descricao}
            </p>
            
            {/* Informações */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User style={{ width: '18px', height: '18px', color: '#64748b' }} />
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>Solicitante</p>
                  <p style={{ fontSize: '14px', color: '#f8fafc' }}>{providencia.cidadao_nome}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building style={{ width: '18px', height: '18px', color: '#64748b' }} />
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>Órgão Destinatário</p>
                  <p style={{ fontSize: '14px', color: '#f8fafc' }}>{providencia.orgao_nome || 'Não definido'}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Tag style={{ width: '18px', height: '18px', color: '#64748b' }} />
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>Categoria</p>
                  <p style={{ fontSize: '14px', color: '#f8fafc' }}>{providencia.categoria_nome || 'Não definida'}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar style={{ width: '18px', height: '18px', color: '#64748b' }} />
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>Data de Abertura</p>
                  <p style={{ fontSize: '14px', color: '#f8fafc' }}>{formatDateShort(providencia.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Gabinete */}
          <div style={{
            backgroundColor: '#0f172a',
            padding: '16px 24px',
            borderTop: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <MapPin style={{ width: '18px', height: '18px', color: '#22c55e' }} />
            <div>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Gabinete Responsável</p>
              <p style={{ fontSize: '14px', color: '#f8fafc' }}>
                {providencia.gabinete_nome} - {providencia.parlamentar}
              </p>
            </div>
          </div>
        </div>
        
        {/* Timeline de Andamentos */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          border: '1px solid #334155',
          padding: '24px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#f8fafc',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Clock style={{ width: '20px', height: '20px', color: '#22c55e' }} />
            Histórico de Andamentos
          </h3>
          
          {andamentos.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '48px 24px',
              backgroundColor: '#0f172a',
              borderRadius: '12px'
            }}>
              <Clock style={{ width: '48px', height: '48px', color: '#475569', margin: '0 auto 16px' }} />
              <p style={{ color: '#64748b', fontSize: '15px' }}>
                Aguardando atualizações do gabinete.
              </p>
              <p style={{ color: '#475569', fontSize: '13px', marginTop: '8px' }}>
                Você receberá uma notificação quando houver novidades.
              </p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Linha vertical */}
              <div style={{
                position: 'absolute',
                left: '15px',
                top: '0',
                bottom: '0',
                width: '2px',
                backgroundColor: '#334155'
              }} />
              
              {andamentos.map((andamento, index) => {
                const config = tipoAcaoConfig[andamento.tipo_acao] || tipoAcaoConfig.comentario
                const Icon = config.icon
                
                return (
                  <div key={andamento.id} style={{
                    position: 'relative',
                    paddingLeft: '48px',
                    paddingBottom: index === andamentos.length - 1 ? '0' : '24px'
                  }}>
                    {/* Ícone */}
                    <div style={{
                      position: 'absolute',
                      left: '4px',
                      top: '0',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: config.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1
                    }}>
                      <Icon style={{ width: '12px', height: '12px', color: 'white' }} />
                    </div>
                    
                    {/* Card */}
                    <div style={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid #334155'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: `${config.color}20`,
                          color: config.color,
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {config.label}
                        </span>
                        
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Clock style={{ width: '12px', height: '12px' }} />
                          {formatDate(andamento.created_at)}
                        </span>
                      </div>
                      
                      {andamento.status_novo && andamento.status_novo !== andamento.status_anterior && (
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: '#22c55e20',
                          color: '#22c55e',
                          fontSize: '12px',
                          fontWeight: '500',
                          marginBottom: '8px'
                        }}>
                          Status alterado: {statusConfig[andamento.status_anterior || '']?.label || andamento.status_anterior} → {statusConfig[andamento.status_novo]?.label || andamento.status_novo}
                        </div>
                      )}
                      
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#e2e8f0',
                        lineHeight: '1.5'
                      }}>
                        {andamento.descricao}
                      </p>
                      
                      {/* Anexos */}
                      {andamento.anexos && andamento.anexos.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          {andamento.anexos.map(anexo => (
                            <a
                              key={anexo.id}
                              href={anexo.url_arquivo}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                color: '#e2e8f0',
                                fontSize: '13px',
                                textDecoration: 'none',
                                marginRight: '8px',
                                marginBottom: '8px'
                              }}
                            >
                              <Paperclip style={{ width: '14px', height: '14px' }} />
                              {anexo.nome_original}
                              <span style={{ color: '#64748b', fontSize: '11px' }}>
                                ({formatFileSize(anexo.tamanho)})
                              </span>
                              <Download style={{ width: '14px', height: '14px', color: '#22c55e' }} />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        
        {/* Footer Info */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Esta página é atualizada automaticamente. Última atualização: {formatDate(providencia.updated_at)}
          </p>
          {tokenInfo && (
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '8px' }}>
              Link válido até {formatDateShort(tokenInfo.expira_em)} • {tokenInfo.total_acessos} acessos
            </p>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer style={{
        backgroundColor: '#1e293b',
        borderTop: '1px solid #334155',
        padding: '24px',
        marginTop: '48px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          ProviDATA — Gestão de Pedidos de Providências Parlamentares
        </p>
        <p style={{ fontSize: '12px', color: '#475569', marginTop: '8px' }}>
          A EVOLUÇÃO da OUVIDORIA, em QUALQUER LUGAR e à QUALQUER HORA
        </p>
      </footer>
    </div>
  )
}
