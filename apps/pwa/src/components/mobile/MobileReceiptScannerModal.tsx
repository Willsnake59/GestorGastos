import React, { useEffect, useRef, useState } from 'react'
import { Camera, Check, RefreshCw, Sparkles, X, Image as ImageIcon } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { triggerHaptic } from '../../utils/haptics'
import { Button } from '../common/Button'

export interface ScannedReceiptData {
  image: string
  amount?: number
  title?: string
  notes?: string
}

export interface MobileReceiptScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onScanComplete: (data: ScannedReceiptData) => void
}

export const MobileReceiptScannerModal: React.FC<MobileReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
}) => {
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [detectedData, setDetectedData] = useState<{ amount: number; title: string } | null>(null)

  useEffect(() => {
    if (isOpen) {
      triggerHaptic('medium')
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  const handleClose = () => {
    triggerHaptic('light')
    setCapturedImage(null)
    setDetectedData(null)
    setIsScanning(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  const processCapturedImage = (imageData: string) => {
    setCapturedImage(imageData)
    setIsScanning(true)
    triggerHaptic('medium')

    // Simulación de escaneo inteligente de comprobante (OCR Fintech)
    setTimeout(() => {
      setIsScanning(false)
      triggerHaptic('success')

      // Monto y concepto detectado realista para demostración académica
      const mockAmounts = [24500, 38000, 52000, 15900, 43200, 89000]
      const randomAmount = mockAmounts[Math.floor(Math.random() * mockAmounts.length)]
      const mockConcepts = [
        'Supermercado / Mercado',
        'Almuerzo Restaurante',
        'Farmacia & Salud',
        'Combustible Estación',
        'Café de Especialidad',
      ]
      const randomConcept = mockConcepts[Math.floor(Math.random() * mockConcepts.length)]

      setDetectedData({
        amount: randomAmount,
        title: randomConcept,
      })
    }, 1800)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    triggerHaptic('medium')
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      processCapturedImage(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleApply = () => {
    if (!capturedImage) return
    triggerHaptic('success')
    onScanComplete({
      image: capturedImage,
      amount: detectedData?.amount,
      title: detectedData?.title,
      notes: 'Factura física digitalizada con la Cámara Móvil PWA',
    })
    handleClose()
  }

  const handleRetake = () => {
    triggerHaptic('light')
    setCapturedImage(null)
    setDetectedData(null)
    setIsScanning(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
      style={{
        zIndex: 1100,
        padding: '1rem',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-label="Escáner móvil de tickets"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid rgba(212, 160, 23, 0.3)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1.25rem',
        }}
      >
        {/* Cabecera */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="mobile-exclusive-badge">{t('mobileFeatures.exclusiveBadge')}</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              {t('mobileFeatures.scannerTitle')}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t('common.cancel')}
            style={{
              background: 'var(--bg-surface-muted)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Input nativo de cámara móvil con captura trasera */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="mobile-camera-input"
        />

        {/* Visor / Previsualización */}
        <div className="scanner-viewfinder">
          <div className="scanner-corner scanner-corner-tl" />
          <div className="scanner-corner scanner-corner-tr" />
          <div className="scanner-corner scanner-corner-bl" />
          <div className="scanner-corner scanner-corner-br" />

          {/* Línea láser de escaneo si está analizando */}
          {isScanning && <div className="scanner-laser-line" />}

          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Ticket capturado"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: '#000',
              }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                color: 'var(--text-muted)',
                padding: '1rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(212, 160, 23, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#eab308',
                }}
              >
                <Camera size={28} />
              </div>
              <p style={{ fontSize: '0.85rem', margin: 0, maxWidth: '240px' }}>
                {t('mobileFeatures.scannerSubtitle')}
              </p>
            </div>
          )}
        </div>

        {/* Estado o Datos Extraídos */}
        {isScanning && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#facc15',
              fontSize: '0.88rem',
              fontWeight: 600,
              padding: '0.5rem',
              background: 'rgba(234, 179, 8, 0.1)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Sparkles size={16} />
            <span>{t('mobileFeatures.analyzing')}</span>
          </div>
        )}

        {detectedData && !isScanning && (
          <div
            style={{
              padding: '0.75rem',
              background: 'rgba(5, 150, 105, 0.1)',
              border: '1px solid rgba(5, 150, 105, 0.3)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {t('mobileFeatures.detectedConcept')}
              </span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {detectedData.title}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {t('mobileFeatures.detectedAmount')}
              </span>
              <strong style={{ fontSize: '1.1rem', color: '#10b981', fontWeight: 800 }}>
                ${detectedData.amount.toLocaleString()} COP
              </strong>
            </div>
          </div>
        )}

        {/* Botonera de acciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
          {!capturedImage ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="primary"
                isFullWidth
                icon={<Camera size={18} />}
                onClick={() => {
                  triggerHaptic('medium')
                  // En móviles reales el input capture="environment" abre directamente la cámara nativa
                  fileInputRef.current?.click()
                }}
              >
                {t('mobileFeatures.openCamera')}
              </Button>
              <Button
                variant="secondary"
                icon={<ImageIcon size={18} />}
                aria-label="Seleccionar de galería"
                onClick={() => {
                  triggerHaptic('light')
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture')
                    fileInputRef.current.click()
                  }
                }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="ghost"
                icon={<RefreshCw size={16} />}
                onClick={handleRetake}
                disabled={isScanning}
              >
                {t('mobileFeatures.retake')}
              </Button>
              <Button
                variant="primary"
                isFullWidth
                icon={<Check size={18} />}
                onClick={handleApply}
                disabled={isScanning}
              >
                {t('mobileFeatures.applyToExpense')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
