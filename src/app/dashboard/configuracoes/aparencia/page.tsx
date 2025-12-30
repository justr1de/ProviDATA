'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Palette, 
  ImageIcon, 
  Check, 
  Upload, 
  Trash2,
  Sun,
  Moon,
  Monitor,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

const presetColors = [
  { name: 'Verde ProviDATA', value: '#16a34a' },
  { name: 'Azul Oceano', value: '#0ea5e9' },
  { name: 'Roxo Real', value: '#8b5cf6' },
  { name: 'Rosa Vibrante', value: '#ec4899' },
  { name: 'Laranja Energia', value: '#f97316' },
  { name: 'Vermelho Intenso', value: '#ef4444' },
  { name: 'Azul Marinho', value: '#1e40af' },
  { name: 'Verde Esmeralda', value: '#059669' },
]

const presetBackgrounds = [
  { name: 'Nenhum', value: null, preview: null },
  { name: 'Gradiente Suave', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Natureza', value: '/backgrounds/nature.jpg', preview: '/backgrounds/nature.jpg' },
  { name: 'Abstrato', value: '/backgrounds/abstract.jpg', preview: '/backgrounds/abstract.jpg' },
]

export default function AparenciaPage() {
  const [primaryColor, setPrimaryColor] = useState('#16a34a')
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Carregar configurações salvas
    const savedColor = localStorage.getItem('providata-primary-color')
    const savedBg = localStorage.getItem('providata-bg-image')
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
    
    if (savedColor) setPrimaryColor(savedColor)
    if (savedBg) setBackgroundImage(savedBg)
    if (savedTheme) setTheme(savedTheme)
  }, [])

  const handleColorChange = (color: string) => {
    setPrimaryColor(color)
    localStorage.setItem('providata-primary-color', color)
    document.documentElement.style.setProperty('--primary', color)
    toast.success('Cor primária atualizada!')
  }

  const handleBackgroundChange = (bg: string | null) => {
    setBackgroundImage(bg)
    if (bg) {
      localStorage.setItem('providata-bg-image', bg)
    } else {
      localStorage.removeItem('providata-bg-image')
    }
    toast.success('Imagem de fundo atualizada!')
    // Recarregar para aplicar a mudança
    window.location.reload()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        handleBackgroundChange(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', systemDark)
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }
    
    toast.success('Tema atualizado!')
  }

  const resetToDefaults = () => {
    setPrimaryColor('#16a34a')
    setBackgroundImage(null)
    setTheme('system')
    
    localStorage.removeItem('providata-primary-color')
    localStorage.removeItem('providata-bg-image')
    localStorage.setItem('theme', 'system')
    
    document.documentElement.style.setProperty('--primary', '#16a34a')
    
    toast.success('Configurações restauradas!')
    window.location.reload()
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Palette style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--foreground)' }}>
            Aparência
          </h1>
        </div>
        <p style={{ fontSize: '16px', color: 'var(--foreground-muted)' }}>
          Personalize as cores e a aparência do sistema
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Theme Selection */}
        <div style={{
          padding: '28px',
          borderRadius: '16px',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sun style={{ width: '20px', height: '20px' }} />
            Tema
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { id: 'light', name: 'Claro', icon: Sun },
              { id: 'dark', name: 'Escuro', icon: Moon },
              { id: 'system', name: 'Sistema', icon: Monitor },
            ].map((option) => {
              const Icon = option.icon
              const isSelected = theme === option.id
              return (
                <button
                  key={option.id}
                  onClick={() => handleThemeChange(option.id as 'light' | 'dark' | 'system')}
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? 'var(--primary-muted)' : 'var(--muted)',
                    border: `2px solid ${isSelected ? 'var(--primary)' : 'transparent'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon style={{ width: '28px', height: '28px', color: isSelected ? 'var(--primary)' : 'var(--foreground-muted)' }} />
                  <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--foreground)' }}>
                    {option.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Primary Color */}
        <div style={{
          padding: '28px',
          borderRadius: '16px',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Palette style={{ width: '20px', height: '20px' }} />
            Cor Primária
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {presetColors.map((color) => {
              const isSelected = primaryColor === color.value
              return (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color.value)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--muted)',
                    border: `2px solid ${isSelected ? color.value : 'transparent'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: color.value,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}>
                    {isSelected && <Check style={{ width: '20px', height: '20px', color: 'white' }} />}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--foreground-muted)', textAlign: 'center' }}>
                    {color.name}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Custom Color Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)' }}>
              Cor personalizada:
            </label>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => handleColorChange(e.target.value)}
              style={{
                width: '50px',
                height: '40px',
                borderRadius: '8px',
                border: '2px solid var(--border)',
                cursor: 'pointer',
                padding: '2px'
              }}
            />
            <span style={{ fontSize: '14px', color: 'var(--foreground-muted)', fontFamily: 'monospace' }}>
              {primaryColor.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Background Image */}
        <div style={{
          padding: '28px',
          borderRadius: '16px',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ImageIcon style={{ width: '20px', height: '20px' }} />
            Imagem de Fundo
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {presetBackgrounds.map((bg, index) => {
              const isSelected = backgroundImage === bg.value
              return (
                <button
                  key={index}
                  onClick={() => handleBackgroundChange(bg.value)}
                  style={{
                    aspectRatio: '16/9',
                    borderRadius: '12px',
                    backgroundColor: bg.preview ? 'transparent' : 'var(--muted)',
                    backgroundImage: bg.preview || 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: `3px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(22, 163, 74, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check style={{ width: '24px', height: '24px', color: 'white' }} />
                    </div>
                  )}
                  {!bg.preview && (
                    <span style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>
                      {bg.name}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Custom Upload */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                <Upload style={{ width: '18px', height: '18px' }} />
                Enviar Imagem
              </button>
              
              {backgroundImage && (
                <button
                  onClick={() => handleBackgroundChange(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 style={{ width: '18px', height: '18px' }} />
                  Remover Fundo
                </button>
              )}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', marginTop: '12px' }}>
              Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
            </p>
          </div>
        </div>

        {/* Reset Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={resetToDefaults}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '10px',
              backgroundColor: 'var(--muted)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <RefreshCw style={{ width: '18px', height: '18px' }} />
            Restaurar Padrões
          </button>
        </div>
      </div>
    </div>
  )
}
