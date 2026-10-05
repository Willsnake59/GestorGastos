import React from 'react'
import { Modal } from './Modal'
import { Keyboard } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export interface ShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage()

  const shortcutGroups = [
    {
      group: t('shortcuts.groupQuick'),
      items: [
        { key: 'G', description: t('shortcuts.descG') },
        { key: 'I', description: t('shortcuts.descI') },
        { key: 'N', description: t('shortcuts.descN') },
      ],
    },
    {
      group: t('shortcuts.groupNav'),
      items: [
        { key: '1', description: t('shortcuts.desc1') },
        { key: '2 / M', description: t('shortcuts.desc2') },
        { key: '3 / D', description: t('shortcuts.desc3') },
        { key: '4 / A', description: t('shortcuts.desc4') },
        { key: '5 / P', description: t('shortcuts.desc5') },
        { key: 'S', description: t('shortcuts.descS') },
      ],
    },
    {
      group: t('shortcuts.groupGeneral'),
      items: [
        { key: '?', description: t('shortcuts.descHelp') },
        { key: 'Esc', description: t('shortcuts.descEsc') },
      ],
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('shortcuts.title')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {t('shortcuts.desc')}
        </p>

        {shortcutGroups.map((grp) => (
          <div key={grp.group}>
            <h4
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 'var(--space-2)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Keyboard size={14} />
              {grp.group}
            </h4>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                backgroundColor: 'var(--bg-surface-muted)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {grp.items.map((item) => (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem',
                  }}
                >
                  <span style={{ color: 'var(--text-primary)' }}>{item.description}</span>
                  <kbd
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-medium)',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.78rem',
                      color: 'var(--text-primary)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    }}
                  >
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
