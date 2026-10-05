import React from 'react'
import { NavLink } from 'react-router-dom'
import { CreditCard, Home, Menu, Plus, Receipt } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { triggerHaptic } from '../../utils/haptics'

export interface BottomNavigationProps {
  onOpenMore: () => void
  onOpenQuickAction?: () => void
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onOpenMore,
  onOpenQuickAction,
}) => {
  const { t } = useLanguage()
  const handleTabClick = () => {
    triggerHaptic('light')
  }

  const handlePlusClick = (e: React.MouseEvent) => {
    if (onOpenQuickAction) {
      e.preventDefault()
      triggerHaptic('medium')
      onOpenQuickAction()
    } else {
      triggerHaptic('light')
    }
  }

  return (
    <nav
      className="bottom-nav-mobile"
      aria-label="Navegación móvil"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        backgroundColor: 'var(--bottom-nav-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 950,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <NavLink
        to="/"
        end
        onClick={handleTabClick}
        className="bottom-nav-item"
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          textDecoration: 'none',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
          padding: '6px 12px',
          transition: 'color 0.15s ease, transform 0.1s ease',
        })}
      >
        <Home size={20} />
        <span>{t('nav.home')}</span>
      </NavLink>

      <NavLink
        to="/movements"
        onClick={handleTabClick}
        className="bottom-nav-item"
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          textDecoration: 'none',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
          padding: '6px 12px',
          transition: 'color 0.15s ease, transform 0.1s ease',
        })}
      >
        <Receipt size={20} />
        <span>{t('nav.movements')}</span>
      </NavLink>

      {/* Botón central destacado flotante con Quick Action Sheet */}
      <NavLink
        to="/movements/new"
        onClick={handlePlusClick}
        aria-label="Registrar nueva operación financiera"
        className="bottom-nav-fab"
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-paper-white)',
          color: '#040406',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.8)',
          transform: 'translateY(-14px)',
          textDecoration: 'none',
          border: '3px solid var(--color-obsidian)',
          transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        <Plus size={26} strokeWidth={2.75} />
      </NavLink>

      <NavLink
        to="/debts"
        onClick={handleTabClick}
        className="bottom-nav-item"
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          textDecoration: 'none',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
          padding: '6px 12px',
          transition: 'color 0.15s ease, transform 0.1s ease',
        })}
      >
        <CreditCard size={20} />
        <span>{t('nav.debts')}</span>
      </NavLink>

      <button
        type="button"
        onClick={() => {
          triggerHaptic('light')
          onOpenMore()
        }}
        aria-label={t('nav.more')}
        className="bottom-nav-item"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          background: 'transparent',
          border: 'none',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          padding: '6px 12px',
          cursor: 'pointer',
          transition: 'color 0.15s ease, transform 0.1s ease',
        }}
      >
        <Menu size={20} />
        <span>{t('nav.more')}</span>
      </button>
    </nav>
  )
}

