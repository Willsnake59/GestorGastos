import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, Home } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { useLanguage } from '../context/LanguageContext'

export const NotFoundPage: React.FC = () => {
  const { t } = useLanguage()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: 'var(--space-4)',
      }}
    >
      <Card style={{ maxWidth: '460px', textAlign: 'center', padding: 'var(--space-8)' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-bg, rgba(5, 150, 105, 0.1))',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4) auto',
          }}
        >
          <FileQuestion size={32} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
          {t('notFound.title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 'var(--space-6)', lineHeight: 1.5 }}>
          {t('notFound.desc')}
        </p>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button variant="primary" icon={<Home size={18} />}>
            {t('notFound.backBtn')}
          </Button>
        </Link>
      </Card>
    </div>
  )
}
