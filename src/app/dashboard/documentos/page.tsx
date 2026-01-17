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
  FileVideo,
  FileSpreadsheet,
  Filter,
  Plus,
  X,
  Eye,
  Calendar,
  Tag,
  Folder,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  Edit2,
  Flag,
  AlertCircle,
  Settings,
  HelpCircle,
  ArrowLeft,
  MoreVertical,
  Move,
  Info
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
  folder_id: string | null
  flag_id: string | null
  created_at: string
  created_by: string | null
}

interface DocumentFolder {
  id: string
  gabinete_id: string
  nome: string
  descricao: string | null
  cor: string
  icone: string
  parent_id: string | null
  created_at: string
}

interface DocumentFlag {
  id: string
  gabinete_id: string
  nome: string
  cor: string
  descricao: string | null
  created_at: string
}

interface UploadLimits {
  max_video_size_mb: number
  max_video_count: number
  max_image_size_mb: number
  max_image_count: number
  max_document_size_mb: number
  max_document_count: number
}

interface UsageStats {
  videoCount: number
  imageCount: number
  documentCount: number
}

const defaultLimits: UploadLimits = {
  max_video_size_mb: 10,
  max_video_count: 30,
  max_image_size_mb: 3,
  max_image_count: 100,
  max_document_size_mb: 10,
  max_document_count: 500
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

const flagColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
]

const getFileIcon = (tipo: string | null) => {
  if (!tipo) return File
  if (tipo.includes('video')) return FileVideo
  if (tipo.includes('image')) return FileImage
  if (tipo.includes('spreadsheet') || tipo.includes('excel') || tipo.includes('csv')) return FileSpreadsheet
  if (tipo.includes('pdf') || tipo.includes('document') || tipo.includes('text')) return FileText
  return File
}

