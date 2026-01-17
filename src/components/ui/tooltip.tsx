'use client'

import * as React from 'react'

interface TooltipProps {
  children: React.ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export function Tooltip({ 
  children, 
  content, 
  position = 'top',
  delay = 200 
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [coords, setCoords] = React.useState({ x: 0, y: 0 })
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getPositionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      zIndex: 9999,
      padding: '6px 12px',
      backgroundColor: 'var(--foreground)',
      color: 'var(--background)',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 500,
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.15s ease-in-out',
    }

    switch (position) {
      case 'top':
        return {
          ...baseStyles,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
        }
      case 'bottom':
        return {
          ...baseStyles,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '8px',
        }
      case 'left':
        return {
          ...baseStyles,
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: '8px',
        }
      case 'right':
        return {
          ...baseStyles,
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: '8px',
        }
      default:
        return baseStyles
    }
  }

  const getArrowStyles = (): React.CSSProperties => {
    const baseArrow: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    }

    switch (position) {
      case 'top':
        return {
          ...baseArrow,
          bottom: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '6px 6px 0 6px',
          borderColor: 'var(--foreground) transparent transparent transparent',
        }
      case 'bottom':
        return {
          ...baseArrow,
          top: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '0 6px 6px 6px',
          borderColor: 'transparent transparent var(--foreground) transparent',
        }
      case 'left':
        return {
          ...baseArrow,
          right: '-6px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '6px 0 6px 6px',
          borderColor: 'transparent transparent transparent var(--foreground)',
        }
      case 'right':
        return {
          ...baseArrow,
          left: '-6px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '6px 6px 6px 0',
          borderColor: 'transparent var(--foreground) transparent transparent',
        }
      default:
        return baseArrow
    }
  }

  return (
    <div
      ref={triggerRef}
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {content && (
        <div style={getPositionStyles()}>
          {content}
          <div style={getArrowStyles()} />
        </div>
      )}
    </div>
  )
}

// Componente para envolver ícones com tooltip
interface IconWithTooltipProps {
  icon: React.ReactNode
  tooltip: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

export function IconWithTooltip({
  icon,
  tooltip,
  position = 'top',
  onClick,
  className,
  style
}: IconWithTooltipProps) {
  return (
    <Tooltip content={tooltip} position={position}>
      <span
        onClick={onClick}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: onClick ? 'pointer' : 'default',
          ...style
        }}
      >
        {icon}
      </span>
    </Tooltip>
  )
}

export default Tooltip
