import React, { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { BottomNavigation } from './BottomNavigation'
import { QuickActionSheet } from '../mobile/QuickActionSheet'
import { Drawer } from '../common/Drawer'
import { ToastContainer } from '../feedback/ToastContainer'
import { OfflineBanner } from '../pwa/OfflineBanner'
import { UpdateAvailableBanner } from '../pwa/UpdateAvailableBanner'
import { InstallAppButton } from '../pwa/InstallAppButton'
import { Alert } from '../feedback/Alert'
import { useData } from '../../context/DataContext'
import { useLanguage } from '../../context/LanguageContext'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { ShortcutsModal } from '../common/ShortcutsModal'
import {
  BarChart3,
  HelpCircle,
  PiggyBank,
  Settings,
  Sparkles,
} from 'lucide-react'

export const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false)
  const { settings, dismissDemoNotice } = useData()
  const { t } = useLanguage()
  const { isHelpOpen, setIsHelpOpen } = useKeyboardShortcuts()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <Header
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenShortcuts={() => setIsHelpOpen(true)}
      />

      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          paddingTop: 'calc(64px + env(safe-area-inset-top, 0px))',
          width: '100%',
          maxWidth: '100vw',
          boxSizing: 'border-box',
        }}
      >
        {/* Sidebar visible solo en pantallas grandes (≥ 1024px o ≥ 768px) */}
        <div className="desktop-sidebar-container">
          <Sidebar />
        </div>

        {/* Contenido Principal */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-4)',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px) + var(--space-4))',
            maxWidth: '1280px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <UpdateAvailableBanner />
          <OfflineBanner />

          {/* Aviso contextual de Datos de Demostración */}
          {settings.showDemoNotice && (
            <Alert
              type="info"
              title={t('pwa.demoNoticeTitle')}
              onDismiss={dismissDemoNotice}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Sparkles size={16} color="var(--color-primary)" />
                <span>{t('pwa.demoNoticeDesc')}</span>
              </div>
            </Alert>
          )}

          <Outlet />
        </main>
      </div>

      {/* Navegación inferior móvil */}
      <BottomNavigation
        onOpenMore={() => setIsMobileMenuOpen(true)}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
      />

      {/* Hoja nativa de acciones rápidas para móvil */}
      <QuickActionSheet
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
      />

      {/* Drawer móvil con opciones adicionales */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title={t('pwa.moreOptions')}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <NavLink
            to="/savings"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-muted)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            <PiggyBank size={20} color="var(--color-savings)" />
            <span>{t('nav.savings')}</span>
          </NavLink>

          <NavLink
            to="/analytics"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-muted)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            <BarChart3 size={20} color="var(--color-primary)" />
            <span>{t('nav.analytics')}</span>
          </NavLink>

          <NavLink
            to="/settings"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-muted)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            <Settings size={20} color="var(--text-secondary)" />
            <span>{t('nav.settings')}</span>
          </NavLink>

          <NavLink
            to="/help"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-muted)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            <HelpCircle size={20} color="var(--text-secondary)" />
            <span>{t('nav.help')}</span>
          </NavLink>

          <div style={{ marginTop: 'var(--space-2)' }}>
            <InstallAppButton variant="banner" />
          </div>
        </div>
      </Drawer>

      <ShortcutsModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <ToastContainer />
    </div>
  )
}
