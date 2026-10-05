import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react'
import { Card } from '../components/common/Card'
import { useLanguage } from '../context/LanguageContext'

export const HelpPage: React.FC = () => {
  const { t } = useLanguage()
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const faqs = [
    { question: t('help.faq1Q'), answer: t('help.faq1A') },
    { question: t('help.faq2Q'), answer: t('help.faq2A') },
    { question: t('help.faq3Q'), answer: t('help.faq3A') },
    { question: t('help.faq4Q'), answer: t('help.faq4A') },
    { question: t('help.faq5Q'), answer: t('help.faq5A') },
    { question: t('help.faq6Q'), answer: t('help.faq6A') },
  ]

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{t('help.title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          {t('help.subtitle')}
        </p>
      </div>

      {/* Guía Rápida en 4 Pasos */}
      <Card>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          {t('help.quickGuide')}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-bg, rgba(5, 150, 105, 0.1))',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontWeight: 700,
              }}
            >
              1
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t('help.step1Title')}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {t('help.step1Desc')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-debt-bg)',
                color: 'var(--color-debt)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontWeight: 700,
              }}
            >
              2
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t('help.step2Title')}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {t('help.step2Desc')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-savings-bg)',
                color: 'var(--color-savings)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontWeight: 700,
              }}
            >
              3
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t('help.step3Title')}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {t('help.step3Desc')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-muted)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontWeight: 700,
              }}
            >
              4
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t('help.step4Title')}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {t('help.step4Desc')}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Preguntas Frecuentes Acordeón */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          {t('help.faqsTitle')}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx

            return (
              <Card key={idx} style={{ padding: 0, overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-4)',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 var(--space-4) var(--space-4) var(--space-4)',
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: 'var(--space-3)',
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Tarjeta de Privacidad y Soporte */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-bg, rgba(5, 150, 105, 0.1))',
              color: 'var(--color-primary)',
            }}
          >
            <Lock size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{t('help.privacyTitle')}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('help.privacyDesc')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
