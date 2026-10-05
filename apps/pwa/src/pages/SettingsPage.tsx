import React, { useRef, useState } from 'react'
import {
  Download,
  Languages,
  Moon,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'
import { usePWA } from '../hooks/usePWA'
import type { LanguageCode } from '../types'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Select } from '../components/common/Select'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Badge } from '../components/common/Badge'

export const SettingsPage: React.FC = () => {
  const { resetToDemo, clearAll, exportData, importData } = useData()
  const { success, error: toastError } = useToast()
  const { language, setLanguage, t } = useLanguage()
  const { isOnline, isInstalled, canInstall, promptInstall } = usePWA()

  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showDemoConfirm, setShowDemoConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const languageOptions = [
    { value: 'es', label: 'Español (ES)' },
    { value: 'en', label: 'English (US)' },
  ]

  const handleExport = async () => {
    try {
      const json = await exportData()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gestor-gastos-respaldo-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      success(language === 'en' ? 'Backup exported successfully' : 'Copia de seguridad exportada correctamente')
    } catch {
      toastError(language === 'en' ? 'Error exporting data' : 'Error al exportar los datos')
    }
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const content = event.target?.result as string
      if (content) {
        setIsProcessing(true)
        const ok = await importData(content)
        setIsProcessing(false)
        if (ok) {
          success(language === 'en' ? 'Backup restored successfully' : 'Copia de seguridad restaurada exitosamente')
        } else {
          toastError(
            language === 'en'
              ? 'The selected file is not a valid backup format.'
              : 'El archivo seleccionado no tiene un formato válido de respaldo.'
          )
        }
      }
    }
    reader.readAsText(file)
  }

  const handleResetDemo = async () => {
    setIsProcessing(true)
    try {
      await resetToDemo()
      success(language === 'en' ? 'Demo dataset restored successfully' : 'Datos de demostración restaurados correctamente')
      setShowDemoConfirm(false)
    } catch {
      toastError(language === 'en' ? 'Error restoring demo data' : 'Error al restablecer los datos')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClearAll = async () => {
    setIsProcessing(true)
    try {
      await clearAll()
      success(language === 'en' ? 'All local records deleted' : 'Todos los registros locales fueron eliminados')
      setShowClearConfirm(false)
    } catch {
      toastError(language === 'en' ? 'Error clearing data' : 'Error al limpiar la base de datos')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{t('settings.title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Preferencias Visuales e Idioma */}
      <Card>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          {t('settings.appearance')}
        </h2>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label className="form-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
            {t('settings.theme')}
          </label>
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--bg-surface-muted)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-obsidian)',
                  border: '1px solid var(--color-gilded-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-gilded-gradient)',
                }}
              >
                <Moon size={14} />
              </div>
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--color-paper-white)', display: 'block' }}>
                  Slash Midnight Vault
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-fog)' }}>
                  {t('settings.themeDesc')}
                </span>
              </div>
            </div>
            <Badge variant="income">{t('settings.themeActive')}</Badge>
          </div>
        </div>

        {/* Selector de Idioma (Totalmente funcional) */}
        <div style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <Languages size={18} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.925rem', fontWeight: 600 }}>{t('settings.language')}</span>
          </div>
          <Select
            id="settings-language-select"
            value={language}
            onChange={(e) => {
              const next = e.target.value as LanguageCode
              setLanguage(next)
              success(next === 'en' ? 'Language switched to English' : 'Idioma cambiado a Español')
            }}
            options={languageOptions}
            helperText={t('settings.languageHelp')}
          />
        </div>
      </Card>

      {/* Estado PWA y Conectividad */}
      <Card>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          {t('settings.pwaStatus')}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong>{t('settings.internetConn')}</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {isOnline ? t('settings.online') : t('settings.offline')}
              </p>
            </div>
            <Badge variant={isOnline ? 'income' : 'expense'}>
              {isOnline ? t('settings.online') : t('settings.offline')}
            </Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
            <div>
              <strong>{t('settings.localFirstMode')}</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {t('settings.localFirstDesc')}
              </p>
            </div>
            {isInstalled ? (
              <Badge variant="income">{t('settings.installed')}</Badge>
            ) : canInstall ? (
              <Button size="sm" variant="primary" onClick={promptInstall}>
                {t('settings.installNow')}
              </Button>
            ) : (
              <Badge variant="neutral">{t('settings.webBrowser')}</Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Gestión de Datos y Copias de Seguridad */}
      <Card>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          {t('settings.dataManagement')}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
          {t('settings.exportBackupDesc')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              icon={<Download size={16} />}
              onClick={handleExport}
            >
              {t('settings.downloadBackupBtn')}
            </Button>

            <Button
              variant="outline"
              icon={<Upload size={16} />}
              onClick={() => fileInputRef.current?.click()}
            >
              {t('settings.importBackup')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-4)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="secondary"
              icon={<RotateCcw size={16} />}
              onClick={() => setShowDemoConfirm(true)}
            >
              {t('settings.resetDemoBtn')}
            </Button>

            <Button
              variant="danger"
              icon={<Trash2 size={16} />}
              onClick={() => setShowClearConfirm(true)}
            >
              {t('settings.clearAllBtn')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Información de Versión y Licencia */}
      <Card>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          {t('settings.appInfo')}
        </h2>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p><strong>{t('settings.appName')}</strong> Gestor de gastos PWA</p>
          <p><strong>{t('settings.appVersion')}</strong> 1.0.0</p>
          <p><strong>{t('settings.appTech')}</strong> React 19, TypeScript, Vite, Workbox PWA, IndexedDB</p>
          <p><strong>{t('settings.appLicense')}</strong> MIT</p>
        </div>
      </Card>

      {/* Diálogo Restablecer Demo */}
      <ConfirmDialog
        isOpen={showDemoConfirm}
        onClose={() => setShowDemoConfirm(false)}
        onConfirm={handleResetDemo}
        title={t('settings.demoConfirmTitle')}
        message={t('settings.demoConfirmMsg')}
        confirmText={t('settings.demoConfirmBtn')}
        cancelText={t('common.cancel')}
        variant="primary"
        isLoading={isProcessing}
      />

      {/* Diálogo Borrar Todos los Datos */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearAll}
        title={t('settings.clearConfirmTitle')}
        message={t('settings.clearConfirmMsg')}
        confirmText={t('settings.clearConfirmBtn')}
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  )
}
