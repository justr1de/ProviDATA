'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Search,
  FolderOpen,
  File,
  FileImage,
  FileSpreadsheet,
  Filter,
  Plus,
  X,
  Eye,
  Calendar,
  Tag
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'

interface Documento {
  id: string
  nome: string
  descricao: string | null
  arquivo_url: string
  arquivo_nome: string
  arquivo_tipo: string | null
  arquivo_tamanho: number | null
  categoria: string | null
  tags: string[] | null
  created_at: string
  created_by: string | null
}

const categorias = [
  'Ofícios',
  'Requerimentos',
  'Indicações',
  'Projetos de Lei',
  'Moções',
  'Atas',
  'Contratos',
  'Relatórios',
  'Outros'
]

const getFileIcon = (tipo: string | null) => {
  if (!tipo) return File
  if (tipo.includes('image')) return FileImage
  if (tipo.includes('spreadsheet') || tipo.includes('excel') || tipo.includes('csv')) return FileSpreadsheet
  if (tipo.includes('pdf') || tipo.includes('document') || tipo.includes('text')) return FileText
  return File
}

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadData, setUploadData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    tags: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { user } = useAuthStore()
  const supabase = createClient()

  // Buscar documentos
  const fetchDocumentos = async () => {
    if (!user?.tenant_id) return

    setLoading(true)
    try {
      let query = supabase
        .from('documentos')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false })

      if (selectedCategoria) {
        query = query.eq('categoria', selectedCategoria)
      }

      const { data, error } = await query

      if (error) throw error
      setDocumentos(data || [])
    } catch (error) {
      console.error('Erro ao buscar documentos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocumentos()
  }, [user?.tenant_id, selectedCategoria])

  // Filtrar documentos por busca
  const filteredDocumentos = documentos.filter(doc => 
    doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.arquivo_nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Upload de arquivo
  const handleUpload = async () => {
    if (!selectedFile || !user?.tenant_id || !uploadData.nome) {
      alert('Preencha o nome e selecione um arquivo')
      return
    }

    setUploading(true)
    try {
      // Upload do arquivo para o storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.tenant_id}/${Date.now()}_${selectedFile.name}`
      
      const { data: uploadResult, error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(fileName)

      // Salvar registro no banco
      const { error: dbError } = await supabase
        .from('documentos')
        .insert({
          tenant_id: user.tenant_id,
          nome: uploadData.nome,
          descricao: uploadData.descricao || null,
          arquivo_url: urlData.publicUrl,
          arquivo_nome: selectedFile.name,
          arquivo_tipo: selectedFile.type,
          arquivo_tamanho: selectedFile.size,
          categoria: uploadData.categoria || null,
          tags: uploadData.tags ? uploadData.tags.split(',').map(t => t.trim()) : null,
          created_by: user.id
        })

      if (dbError) throw dbError

      // Limpar e atualizar
      setShowUploadModal(false)
      setSelectedFile(null)
      setUploadData({ nome: '', descricao: '', categoria: '', tags: '' })
      fetchDocumentos()
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao fazer upload do arquivo')
    } finally {
      setUploading(false)
    }
  }

  // Excluir documento
  const handleDelete = async (doc: Documento) => {
    if (!confirm(`Deseja excluir o documento "${doc.nome}"?`)) return

    try {
      // Extrair caminho do arquivo da URL
      const urlParts = doc.arquivo_url.split('/documentos/')
      if (urlParts.length > 1) {
        await supabase.storage.from('documentos').remove([urlParts[1]])
      }

      // Excluir registro do banco
      const { error } = await supabase
        .from('documentos')
        .delete()
        .eq('id', doc.id)

      if (error) throw error
      
      fetchDocumentos()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir documento')
    }
  }

  // Estilos
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    overflow: 'hidden'
  }

  const cardHeaderStyle: React.CSSProperties = {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }

  const cardContentStyle: React.CSSProperties = {
    padding: '24px'
  }

  return (
    <div className="px-1 md:px-2">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FolderOpen style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
            <h1 className="text-xl md:text-2xl lg:text-[28px] font-bold" style={{ color: 'var(--foreground)' }}>
              Documentos
            </h1>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Plus style={{ width: '18px', height: '18px' }} />
            Novo Documento
          </button>
        </div>
        <p className="text-sm md:text-base" style={{ color: 'var(--foreground-muted)' }}>
          Gerencie os documentos e arquivos do gabinete
        </p>
      </div>

      {/* Filtros */}
      <div style={{ ...cardStyle, marginBottom: '24px' }}>
        <div style={{ padding: '16px 24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Busca */}
          <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
            <Search style={{ 
              position: 'absolute', 
              left: '14px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              color: 'var(--foreground-muted)'
            }} />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px 12px 44px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Filtro por categoria */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter style={{ width: '18px', height: '18px', color: 'var(--foreground-muted)' }} />
            <select
              value={selectedCategoria || ''}
              onChange={(e) => setSelectedCategoria(e.target.value || null)}
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                fontSize: '14px',
                minWidth: '150px'
              }}
            >
              <option value="">Todas categorias</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Documentos */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)' }}>
            {filteredDocumentos.length} documento{filteredDocumentos.length !== 1 ? 's' : ''} encontrado{filteredDocumentos.length !== 1 ? 's' : ''}
          </h2>
        </div>
        <div style={cardContentStyle}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--foreground-muted)' }}>
              Carregando documentos...
            </div>
          ) : filteredDocumentos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <FolderOpen style={{ width: '48px', height: '48px', color: 'var(--foreground-muted)', margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--foreground-muted)' }}>
                {searchTerm || selectedCategoria ? 'Nenhum documento encontrado com os filtros aplicados' : 'Nenhum documento cadastrado'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredDocumentos.map((doc) => {
                const FileIcon = getFileIcon(doc.arquivo_tipo)
                return (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--muted)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    {/* Ícone */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--primary-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FileIcon style={{ width: '24px', height: '24px', color: 'var(--primary)' }} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ 
                        fontSize: '15px', 
                        fontWeight: '600', 
                        color: 'var(--foreground)',
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {doc.nome}
                      </h3>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--foreground-muted)' }}>
                        <span>{doc.arquivo_nome}</span>
                        <span>{formatFileSize(doc.arquivo_tamanho)}</span>
                        {doc.categoria && (
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            backgroundColor: 'var(--primary-muted)',
                            color: 'var(--primary)',
                            fontSize: '12px'
                          }}>
                            {doc.categoria}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginTop: '4px' }}>
                        <Calendar style={{ width: '12px', height: '12px', display: 'inline', marginRight: '4px' }} />
                        {formatDate(doc.created_at)}
                      </div>
                    </div>

                    {/* Ações */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={doc.arquivo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--foreground)'
                        }}
                        title="Visualizar"
                      >
                        <Eye style={{ width: '18px', height: '18px' }} />
                      </a>
                      <a
                        href={doc.arquivo_url}
                        download={doc.arquivo_nome}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--primary)',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}
                        title="Baixar"
                      >
                        <Download style={{ width: '18px', height: '18px' }} />
                      </a>
                      <button
                        onClick={() => handleDelete(doc)}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ef4444'
                        }}
                        title="Excluir"
                      >
                        <Trash2 style={{ width: '18px', height: '18px' }} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Upload */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--card)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            {/* Header do Modal */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)' }}>
                Novo Documento
              </h2>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setSelectedFile(null)
                  setUploadData({ nome: '', descricao: '', categoria: '', tags: '' })
                }}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--foreground-muted)'
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Área de Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '32px',
                  borderRadius: '12px',
                  border: '2px dashed var(--border)',
                  backgroundColor: 'var(--muted)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setSelectedFile(file)
                      if (!uploadData.nome) {
                        setUploadData({ ...uploadData, nome: file.name.replace(/\.[^/.]+$/, '') })
                      }
                    }
                  }}
                  style={{ display: 'none' }}
                />
                {selectedFile ? (
                  <>
                    <FileText style={{ width: '40px', height: '40px', color: 'var(--primary)', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)' }}>
                      {selectedFile.name}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', marginTop: '4px' }}>
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </>
                ) : (
                  <>
                    <Upload style={{ width: '40px', height: '40px', color: 'var(--foreground-muted)', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '14px', color: 'var(--foreground-muted)' }}>
                      Clique para selecionar um arquivo
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginTop: '4px' }}>
                      PDF, DOC, XLS, TXT, CSV, PNG, JPG (máx. 10MB)
                    </p>
                  </>
                )}
              </div>

              {/* Nome */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>
                  Nome do documento *
                </label>
                <input
                  type="text"
                  value={uploadData.nome}
                  onChange={(e) => setUploadData({ ...uploadData, nome: e.target.value })}
                  placeholder="Ex: Ofício nº 001/2025"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Descrição */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>
                  Descrição
                </label>
                <textarea
                  value={uploadData.descricao}
                  onChange={(e) => setUploadData({ ...uploadData, descricao: e.target.value })}
                  placeholder="Descrição opcional do documento"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Categoria */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>
                  Categoria
                </label>
                <select
                  value={uploadData.categoria}
                  onChange={(e) => setUploadData({ ...uploadData, categoria: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={uploadData.tags}
                  onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                  placeholder="Ex: urgente, saúde, educação"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Botões */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setSelectedFile(null)
                    setUploadData({ nome: '', descricao: '', categoria: '', tags: '' })
                  }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--muted)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || !uploadData.nome || uploading}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: selectedFile && uploadData.nome ? 'var(--primary)' : 'var(--muted)',
                    color: selectedFile && uploadData.nome ? 'white' : 'var(--foreground-muted)',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: selectedFile && uploadData.nome ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {uploading ? (
                    <>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        border: '2px solid white',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload style={{ width: '18px', height: '18px' }} />
                      Enviar Documento
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
