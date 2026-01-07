'use client'

import { useState, useEffect } from 'react'
import { 
  Clock, 
  FileText, 
  Send, 
  MessageSquare, 
  CheckCircle, 
  RefreshCw,
  Paperclip,
  Download,
  Bell,
  Plus,
  Upload,
  X,
  Mail,
  Phone,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Anexo {
  id: string
  nome_original: string
  tipo_arquivo: string
  tamanho: number
  url_arquivo: string
  created_at: string
}

interface Andamento {
  id: string
  tipo_acao: string
  descricao: string
  status_anterior: string | null
  status_novo: string | null
  usuario_nome: string | null
  visivel_cidadao: boolean
  created_at: string
  anexos?: Anexo[]
}

interface TimelineAndamentosProps {
  providenciaId: string
  cidadaoNome?: string
  cidadaoEmail?: string
  cidadaoTelefone?: string
  onAndamentoAdded?: () => void
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

const statusOptions = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'encaminhado', label: 'Encaminhado' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluído' }
]

export function TimelineAndamentos({ 
  providenciaId, 
  cidadaoNome,
  cidadaoEmail,
  cidadaoTelefone,
  onAndamentoAdded 
}: TimelineAndamentosProps) {
  const [andamentos, setAndamentos] = useState<Andamento[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showNotifyForm, setShowNotifyForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [tipoAcao, setTipoAcao] = useState('comentario')
  const [descricao, setDescricao] = useState('')
  const [statusNovo, setStatusNovo] = useState('')
  const [visivelCidadao, setVisivelCidadao] = useState(true)
  const [notificarCidadao, setNotificarCidadao] = useState(false)
  const [arquivos, setArquivos] = useState<File[]>([])
  
  // Notify form state
  const [notifyMensagem, setNotifyMensagem] = useState('')
  const [notifyTipo, setNotifyTipo] = useState('email')
  const [incluirLink, setIncluirLink] = useState(true)
  
  const supabase = createClient()
  
  useEffect(() => {
    carregarAndamentos()
  }, [providenciaId])
  
  async function carregarAndamentos() {
    setLoading(true)
    try {
      const response = await fetch(`/api/andamentos?providencia_id=${providenciaId}`)
      const data = await response.json()
      
      if (data.andamentos) {
        setAndamentos(data.andamentos)
      }
    } catch (error) {
      console.error('Erro ao carregar andamentos:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!descricao.trim()) return
    
    setSubmitting(true)
    try {
      // Obter status atual da providência
      const { data: providencia } = await supabase
        .from('providencias')
        .select('status')
        .eq('id', providenciaId)
        .single()
      
      const response = await fetch('/api/andamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providencia_id: providenciaId,
          tipo_acao: tipoAcao,
          descricao,
          status_anterior: providencia?.status,
          status_novo: statusNovo || providencia?.status,
          visivel_cidadao: visivelCidadao,
          notificar_cidadao: notificarCidadao
        })
      })
      
      const data = await response.json()
      
      if (data.andamento) {
        // Se houver arquivos, fazer upload
        if (arquivos.length > 0) {
          for (const arquivo of arquivos) {
            const formData = new FormData()
            formData.append('file', arquivo)
            formData.append('andamento_id', data.andamento.id)
            
            await fetch('/api/andamentos/anexos', {
              method: 'POST',
              body: formData
            })
          }
        }
        
        // Limpar formulário
        setDescricao('')
        setStatusNovo('')
        setArquivos([])
        setShowForm(false)
        
        // Recarregar andamentos
        await carregarAndamentos()
        
        if (onAndamentoAdded) {
          onAndamentoAdded()
        }
      }
    } catch (error) {
      console.error('Erro ao criar andamento:', error)
    } finally {
      setSubmitting(false)
    }
  }
  
  async function handleNotificar(e: React.FormEvent) {
    e.preventDefault()
    if (!notifyMensagem.trim()) return
    
    setSubmitting(true)
    try {
      const response = await fetch('/api/notificacoes/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providencia_id: providenciaId,
          tipo_notificacao: notifyTipo,
          mensagem: notifyMensagem,
          incluir_link_acompanhamento: incluirLink
        })
      })
      
      const data = await response.json()
      
      if (data.notificacao) {
        setNotifyMensagem('')
        setShowNotifyForm(false)
        await carregarAndamentos()
        
        alert(data.envio?.success 
          ? 'Notificação enviada com sucesso!' 
          : 'Notificação registrada, mas houve erro no envio.')
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
    } finally {
      setSubmitting(false)
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
  
  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }
  
  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <p style={{ marginTop: '12px', color: 'var(--foreground-muted)' }}>Carregando histórico...</p>
      </div>
    )
  }
  
  return (
    <div style={{ padding: '16px' }}>
      {/* Header com botões de ação */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: 'var(--foreground)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Clock style={{ width: '20px', height: '20px' }} />
          Histórico de Andamentos
        </h3>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {(cidadaoEmail || cidadaoTelefone) && (
            <button
              onClick={() => setShowNotifyForm(!showNotifyForm)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--muted)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <Bell style={{ width: '16px', height: '16px' }} />
              Notificar Cidadão
            </button>
          )}
          
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Novo Andamento
          </button>
        </div>
      </div>
      
      {/* Formulário de notificação */}
      {showNotifyForm && (
        <form onSubmit={handleNotificar} style={{
          backgroundColor: 'var(--muted)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)' }}>
              Notificar {cidadaoNome || 'Cidadão'}
            </h4>
            <button type="button" onClick={() => setShowNotifyForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X style={{ width: '20px', height: '20px', color: 'var(--foreground-muted)' }} />
            </button>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: 'var(--foreground)' }}>
              Canal de Notificação
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {cidadaoEmail && (
                <button
                  type="button"
                  onClick={() => setNotifyTipo('email')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: notifyTipo === 'email' ? 'var(--primary)' : 'var(--background)',
                    border: '1px solid var(--border)',
                    color: notifyTipo === 'email' ? 'white' : 'var(--foreground)',
                    cursor: 'pointer'
                  }}
                >
                  <Mail style={{ width: '16px', height: '16px' }} />
                  Email
                </button>
              )}
              {cidadaoTelefone && (
                <button
                  type="button"
                  onClick={() => setNotifyTipo('whatsapp')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: notifyTipo === 'whatsapp' ? 'var(--primary)' : 'var(--background)',
                    border: '1px solid var(--border)',
                    color: notifyTipo === 'whatsapp' ? 'white' : 'var(--foreground)',
                    cursor: 'pointer'
                  }}
                >
                  <Phone style={{ width: '16px', height: '16px' }} />
                  WhatsApp
                </button>
              )}
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: 'var(--foreground)' }}>
              Mensagem
            </label>
            <textarea
              value={notifyMensagem}
              onChange={(e) => setNotifyMensagem(e.target.value)}
              placeholder="Digite a mensagem para o cidadão..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={incluirLink}
                onChange={(e) => setIncluirLink(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>
                Incluir link para acompanhamento em tempo real
              </span>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={submitting || !notifyMensagem.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'Enviando...' : 'Enviar Notificação'}
          </button>
        </form>
      )}
      
      {/* Formulário de novo andamento */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'var(--muted)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)' }}>Novo Andamento</h4>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X style={{ width: '20px', height: '20px', color: 'var(--foreground-muted)' }} />
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: 'var(--foreground)' }}>
                Tipo de Ação
              </label>
              <select
                value={tipoAcao}
                onChange={(e) => setTipoAcao(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                  fontSize: '14px'
                }}
              >
                <option value="comentario">Comentário</option>
                <option value="atualizacao">Atualização</option>
                <option value="encaminhamento">Encaminhamento</option>
                <option value="resposta">Resposta do Órgão</option>
                <option value="documento">Documento Anexado</option>
                <option value="conclusao">Conclusão</option>
                <option value="reabertura">Reabertura</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: 'var(--foreground)' }}>
                Alterar Status (opcional)
              </label>
              <select
                value={statusNovo}
                onChange={(e) => setStatusNovo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                  fontSize: '14px'
                }}
              >
                <option value="">Manter status atual</option>
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: 'var(--foreground)' }}>
              Descrição
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o andamento..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: 'var(--foreground)' }}>
              Anexar Documentos
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setArquivos(Array.from(e.target.files || []))}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px dashed var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                fontSize: '14px'
              }}
            />
            {arquivos.length > 0 && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--foreground-muted)' }}>
                {arquivos.length} arquivo(s) selecionado(s)
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={visivelCidadao}
                onChange={(e) => setVisivelCidadao(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>
                Visível para o cidadão
              </span>
            </label>
            
            {(cidadaoEmail || cidadaoTelefone) && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notificarCidadao}
                  onChange={(e) => setNotificarCidadao(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>
                  Notificar cidadão
                </span>
              </label>
            )}
          </div>
          
          <button
            type="submit"
            disabled={submitting || !descricao.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'Salvando...' : 'Salvar Andamento'}
          </button>
        </form>
      )}
      
      {/* Timeline */}
      {andamentos.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 24px',
          backgroundColor: 'var(--muted)',
          borderRadius: '12px'
        }}>
          <Clock style={{ width: '48px', height: '48px', color: 'var(--foreground-muted)', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--foreground-muted)', fontSize: '15px' }}>
            Nenhum andamento registrado ainda.
          </p>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Linha vertical da timeline */}
          <div style={{
            position: 'absolute',
            left: '20px',
            top: '0',
            bottom: '0',
            width: '2px',
            backgroundColor: 'var(--border)'
          }} />
          
          {andamentos.map((andamento, index) => {
            const config = tipoAcaoConfig[andamento.tipo_acao] || tipoAcaoConfig.comentario
            const Icon = config.icon
            
            return (
              <div key={andamento.id} style={{
                position: 'relative',
                paddingLeft: '56px',
                paddingBottom: index === andamentos.length - 1 ? '0' : '24px'
              }}>
                {/* Ícone da timeline */}
                <div style={{
                  position: 'absolute',
                  left: '8px',
                  top: '0',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: config.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}>
                  <Icon style={{ width: '14px', height: '14px', color: 'white' }} />
                </div>
                
                {/* Card do andamento */}
                <div style={{
                  backgroundColor: 'var(--muted)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: `${config.color}20`,
                        color: config.color,
                        fontSize: '12px',
                        fontWeight: '600',
                        marginBottom: '4px'
                      }}>
                        {config.label}
                      </span>
                      
                      {andamento.status_novo && andamento.status_novo !== andamento.status_anterior && (
                        <span style={{
                          display: 'inline-block',
                          marginLeft: '8px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--primary-muted)',
                          color: 'var(--primary)',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {andamento.status_anterior} → {andamento.status_novo}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      fontSize: '12px',
                      color: 'var(--foreground-muted)'
                    }}>
                      {!andamento.visivel_cidadao && (
                        <span title="Não visível para o cidadão" style={{ opacity: 0.6 }}>🔒</span>
                      )}
                      <Clock style={{ width: '12px', height: '12px' }} />
                      {formatDate(andamento.created_at)}
                    </div>
                  </div>
                  
                  <p style={{ 
                    fontSize: '14px', 
                    color: 'var(--foreground)',
                    lineHeight: '1.5',
                    marginBottom: andamento.usuario_nome || (andamento.anexos && andamento.anexos.length > 0) ? '12px' : '0'
                  }}>
                    {andamento.descricao}
                  </p>
                  
                  {/* Anexos */}
                  {andamento.anexos && andamento.anexos.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '8px' 
                      }}>
                        {andamento.anexos.map(anexo => (
                          <a
                            key={anexo.id}
                            href={anexo.url_arquivo}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              backgroundColor: 'var(--background)',
                              border: '1px solid var(--border)',
                              color: 'var(--foreground)',
                              fontSize: '13px',
                              textDecoration: 'none'
                            }}
                          >
                            <Paperclip style={{ width: '14px', height: '14px' }} />
                            {anexo.nome_original}
                            <span style={{ color: 'var(--foreground-muted)', fontSize: '11px' }}>
                              ({formatFileSize(anexo.tamanho)})
                            </span>
                            <Download style={{ width: '14px', height: '14px', color: 'var(--primary)' }} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {andamento.usuario_nome && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--foreground-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      Por: {andamento.usuario_nome}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
