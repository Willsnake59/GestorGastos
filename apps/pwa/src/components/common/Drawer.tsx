import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { IconButton } from './IconButton'
import { triggerHaptic } from '../../utils/haptics'

export interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children }) => {
  const drawerRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef<number | null>(null)
  const currentTranslateY = useRef<number>(0)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      triggerHaptic('light')
      drawerRef.current?.focus()
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCloseRef.current()
      }
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  // Gestos de arrastre táctil hacia abajo para cerrar (iOS / Android Bottom Sheet gesture)
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY
    currentTranslateY.current = 0
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null || !drawerRef.current) return
    const deltaY = e.touches[0].clientY - dragStartY.current
    if (deltaY > 0) {
      currentTranslateY.current = deltaY
      drawerRef.current.style.transform = `translateY(${deltaY}px)`
      drawerRef.current.style.transition = 'none'
    }
  }

  const handleTouchEnd = () => {
    if (dragStartY.current === null || !drawerRef.current) return
    const shouldClose = currentTranslateY.current > 80

    drawerRef.current.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'

    if (shouldClose) {
      triggerHaptic('light')
      drawerRef.current.style.transform = 'translateY(100%)'
      setTimeout(onClose, 200)
    } else {
      drawerRef.current.style.transform = 'translateY(0px)'
    }

    dragStartY.current = null
    currentTranslateY.current = 0
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          triggerHaptic('light')
          onClose()
        }
      }}
      role="presentation"
      style={{ alignItems: 'flex-end', padding: 0 }}
    >
      <div
        ref={drawerRef}
        className="drawer-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          touchAction: 'pan-y',
          paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div
          className="drawer-drag-handle"
          style={{ cursor: 'grab' }}
          aria-label="Arrastra hacia abajo para cerrar"
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)',
          }}
        >
          <h2 id="drawer-title" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {title}
          </h2>
          <IconButton
            icon={<X size={20} />}
            aria-label="Cerrar panel"
            onClick={() => {
              triggerHaptic('light')
              onClose()
            }}
          />
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
