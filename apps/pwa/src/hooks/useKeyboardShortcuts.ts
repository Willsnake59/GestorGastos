import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Si el usuario está escribiendo en un input, textarea, select o editable, ignorar
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }

      // Si se presiona con Ctrl, Alt o Meta, ignorar para no romper combinaciones del sistema
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return
      }

      // Si hay un modal o diálogo abierto en pantalla, ignorar atajos globales excepto escape
      if (document.querySelector('.modal-overlay')) {
        if (event.key === 'Escape' || event.key === 'escape') {
          setIsHelpOpen(false)
        }
        return
      }

      const key = event.key.toLowerCase()

      switch (key) {
        case 'g':
          event.preventDefault()
          navigate('/movements/new?type=expense')
          break
        case 'i':
          event.preventDefault()
          navigate('/movements/new?type=income')
          break
        case 'n':
          event.preventDefault()
          navigate('/movements/new')
          break
        case 'm':
          event.preventDefault()
          navigate('/movements')
          break
        case 'd':
          event.preventDefault()
          navigate('/debts')
          break
        case 'a':
          event.preventDefault()
          navigate('/savings')
          break
        case 'p':
        case 'e':
          event.preventDefault()
          navigate('/analytics')
          break
        case 's':
        case 'c':
          event.preventDefault()
          navigate('/settings')
          break
        case '1':
          event.preventDefault()
          navigate('/')
          break
        case '2':
          event.preventDefault()
          navigate('/movements')
          break
        case '3':
          event.preventDefault()
          navigate('/debts')
          break
        case '4':
          event.preventDefault()
          navigate('/savings')
          break
        case '5':
          event.preventDefault()
          navigate('/analytics')
          break
        case '?':
          event.preventDefault()
          setIsHelpOpen((prev) => !prev)
          break
        case 'escape':
          setIsHelpOpen(false)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, isHelpOpen])

  return { isHelpOpen, setIsHelpOpen }
}
