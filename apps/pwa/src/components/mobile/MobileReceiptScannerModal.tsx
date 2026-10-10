import React, { useEffect, useRef, useState } from 'react'
import {
  Camera,
  Check,
  DollarSign,
  Edit3,
  Image as ImageIcon,
  QrCode,
  RefreshCw,
  Sparkles,
  Tag,
  X,
} from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { triggerHaptic } from '../../utils/haptics'
import { Button } from '../common/Button'
import { compressImage } from '../../utils/imageCompressor'

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
  const [editableAmount, setEditableAmount] = useState<string>('')
  const [editableTitle, setEditableTitle] = useState<string>('')
  const [qrDetected, setQrDetected] = useState<boolean>(false)

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
    setEditableAmount('')
    setEditableTitle('')
    setQrDetected(false)
    setIsScanning(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  // Motor de análisis real: BarcodeDetector (QR Facturas DIAN) + Shape Detection TextDetector
  const analyzeRealReceipt = async (
    dataUrl: string
  ): Promise<{ amount?: number; title?: string; qrFound?: boolean }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = async () => {
        let detectedAmount: number | undefined
        let detectedTitle: string | undefined
        let qrFound = false

        // 1. Detección de Código QR de Factura Electrónica (DIAN / Fiscal)
        if ('BarcodeDetector' in window) {
          try {
            // @ts-expect-error - Shape Detection API experimental en Chromium
            const barcodeDetector = new window.BarcodeDetector({
              formats: ['qr_code', 'code_128', 'ean_13', 'data_matrix'],
            })
            const barcodes = await barcodeDetector.detect(img)
            for (const barcode of barcodes) {
              const rawValue: string = barcode.rawValue || ''
              // Patrones estándar de facturas DIAN: ValTolFac=1234.00 | ValFac=1234.00 | Total=...
              const valTolMatch =
                rawValue.match(/ValTolFac=([\d.]+)/i) ||
                rawValue.match(/ValFac=([\d.]+)/i) ||
                rawValue.match(/Total=([\d.]+)/i) ||
                rawValue.match(/val=([\d.]+)/i)

              if (valTolMatch && valTolMatch[1]) {
                const parsed = parseFloat(valTolMatch[1])
                if (!isNaN(parsed) && parsed > 0) {
                  detectedAmount = parsed
                  qrFound = true
                  detectedTitle = 'Factura Electrónica DIAN'
                  break
                }
              }
            }
          } catch {
            // Continuar con detección óptica de texto
          }
        }

        // 2. Detección óptica de texto nativa (Android Chrome TextDetector)
        if (!detectedAmount && 'TextDetector' in window) {
          try {
            // @ts-expect-error - Shape Detection TextDetector en Android
            const textDetector = new window.TextDetector()
            const detectedTexts = await textDetector.detect(img)
            const lines: string[] = detectedTexts.map((t: { rawValue: string }) => t.rawValue)

            // Buscar líneas clave de totales
            for (let i = lines.length - 1; i >= 0; i--) {
              const line = lines[i]
              if (/TOTAL|PAGAR|VALOR|NETO|SUBTOTAL/i.test(line)) {
                const numMatch = line.match(/\$?\s*([\d]{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/)
                if (numMatch && numMatch[1]) {
                  const clean = numMatch[1].replace(/\./g, '').replace(/,/g, '.')
                  const val = parseFloat(clean)
                  if (!isNaN(val) && val > 0) {
                    detectedAmount = val
                    break
                  }
                }
              }
            }

            // Sugerir nombre del comercio desde las primeras líneas del ticket
            if (lines.length > 0 && !detectedTitle) {
              const firstLine = lines[0]?.trim()
              if (firstLine && firstLine.length > 3 && firstLine.length < 35) {
                detectedTitle = firstLine
              }
            }
          } catch {
            // Ignorado
          }
        }

        resolve({ amount: detectedAmount, title: detectedTitle, qrFound })
      }

      img.onerror = () => {
        resolve({})
      }

      img.src = dataUrl
    })
  }

  const processCapturedImage = async (imageData: string) => {
    setCapturedImage(imageData)
    setIsScanning(true)
    triggerHaptic('medium')

    try {
      const result = await analyzeRealReceipt(imageData)

      // Pequeño retardo para visualización del láser de escaneo
      await new Promise((r) => setTimeout(r, 900))

      setIsScanning(false)
      triggerHaptic('success')

      if (result.amount) {
        setEditableAmount(String(result.amount))
      } else {
        setEditableAmount('')
      }

      if (result.title) {
        setEditableTitle(result.title)
      } else {
        setEditableTitle('Compra / Factura')
      }

      setQrDetected(!!result.qrFound)
    } catch {
      setIsScanning(false)
      setEditableAmount('')
      setEditableTitle('Compra / Factura')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    triggerHaptic('medium')
    try {
      const compressed = await compressImage(file, 1200, 0.78)
      if (compressed) {
        await processCapturedImage(compressed)
        return
      }
    } catch (err) {
      console.warn('Fallo compresión inicial, usando fallback directo:', err)
    }

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

    const parsedAmount = parseFloat(editableAmount)
    onScanComplete({
      image: capturedImage,
      amount: !isNaN(parsedAmount) && parsedAmount > 0 ? parsedAmount : undefined,
      title: editableTitle.trim() || 'Compra / Factura',
      notes: qrDetected
        ? 'Factura con Código QR DIAN digitalizada con Cámara Móvil'
        : 'Factura física digitalizada con la Cámara Móvil PWA',
    })
    handleClose()
  }

  const handleRetake = () => {
    triggerHaptic('light')
    setCapturedImage(null)
    setEditableAmount('')
    setEditableTitle('')
    setQrDetected(false)
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
          maxWidth: '460px',
          maxHeight: '92vh',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid rgba(212, 160, 23, 0.3)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          overflowY: 'auto',
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

        {/* Estado mientras analiza la imagen */}
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
              padding: '0.6rem',
              background: 'rgba(234, 179, 8, 0.1)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Sparkles size={16} />
            <span>{t('mobileFeatures.analyzing')}</span>
          </div>
        )}

        {/* Panel de Verificación y Ajuste del Valor Real de la Factura */}
        {capturedImage && !isScanning && (
          <div
            style={{
              padding: '1rem',
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(234, 179, 8, 0.35)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#facc15',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Edit3 size={14} />
                {t('mobileFeatures.enterRealAmount')}
              </span>
              {qrDetected && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    background: 'rgba(5, 150, 105, 0.2)',
                    color: '#10b981',
                    border: '1px solid rgba(5, 150, 105, 0.4)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <QrCode size={12} />
                  {t('mobileFeatures.qrDetected')}
                </span>
              )}
            </div>

            {/* Campo Monto Total Real */}
            <div>
              <label
                htmlFor="scanned-real-amount"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {t('mobileFeatures.detectedAmount')} (COP)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    color: '#10b981',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                  }}
                >
                  <DollarSign size={18} />
                </span>
                <input
                  id="scanned-real-amount"
                  type="number"
                  inputMode="numeric"
                  placeholder={t('mobileFeatures.amountPlaceholder')}
                  value={editableAmount}
                  onChange={(e) => setEditableAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.25rem',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#10b981',
                    backgroundColor: 'var(--bg-surface-muted)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-lg)',
                    fontFamily: 'var(--font-display)',
                  }}
                />
              </div>
            </div>

            {/* Campo Concepto / Comercio */}
            <div>
              <label
                htmlFor="scanned-real-title"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {t('mobileFeatures.detectedConcept')}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Tag size={16} />
                </span>
                <input
                  id="scanned-real-title"
                  type="text"
                  placeholder={t('mobileFeatures.conceptPlaceholder')}
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 1rem 0.6rem 2.25rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-surface-muted)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                />
              </div>
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