const getFileType = (mimeType: string | null): 'video' | 'image' | 'document' => {
  if (!mimeType) return 'document'
  if (mimeType.includes('video')) return 'video'
  if (mimeType.includes('image')) return 'image'
  return 'document'
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
  const [folders, setFolders] = useState<DocumentFolder[]>([])
  const [flags, setFlags] = useState<DocumentFlag[]>([])
  const [limits, setLimits] = useState<UploadLimits>(defaultLimits)
  const [usageStats, setUsageStats] = useState<UsageStats>({ videoCount: 0, imageCount: 0, documentCount: 0 })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null)
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [folderPath, setFolderPath] = useState<DocumentFolder[]>([])
  
  // Modais
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [showFlagModal, setShowFlagModal] = useState(false)
  const [showLimitRequestModal, setShowLimitRequestModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [showLimitsInfo, setShowLimitsInfo] = useState(false)
  
  // Dados de formulário
  const [uploadData, setUploadData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    tags: '',
    flag_id: ''
  })
  const [folderData, setFolderData] = useState({ nome: '', descricao: '', cor: '#3B82F6' })
  const [flagData, setFlagData] = useState({ nome: '', descricao: '', cor: '#6366F1' })
  const [limitRequestData, setLimitRequestData] = useState({
    tipo_arquivo: 'video' as 'video' | 'image' | 'document',
    tipo_solicitacao: 'size' as 'size' | 'count',
    valor_solicitado: 0,
    justificativa: ''
  })
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editingFolder, setEditingFolder] = useState<DocumentFolder | null>(null)
  const [editingFlag, setEditingFlag] = useState<DocumentFlag | null>(null)
  const [documentToMove, setDocumentToMove] = useState<Documento | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { user } = useAuthStore()
  const supabase = createClient()

  // Buscar dados iniciais
  useEffect(() => {
    if (user?.gabinete_id) {
      fetchFolders()
      fetchFlags()
      fetchLimits()
      fetchUsageStats()
    }
  }, [user?.gabinete_id])

  // Buscar documentos quando mudar pasta ou filtros
  useEffect(() => {
    if (user?.gabinete_id) {
      fetchDocumentos()
    }
  }, [user?.gabinete_id, currentFolderId, selectedCategoria, selectedFlag])

  // Atualizar caminho da pasta
  useEffect(() => {
    updateFolderPath()
  }, [currentFolderId, folders])

  const fetchFolders = async () => {
    if (!user?.gabinete_id) return
    try {
      const { data, error } = await supabase
        .from('document_folders')
        .select('*')
        .eq('gabinete_id', user.gabinete_id)
        .order('nome')
      if (error) throw error
      setFolders(data || [])
    } catch (error) {
      console.error('Erro ao buscar pastas:', error)
    }
  }

  const fetchFlags = async () => {
    if (!user?.gabinete_id) return
    try {
      const { data, error } = await supabase
        .from('document_flags')
        .select('*')
        .eq('gabinete_id', user.gabinete_id)
        .order('nome')
      if (error) throw error
      setFlags(data || [])
    } catch (error) {
      console.error('Erro ao buscar flags:', error)
    }
  }

  const fetchLimits = async () => {
    if (!user?.gabinete_id) return
    try {
      const { data, error } = await supabase
        .from('upload_limits')
        .select('*')
        .eq('gabinete_id', user.gabinete_id)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      if (data) {
        setLimits(data)
      }
    } catch (error) {
      console.error('Erro ao buscar limites:', error)
    }
  }

  const fetchUsageStats = async () => {
    if (!user?.gabinete_id) return
    try {
      const { data, error } = await supabase
        .from('documentos')
        .select('arquivo_tipo')
        .eq('gabinete_id', user.gabinete_id)
      if (error) throw error
      
      const stats = { videoCount: 0, imageCount: 0, documentCount: 0 }
      data?.forEach(doc => {
        const type = getFileType(doc.arquivo_tipo)
        if (type === 'video') stats.videoCount++
        else if (type === 'image') stats.imageCount++
        else stats.documentCount++
      })
      setUsageStats(stats)
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    }
  }

  const fetchDocumentos = async () => {
    if (!user?.gabinete_id) return
    setLoading(true)
    try {
      let query = supabase
        .from('documentos')
        .select('*')
        .eq('gabinete_id', user.gabinete_id)
        .order('created_at', { ascending: false })

      if (currentFolderId) {
        query = query.eq('folder_id', currentFolderId)
      } else {
        query = query.is('folder_id', null)
      }

      if (selectedCategoria) {
        query = query.eq('categoria', selectedCategoria)
      }

      if (selectedFlag) {
        query = query.eq('flag_id', selectedFlag)
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

  const updateFolderPath = () => {
    if (!currentFolderId) {
      setFolderPath([])
      return
    }
    
    const path: DocumentFolder[] = []
    let current = folders.find(f => f.id === currentFolderId)
    while (current) {
      path.unshift(current)
      current = current.parent_id ? folders.find(f => f.id === current!.parent_id) : undefined
    }
    setFolderPath(path)
  }

  // Filtrar documentos por busca
  const filteredDocumentos = documentos.filter(doc => 
    doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.arquivo_nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Subpastas da pasta atual
  const currentSubfolders = folders.filter(f => 
    currentFolderId ? f.parent_id === currentFolderId : !f.parent_id
  )

  // Validar upload
  const validateUpload = (file: File): { valid: boolean; error?: string } => {
    const fileType = getFileType(file.type)
    const fileSizeMB = file.size / (1024 * 1024)
    
    if (fileType === 'video') {
      if (fileSizeMB > limits.max_video_size_mb) {
        return { valid: false, error: `Vídeos devem ter no máximo ${limits.max_video_size_mb}MB. Este arquivo tem ${fileSizeMB.toFixed(1)}MB.` }
      }
      if (usageStats.videoCount >= limits.max_video_count) {
        return { valid: false, error: `Limite de ${limits.max_video_count} vídeos atingido. Solicite aumento de limite.` }
      }
    } else if (fileType === 'image') {
      if (fileSizeMB > limits.max_image_size_mb) {
        return { valid: false, error: `Imagens devem ter no máximo ${limits.max_image_size_mb}MB. Este arquivo tem ${fileSizeMB.toFixed(1)}MB.` }
      }
      if (usageStats.imageCount >= limits.max_image_count) {
        return { valid: false, error: `Limite de ${limits.max_image_count} imagens atingido. Solicite aumento de limite.` }
      }
    } else {
      if (fileSizeMB > limits.max_document_size_mb) {
        return { valid: false, error: `Documentos devem ter no máximo ${limits.max_document_size_mb}MB. Este arquivo tem ${fileSizeMB.toFixed(1)}MB.` }
      }
      if (usageStats.documentCount >= limits.max_document_count) {
        return { valid: false, error: `Limite de ${limits.max_document_count} documentos atingido. Solicite aumento de limite.` }
      }
    }
    
    return { valid: true }
  }

  // Upload de arquivo
  const handleUpload = async () => {
    if (!selectedFile || !user?.gabinete_id || !uploadData.nome) {
      alert('Preencha o nome e selecione um arquivo')
      return
    }

    const validation = validateUpload(selectedFile)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    setUploading(true)
    try {
      const fileName = `${user.gabinete_id}/${Date.now()}_${selectedFile.name}`
      
      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(fileName)

      const { error: dbError } = await supabase
        .from('documentos')
        .insert({
          gabinete_id: user.gabinete_id,
          nome: uploadData.nome,
          descricao: uploadData.descricao || null,
          arquivo_url: urlData.publicUrl,
          arquivo_nome: selectedFile.name,
          arquivo_tipo: selectedFile.type,
          arquivo_tamanho: selectedFile.size,
          categoria: uploadData.categoria || null,
          tags: uploadData.tags ? uploadData.tags.split(',').map(t => t.trim()) : null,
          folder_id: currentFolderId,
          flag_id: uploadData.flag_id || null,
          created_by: user.id
        })

      if (dbError) throw dbError

      setShowUploadModal(false)
      setSelectedFile(null)
      setUploadData({ nome: '', descricao: '', categoria: '', tags: '', flag_id: '' })
      fetchDocumentos()
      fetchUsageStats()
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao fazer upload do arquivo')
    } finally {
      setUploading(false)
    }
  }

  // Criar/Editar pasta
  const handleSaveFolder = async () => {
    if (!user?.gabinete_id || !folderData.nome) {
      alert('Preencha o nome da pasta')
      return
    }

    try {
      if (editingFolder) {
        const { error } = await supabase
          .from('document_folders')
          .update({
            nome: folderData.nome,
            descricao: folderData.descricao || null,
            cor: folderData.cor,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingFolder.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('document_folders')
          .insert({
            gabinete_id: user.gabinete_id,
            nome: folderData.nome,
            descricao: folderData.descricao || null,
            cor: folderData.cor,
            parent_id: currentFolderId
          })
        if (error) throw error
      }

      setShowFolderModal(false)
      setFolderData({ nome: '', descricao: '', cor: '#3B82F6' })
      setEditingFolder(null)
      fetchFolders()
    } catch (error) {
      console.error('Erro ao salvar pasta:', error)
      alert('Erro ao salvar pasta')
    }
  }

  // Criar/Editar flag
  const handleSaveFlag = async () => {
    if (!user?.gabinete_id || !flagData.nome) {
      alert('Preencha o nome da flag')
      return
    }

    try {
      if (editingFlag) {
        const { error } = await supabase
          .from('document_flags')
          .update({
            nome: flagData.nome,
            descricao: flagData.descricao || null,
            cor: flagData.cor
          })
          .eq('id', editingFlag.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('document_flags')
          .insert({
            gabinete_id: user.gabinete_id,
            nome: flagData.nome,
            descricao: flagData.descricao || null,
            cor: flagData.cor
          })
        if (error) throw error
      }

      setShowFlagModal(false)
      setFlagData({ nome: '', descricao: '', cor: '#6366F1' })
      setEditingFlag(null)
      fetchFlags()
    } catch (error) {
      console.error('Erro ao salvar flag:', error)
      alert('Erro ao salvar flag')
    }
  }

  // Excluir pasta
  const handleDeleteFolder = async (folder: DocumentFolder) => {
    if (!confirm(`Deseja excluir a pasta "${folder.nome}"? Os documentos dentro dela serão movidos para a raiz.`)) return

    try {
      // Mover documentos para raiz
      await supabase
        .from('documentos')
        .update({ folder_id: null })
        .eq('folder_id', folder.id)

      // Mover subpastas para o pai
      await supabase
        .from('document_folders')
        .update({ parent_id: folder.parent_id })
        .eq('parent_id', folder.id)

      // Excluir pasta
      const { error } = await supabase
        .from('document_folders')
        .delete()
        .eq('id', folder.id)

      if (error) throw error
      
      if (currentFolderId === folder.id) {
        setCurrentFolderId(folder.parent_id)
      }
      fetchFolders()
      fetchDocumentos()
    } catch (error) {
      console.error('Erro ao excluir pasta:', error)
      alert('Erro ao excluir pasta')
    }
  }

  // Excluir flag
  const handleDeleteFlag = async (flag: DocumentFlag) => {
    if (!confirm(`Deseja excluir a flag "${flag.nome}"?`)) return

    try {
      // Remover flag dos documentos
      await supabase
        .from('documentos')
        .update({ flag_id: null })
        .eq('flag_id', flag.id)

      const { error } = await supabase
        .from('document_flags')
        .delete()
        .eq('id', flag.id)

      if (error) throw error
      fetchFlags()
      fetchDocumentos()
    } catch (error) {
      console.error('Erro ao excluir flag:', error)
      alert('Erro ao excluir flag')
    }
  }

  // Excluir documento
  const handleDeleteDocument = async (doc: Documento) => {
    if (!confirm(`Deseja excluir o documento "${doc.nome}"?`)) return

    try {
      const urlParts = doc.arquivo_url.split('/documentos/')
      if (urlParts.length > 1) {
        await supabase.storage.from('documentos').remove([urlParts[1]])
      }

      const { error } = await supabase
        .from('documentos')
        .delete()
        .eq('id', doc.id)

      if (error) throw error
      fetchDocumentos()
      fetchUsageStats()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir documento')
    }
  }

  // Mover documento
  const handleMoveDocument = async (targetFolderId: string | null) => {
    if (!documentToMove) return

    try {
      const { error } = await supabase
        .from('documentos')
        .update({ folder_id: targetFolderId })
        .eq('id', documentToMove.id)

      if (error) throw error
      
      setShowMoveModal(false)
      setDocumentToMove(null)
      fetchDocumentos()
    } catch (error) {
      console.error('Erro ao mover documento:', error)
      alert('Erro ao mover documento')
    }
  }

  // Solicitar aumento de limite
  const handleLimitRequest = async () => {
    if (!user?.gabinete_id || !limitRequestData.justificativa || limitRequestData.valor_solicitado <= 0) {
      alert('Preencha todos os campos')
      return
    }

    try {
      let valorAtual = 0
      if (limitRequestData.tipo_arquivo === 'video') {
        valorAtual = limitRequestData.tipo_solicitacao === 'size' ? limits.max_video_size_mb : limits.max_video_count
      } else if (limitRequestData.tipo_arquivo === 'image') {
        valorAtual = limitRequestData.tipo_solicitacao === 'size' ? limits.max_image_size_mb : limits.max_image_count
      } else {
        valorAtual = limitRequestData.tipo_solicitacao === 'size' ? limits.max_document_size_mb : limits.max_document_count
      }

      const { error } = await supabase
        .from('limit_increase_requests')
        .insert({
          gabinete_id: user.gabinete_id,
          user_id: user.id,
          tipo_arquivo: limitRequestData.tipo_arquivo,
          tipo_solicitacao: limitRequestData.tipo_solicitacao,
          valor_atual: valorAtual,
          valor_solicitado: limitRequestData.valor_solicitado,
          justificativa: limitRequestData.justificativa
        })

      if (error) throw error

      alert('Solicitação enviada com sucesso! A administração irá analisar seu pedido.')
      setShowLimitRequestModal(false)
      setLimitRequestData({
        tipo_arquivo: 'video',
        tipo_solicitacao: 'size',
        valor_solicitado: 0,
        justificativa: ''
      })
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error)
      alert('Erro ao enviar solicitação')
    }
  }

  // Estilos
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    overflow: 'hidden'
  }

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: '16px'
  }

  const modalStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    fontSize: '14px'
  }

  const buttonPrimaryStyle: React.CSSProperties = {
    padding: '12px 20px',
    borderRadius: '10px',
    backgroundColor: 'var(--primary)',
    color: 'white',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }

  const buttonSecondaryStyle: React.CSSProperties = {
    padding: '12px 20px',
    borderRadius: '10px',
    backgroundColor: 'var(--muted)',
    color: 'var(--foreground)',
    border: '1px solid var(--border)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  }

  return (
    <div className="px-1 md:px-2">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FolderOpen style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
            <h1 className="text-xl md:text-2xl lg:text-[28px] font-bold" style={{ color: 'var(--foreground)' }}>
              Documentos
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowLimitsInfo(true)}
              style={{ ...buttonSecondaryStyle, padding: '10px 16px' }}
              title="Ver limites de upload"
            >
              <Info style={{ width: '18px', height: '18px' }} />
            </button>
            <button
              onClick={() => {
                setEditingFlag(null)
                setFlagData({ nome: '', descricao: '', cor: '#6366F1' })
                setShowFlagModal(true)
              }}
              style={{ ...buttonSecondaryStyle, padding: '10px 16px' }}
            >
              <Flag style={{ width: '18px', height: '18px' }} />
              <span className="hidden sm:inline">Nova Flag</span>
            </button>
            <button
              onClick={() => {
                setEditingFolder(null)
                setFolderData({ nome: '', descricao: '', cor: '#3B82F6' })
                setShowFolderModal(true)
              }}
              style={{ ...buttonSecondaryStyle, padding: '10px 16px' }}
            >
              <FolderPlus style={{ width: '18px', height: '18px' }} />
              <span className="hidden sm:inline">Nova Pasta</span>
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              style={buttonPrimaryStyle}
            >
              <Plus style={{ width: '18px', height: '18px' }} />
              <span className="hidden sm:inline">Novo Documento</span>
            </button>
          </div>
        </div>
        <p className="text-sm md:text-base" style={{ color: 'var(--foreground-muted)' }}>
          Gerencie os documentos e arquivos do gabinete
        </p>
      </div>

      {/* Breadcrumb de navegação */}
      <div style={{ ...cardStyle, marginBottom: '16px', padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCurrentFolderId(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: !currentFolderId ? 'var(--primary)' : 'transparent',
              color: !currentFolderId ? 'white' : 'var(--foreground)',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <Folder style={{ width: '16px', height: '16px' }} />
            Raiz
          </button>
          {folderPath.map((folder, index) => (
            <div key={folder.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--foreground-muted)' }} />
              <button
                onClick={() => setCurrentFolderId(folder.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: index === folderPath.length - 1 ? 'var(--primary)' : 'transparent',
                  color: index === folderPath.length - 1 ? 'white' : 'var(--foreground)',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <Folder style={{ width: '16px', height: '16px', color: folder.cor }} />
                {folder.nome}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div style={{ ...cardStyle, marginBottom: '16px' }}>
        <div style={{ padding: '16px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Busca */}
          <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
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
              style={{ ...inputStyle, paddingLeft: '44px' }}
            />
          </div>

          {/* Filtro por categoria */}
          <select
            value={selectedCategoria || ''}
            onChange={(e) => setSelectedCategoria(e.target.value || null)}
            style={{ ...inputStyle, minWidth: '150px', flex: 'none' }}
          >
            <option value="">Todas categorias</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Filtro por flag */}
          <select
            value={selectedFlag || ''}
            onChange={(e) => setSelectedFlag(e.target.value || null)}
            style={{ ...inputStyle, minWidth: '150px', flex: 'none' }}
          >
            <option value="">Todas flags</option>
            {flags.map(flag => (
              <option key={flag.id} value={flag.id}>{flag.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Flags existentes */}
      {flags.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: '16px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Flag style={{ width: '18px', height: '18px', color: 'var(--foreground-muted)' }} />
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)' }}>Flags de Documentos</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {flags.map(flag => (
              <div
                key={flag.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  backgroundColor: `${flag.cor}20`,
                  border: `1px solid ${flag.cor}`,
                  fontSize: '13px'
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: flag.cor }} />
                <span style={{ color: flag.cor }}>{flag.nome}</span>
                <button
                  onClick={() => {
                    setEditingFlag(flag)
                    setFlagData({ nome: flag.nome, descricao: flag.descricao || '', cor: flag.cor })
                    setShowFlagModal(true)
                  }}
                  style={{ padding: '2px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Edit2 style={{ width: '12px', height: '12px', color: flag.cor }} />
                </button>
                <button
                  onClick={() => handleDeleteFlag(flag)}
                  style={{ padding: '2px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X style={{ width: '12px', height: '12px', color: flag.cor }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subpastas */}
      {currentSubfolders.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {currentSubfolders.map(folder => (
              <div
                key={folder.id}
                style={{
                  ...cardStyle,
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setCurrentFolderId(folder.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Folder style={{ width: '24px', height: '24px', color: folder.cor }} />
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)' }}>{folder.nome}</p>
                      {folder.descricao && (
                        <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginTop: '2px' }}>{folder.descricao}</p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setEditingFolder(folder)
                        setFolderData({ nome: folder.nome, descricao: folder.descricao || '', cor: folder.cor })
                        setShowFolderModal(true)
                      }}
                      style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px' }}
                    >
                      <Edit2 style={{ width: '14px', height: '14px', color: 'var(--foreground-muted)' }} />
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(folder)}
                      style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px' }}
                    >
                      <Trash2 style={{ width: '14px', height: '14px', color: 'var(--destructive)' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Documentos */}
      <div style={cardStyle}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)' }}>
            Documentos {currentFolderId && folderPath.length > 0 && `em "${folderPath[folderPath.length - 1].nome}"`}
          </h2>
          <span style={{ fontSize: '14px', color: 'var(--foreground-muted)' }}>
            {filteredDocumentos.length} {filteredDocumentos.length === 1 ? 'documento' : 'documentos'}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--border)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
            <p style={{ marginTop: '16px', color: 'var(--foreground-muted)' }}>Carregando documentos...</p>
          </div>
        ) : filteredDocumentos.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <FileText style={{ width: '48px', height: '48px', color: 'var(--foreground-muted)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--foreground-muted)' }}>
              {searchTerm ? 'Nenhum documento encontrado' : 'Nenhum documento nesta pasta'}
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              style={{ ...buttonPrimaryStyle, margin: '16px auto 0' }}
            >
              <Plus style={{ width: '18px', height: '18px' }} />
              Adicionar Documento
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Documento</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Categoria</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Flag</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Tamanho</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Data</th>
                  <th style={{ padding: '14px 24px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocumentos.map((doc, index) => {
                  const FileIcon = getFileIcon(doc.arquivo_tipo)
                  const docFlag = flags.find(f => f.id === doc.flag_id)
                  return (
                    <tr key={doc.id} style={{ borderBottom: index < filteredDocumentos.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <FileIcon style={{ width: '24px', height: '24px', color: 'var(--primary)' }} />
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)' }}>{doc.nome}</p>
                            <p style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>{doc.arquivo_nome}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {doc.categoria ? (
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--muted)',
                            fontSize: '12px',
                            color: 'var(--foreground)'
                          }}>
                            {doc.categoria}
                          </span>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {docFlag ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            backgroundColor: `${docFlag.cor}20`,
                            fontSize: '12px',
                            color: docFlag.cor
                          }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: docFlag.cor }} />
                            {docFlag.nome}
                          </span>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: 'var(--foreground-muted)' }}>
                        {formatFileSize(doc.arquivo_tamanho)}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: 'var(--foreground-muted)' }}>
                        {formatDate(doc.created_at)}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <a
                            href={doc.arquivo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--muted)',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Visualizar"
                          >
                            <Eye style={{ width: '16px', height: '16px', color: 'var(--foreground-muted)' }} />
                          </a>
                          <a
                            href={doc.arquivo_url}
                            download={doc.arquivo_nome}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--muted)',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Download"
                          >
                            <Download style={{ width: '16px', height: '16px', color: 'var(--foreground-muted)' }} />
                          </a>
                          <button
                            onClick={() => {
                              setDocumentToMove(doc)
                              setShowMoveModal(true)
                            }}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--muted)',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                            title="Mover"
                          >
                            <Move style={{ width: '16px', height: '16px', color: 'var(--foreground-muted)' }} />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc)}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--destructive)',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                            title="Excluir"
                          >
                            <Trash2 style={{ width: '16px', height: '16px', color: 'white' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Upload */}
      {showUploadModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)' }}>Novo Documento</h2>
              <button onClick={() => { setShowUploadModal(false); setSelectedFile(null); setUploadData({ nome: '', descricao: '', categoria: '', tags: '', flag_id: '' }) }} style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: 'var(--foreground-muted)' }} />
              </button>
            </div>
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
                  cursor: 'pointer'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.png,.jpg,.jpeg,.gif,.mp4,.mov,.avi,.webm"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const validation = validateUpload(file)
                      if (!validation.valid) {
                        alert(validation.error)
                        return
                      }
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
                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)' }}>{selectedFile.name}</p>
                    <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', marginTop: '4px' }}>{formatFileSize(selectedFile.size)}</p>
                  </>
                ) : (
                  <>
                    <Upload style={{ width: '40px', height: '40px', color: 'var(--foreground-muted)', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '14px', color: 'var(--foreground-muted)' }}>Clique para selecionar um arquivo</p>
                    <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginTop: '4px' }}>
                      Vídeos: máx. {limits.max_video_size_mb}MB | Imagens: máx. {limits.max_image_size_mb}MB | Docs: máx. {limits.max_document_size_mb}MB
                    </p>
                  </>
                )}
              </div>

              {/* Nome */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>Nome do documento *</label>
                <input type="text" value={uploadData.nome} onChange={(e) => setUploadData({ ...uploadData, nome: e.target.value })} placeholder="Ex: Ofício nº 001/2025" style={inputStyle} />
              </div>

              {/* Descrição */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>Descrição</label>
                <textarea value={uploadData.descricao} onChange={(e) => setUploadData({ ...uploadData, descricao: e.target.value })} placeholder="Descrição opcional" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              {/* Categoria e Flag */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>Categoria</label>
                  <select value={uploadData.categoria} onChange={(e) => setUploadData({ ...uploadData, categoria: e.target.value })} style={inputStyle}>
                    <option value="">Selecione</option>
                    {categorias.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>Flag</label>
                  <select value={uploadData.flag_id} onChange={(e) => setUploadData({ ...uploadData, flag_id: e.target.value })} style={inputStyle}>
                    <option value="">Selecione</option>
                    {flags.map(flag => (<option key={flag.id} value={flag.id}>{flag.nome}</option>))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>Tags (separadas por vírgula)</label>
                <input type="text" value={uploadData.tags} onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })} placeholder="Ex: urgente, saúde, educação" style={inputStyle} />
              </div>

              {/* Botões */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => { setShowUploadModal(false); setSelectedFile(null); setUploadData({ nome: '', descricao: '', categoria: '', tags: '', flag_id: '' }) }} style={{ ...buttonSecondaryStyle, flex: 1 }}>Cancelar</button>
                <button onClick={handleUpload} disabled={!selectedFile || !uploadData.nome || uploading} style={{ ...buttonPrimaryStyle, flex: 1, justifyContent: 'center', opacity: (!selectedFile || !uploadData.nome) ? 0.5 : 1 }}>
                  {uploading ? 'Enviando...' : 'Enviar Documento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pasta */}
      {showFolderModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)' }}>{editingFolder ? 'Editar Pasta' : 'Nova Pasta'}</h2>
              <button onClick={() => { setShowFolderModal(false); setEditingFolder(null) }} style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: 'var(--foreground-muted)' }} />
              </button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>Nome da pasta *</label>
                <input type="text" value={folderData.nome} onChange={(e) => setFolderData({ ...folderData, nome: e.target.value })} placeholder="Ex: Documentos 2025" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>Descrição</label>
                <textarea value={folderData.descricao} onChange={(e) => setFolderData({ ...folderData, descricao: e.target.value })} placeholder="Descrição opcional" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>Cor</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {flagColors.map(color => (
                    <button key={color} onClick={() => setFolderData({ ...folderData, cor: color })} style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: color, border: folderData.cor === color ? '3px solid var(--foreground)' : '2px solid transparent', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => { setShowFolderModal(false); setEditingFolder(null) }} style={{ ...buttonSecondaryStyle, flex: 1 }}>Cancelar</button>
                <button onClick={handleSaveFolder} disabled={!folderData.nome} style={{ ...buttonPrimaryStyle, flex: 1, justifyContent: 'center', opacity: !folderData.nome ? 0.5 : 1 }}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Flag */}
      {showFlagModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)' }}>{editingFlag ? 'Editar Flag' : 'Nova Flag'}</h2>
              <button onClick={() => { setShowFlagModal(false); setEditingFlag(null) }} style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: 'var(--foreground-muted)' }} />
              </button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>Nome da flag *</label>
                <input type="text" value={flagData.nome} onChange={(e) => setFlagData({ ...flagData, nome: e.target.value })} placeholder="Ex: Urgente, Confidencial" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>Descrição</label>
                <textarea value={flagData.descricao} onChange={(e) => setFlagData({ ...flagData, descricao: e.target.value })} placeholder="Descrição opcional" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>Cor</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {flagColors.map(color => (
                    <button key={color} onClick={() => setFlagData({ ...flagData, cor: color })} style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: color, border: flagData.cor === color ? '3px solid var(--foreground)' : '2px solid transparent', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => { setShowFlagModal(false); setEditingFlag(null) }} style={{ ...buttonSecondaryStyle, flex: 1 }}>Cancelar</button>
                <button onClick={handleSaveFlag} disabled={!flagData.nome} style={{ ...buttonPrimaryStyle, flex: 1, justifyContent: 'center', opacity: !flagData.nome ? 0.5 : 1 }}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Mover Documento */}
      {showMoveModal && documentToMove && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)' }}>Mover Documento</h2>
              <button onClick={() => { setShowMoveModal(false); setDocumentToMove(null) }} style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: 'var(--foreground-muted)' }} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '14px', color: 'var(--foreground-muted)', marginBottom: '16px' }}>
                Selecione a pasta de destino para "{documentToMove.nome}"
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                <button
                  onClick={() => handleMoveDocument(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: !documentToMove.folder_id ? 'var(--primary)' : 'var(--muted)',
                    color: !documentToMove.folder_id ? 'white' : 'var(--foreground)',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Folder style={{ width: '20px', height: '20px' }} />
                  Raiz (sem pasta)
                </button>
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => handleMoveDocument(folder.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      backgroundColor: documentToMove.folder_id === folder.id ? 'var(--primary)' : 'var(--muted)',
                      color: documentToMove.folder_id === folder.id ? 'white' : 'var(--foreground)',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Folder style={{ width: '20px', height: '20px', color: folder.cor }} />
                    {folder.nome}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Informações de Limites */}
      {showLimitsInfo && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)' }}>Limites de Upload</h2>
              <button onClick={() => setShowLimitsInfo(false)} style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: 'var(--foreground-muted)' }} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Vídeos */}
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <FileVideo style={{ width: '24px', height: '24px', color: 'var(--primary)' }} />
                    <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)' }}>Vídeos</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>Tamanho máximo</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)' }}>{limits.max_video_size_mb} MB</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>Quantidade</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)' }}>{usageStats.videoCount} / {limits.max_video_count}</p>
                    </div>
                  </div>
                  <div style={{ marginTop: '8px', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(usageStats.videoCount / limits.max_video_count) * 100}%`, backgroundColor: 'var(--primary)', borderRadius: '3px' }} />
                  </div>
                </div>

                {/* Imagens */}
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <FileImage style={{ width: '24px', height: '24px', color: '#22c55e' }} />
                    <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)' }}>Imagens</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>Tamanho máximo</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)' }}>{limits.max_image_size_mb} MB</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>Quantidade</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)' }}>{usageStats.imageCount} / {limits.max_image_count}</p>
                    </div>
                  </div>
                  <div style={{ marginTop: '8px', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(usageStats.imageCount / limits.max_image_count) * 100}%`, backgroundColor: '#22c55e', borderRadius: '3px' }} />
                  </div>
                </div>

                {/* Documentos */}
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <FileText style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
                    <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)' }}>Documentos</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>Tamanho máximo</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)' }}>{limits.max_document_size_mb} MB</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>Quantidade</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)' }}>{usageStats.documentCount} / {limits.max_document_count}</p>
                    </div>
                  </div>
                  <div style={{ marginTop: '8px', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(usageStats.documentCount / limits.max_document_count) * 100}%`, backgroundColor: '#f59e0b', borderRadius: '3px' }} />
                  </div>
                </div>

                {/* Aviso LGPD */}
                <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'var(--primary)', color: 'white', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                  <span>Todos os dados coletados respeitam às normas da LGPD (Lei Geral de Proteção de Dados).</span>
                </div>

                {/* Botão de solicitação */}
                <button
                  onClick={() => {
                    setShowLimitsInfo(false)
                    setShowLimitRequestModal(true)
                  }}
                  style={{ ...buttonPrimaryStyle, justifyContent: 'center', width: '100%' }}
                >
                  <HelpCircle style={{ width: '18px', height: '18px' }} />
                  Solicitar Aumento de Limite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Solicitação de Aumento */}
      {showLimitRequestModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)' }}>Solicitar Aumento de Limite</h2>
              <button onClick={() => setShowLimitRequestModal(false)} style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: 'var(--foreground-muted)' }} />
              </button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>Tipo de arquivo</label>
                  <select value={limitRequestData.tipo_arquivo} onChange={(e) => setLimitRequestData({ ...limitRequestData, tipo_arquivo: e.target.value as 'video' | 'image' | 'document' })} style={inputStyle}>
                    <option value="video">Vídeo</option>
                    <option value="image">Imagem</option>
                    <option value="document">Documento</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>O que aumentar</label>
                  <select value={limitRequestData.tipo_solicitacao} onChange={(e) => setLimitRequestData({ ...limitRequestData, tipo_solicitacao: e.target.value as 'size' | 'count' })} style={inputStyle}>
                    <option value="size">Tamanho máximo (MB)</option>
                    <option value="count">Quantidade máxima</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>
                  Novo valor desejado {limitRequestData.tipo_solicitacao === 'size' ? '(MB)' : '(quantidade)'}
                </label>
                <input type="number" min="1" value={limitRequestData.valor_solicitado || ''} onChange={(e) => setLimitRequestData({ ...limitRequestData, valor_solicitado: parseInt(e.target.value) || 0 })} placeholder="Ex: 50" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>Justificativa *</label>
                <textarea value={limitRequestData.justificativa} onChange={(e) => setLimitRequestData({ ...limitRequestData, justificativa: e.target.value })} placeholder="Explique por que você precisa de um limite maior..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => setShowLimitRequestModal(false)} style={{ ...buttonSecondaryStyle, flex: 1 }}>Cancelar</button>
                <button onClick={handleLimitRequest} disabled={!limitRequestData.justificativa || limitRequestData.valor_solicitado <= 0} style={{ ...buttonPrimaryStyle, flex: 1, justifyContent: 'center', opacity: (!limitRequestData.justificativa || limitRequestData.valor_solicitado <= 0) ? 0.5 : 1 }}>
                  Enviar Solicitação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
