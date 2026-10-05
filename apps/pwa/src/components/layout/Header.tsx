import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Wallet, Menu, Keyboard, Globe, LogOut } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatters'
import { IconButton } from '../common/IconButton'
import { InstallAppButton } from '../pwa/InstallAppButton'
import { triggerHaptic } from '../../utils/haptics'

export interface HeaderProps {
  onOpenMobileMenu?: () => void
  onOpenShortcuts?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onOpenShortcuts }) => {
  const { netBalance, settings } = useData()
  const { t, language, setLanguage } = useLanguage()
  const { user, logout } = useAuth()
  const { success } = useToast()
  const location = useLocation()

  const handleLogout = () => {
    triggerHaptic('medium')
    logout()
    success(t('auth.successLogout'))
  }

  // Determinar título contextual de la vista actual
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/' || path === '/dashboard') return t('nav.dashboard')
    if (path.startsWith('/movements/new')) return t('movements.newBtn')
    if (path.startsWith('/movements') && path.includes('/edit')) return t('common.edit')
    if (path.startsWith('/movements')) return t('nav.movements')
    if (path.startsWith('/debts')) return t('nav.debts')
    if (path.startsWith('/savings')) return t('nav.savings')
    if (path.startsWith('/analytics')) return t('nav.analytics')
    if (path.startsWith('/settings')) return t('nav.settings')
    if (path.startsWith('/help')) return t('nav.help')
    return t('nav.brand')
  }

  const handleMenuClick = () => {
    triggerHaptic('light')
    onOpenMobileMenu?.()
  }

  const handleToggleLanguage = () => {
    triggerHaptic('light')
    setLanguage(language === 'es' ? 'en' : 'es')
  }

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        zIndex: 950,
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: 'calc(0.75rem + env(safe-area-inset-top, 0px)) var(--space-4) 0.75rem var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 'calc(64px + env(safe-area-inset-top, 0px))',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0, flexShrink: 1 }}>
        {onOpenMobileMenu && (
          <div className="mobile-only-trigger" style={{ display: 'flex', flexShrink: 0 }}>
            <IconButton
              icon={<Menu size={22} />}
              aria-label="Abrir menú de navegación"
              onClick={handleMenuClick}
            />
          </div>
        )}

        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            textDecoration: 'none',
            color: 'inherit',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-carbon)',
              border: '1px solid var(--color-slate)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-paper-white)',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <Wallet size={18} color="#ae9357" />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <span
              style={{
                fontSize: '1.15rem',
                fontWeight: 500,
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.01em',
                display: 'block',
                lineHeight: 1.15,
                color: 'var(--color-paper-white)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {t('nav.brand')}
            </span>
            <span
              className="desktop-only"
              style={{
                fontSize: '11px',
                color: 'var(--color-fog)',
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {getPageTitle()}
            </span>
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
        {/* Balance rápido en cabecera (solo escritorio para evitar desbordamiento en móvil) */}
        <div
          className="header-balance desktop-only"
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-surface-muted)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('header.balance')}</span>
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: netBalance >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
            }}
          >
            {formatCurrency(netBalance, settings.currency)}
          </span>
        </div>

        {/* Acceso directo a cambio de idioma */}
        <button
          type="button"
          onClick={handleToggleLanguage}
          aria-label={language === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish'}
          title={language === 'es' ? 'Cambiar idioma a Inglés (EN)' : 'Switch language to Spanish (ES)'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '0.35rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-surface-muted)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--color-paper-white)',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.04em',
            transition: 'background-color 0.15s ease, border-color 0.15s ease, transform 0.1s ease',
          }}
        >
          <Globe size={15} color="#ae9357" />
          <span>{language.toUpperCase()}</span>
        </button>

        {/* Botón de instalación PWA: botón completo en escritorio, ícono compacto en móvil */}
        <div className="desktop-only">
          <InstallAppButton variant="button" />
        </div>
        <div className="mobile-only">
          <InstallAppButton variant="icon" />
        </div>

        {/* Atajos de teclado (solo escritorio) */}
        {onOpenShortcuts && (
          <div className="desktop-only">
            <IconButton
              icon={<Keyboard size={20} />}
              aria-label="Atajos de teclado y accesos directos (Presiona ?)"
              onClick={onOpenShortcuts}
            />
          </div>
        )}

        {/* Perfil de usuario y Logout rápido */}
        {user && (
          <button
            type="button"
            onClick={handleLogout}
            title={`${user.name} - ${t('auth.logout')}`}
            aria-label={`${user.name} - ${t('auth.logout')}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-surface-muted)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--color-paper-white)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(174, 147, 87, 0.3)',
                color: '#e5c875',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </span>
            <span className="desktop-only" style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name.split(' ')[0]}
            </span>
            <LogOut size={13} color="var(--color-fog)" />
          </button>
        )}
      </div>
    </header>
  )
}
