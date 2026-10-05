import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  CreditCard,
  HelpCircle,
  Home,
  LogOut,
  PiggyBank,
  Plus,
  Receipt,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../common/Button'
import { triggerHaptic } from '../../utils/haptics'

export interface SidebarProps {
  onNavigate?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { movements, debts, savings } = useData()
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const { success } = useToast()

  const pendingDebtsCount = debts.filter((d) => d.status !== 'paid').length

  const handleLogout = () => {
    triggerHaptic('medium')
    logout()
    success(t('auth.successLogout'))
    onNavigate?.()
  }

  const getRoleLabel = () => {
    if (!user) return ''
    if (user.role === 'evaluator') return t('auth.evaluatorRole')
    if (user.role === 'student') return t('auth.studentRole')
    return t('auth.userRole')
  }

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: <Home size={20} />, shortcut: '1' },
    {
      to: '/movements',
      label: t('nav.movements'),
      icon: <Receipt size={20} />,
      shortcut: '2',
      badge: movements.length > 0 ? movements.length : undefined,
    },
    {
      to: '/debts',
      label: t('nav.debts'),
      icon: <CreditCard size={20} />,
      shortcut: '3',
      badge: pendingDebtsCount > 0 ? pendingDebtsCount : undefined,
      badgeColor: 'var(--color-debt)',
    },
    {
      to: '/savings',
      label: t('nav.savings'),
      icon: <PiggyBank size={20} />,
      shortcut: '4',
      badge: savings.length > 0 ? savings.length : undefined,
      badgeColor: 'var(--color-savings)',
    },
    { to: '/analytics', label: t('nav.analytics'), icon: <BarChart3 size={20} />, shortcut: '5' },
    { to: '/settings', label: t('nav.settings'), icon: <Settings size={20} />, shortcut: 'S' },
    { to: '/help', label: t('nav.help'), icon: <HelpCircle size={20} />, shortcut: '?' },
  ]

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 'var(--space-4) var(--space-3)',
      }}
    >
      <div style={{ padding: '0 var(--space-2) var(--space-4) var(--space-2)' }}>
        <NavLink to="/movements/new" onClick={onNavigate} style={{ textDecoration: 'none' }}>
          <Button variant="primary" isFullWidth icon={<Plus size={18} />} title="Presiona 'N'">
            {t('movements.newBtn')}
            <kbd className="shortcut-badge">N</kbd>
          </Button>
        </NavLink>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            title={`Acceso directo: Presiona '${item.shortcut}'`}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              borderRadius: 'var(--radius-pill)',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '13px',
              color: isActive ? 'var(--color-paper-white)' : 'var(--color-fog)',
              backgroundColor: isActive ? 'var(--color-carbon)' : 'transparent',
              border: isActive ? '1px solid var(--color-graphite)' : '1px solid transparent',
              transition: 'all var(--transition-fast)',
            })}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'inherit', display: 'flex' }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {item.badge !== undefined && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: item.badgeColor || 'var(--bg-surface-muted)',
                    color: item.badgeColor ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 700,
                  }}
                >
                  {item.badge}
                </span>
              )}
              <kbd className="shortcut-badge shortcut-badge-subtle">{item.shortcut}</kbd>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Perfil de usuario y Logout */}
      {user && (
        <div
          style={{
            marginTop: 'auto',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-carbon)',
            border: '1px solid var(--color-graphite)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(174, 147, 87, 0.2)',
                border: '1px solid #ae9357',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e5c875',
                fontWeight: 700,
                fontSize: '0.75rem',
                flexShrink: 0,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--color-paper-white)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: user.role === 'evaluator' ? '#e5c875' : 'var(--color-fog)',
                  fontWeight: user.role === 'evaluator' ? 700 : 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {getRoleLabel()}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title={t('auth.logout')}
            aria-label={t('auth.logout')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-fog)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease, background-color 0.15s ease',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      )}

      {/* Footer del sidebar */}
      <div
        style={{
          paddingTop: 'var(--space-2)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
        }}
      >
        <ShieldCheck size={14} color="#ae9357" />
        <span>PWA Local First v1.0.0</span>
      </div>
    </aside>
  )
}
