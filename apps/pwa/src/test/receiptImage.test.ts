import { describe, expect, it } from 'vitest'
import { storageService } from '../services/storageService'
import { compressImage } from '../utils/imageCompressor'

describe('Persistencia y visualización de comprobante de cámara', () => {
  it('comprime imágenes manteniendo una cadena válida dataURL', async () => {
    // Canvas dummy data URL
    const dummySvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="red"/></svg>'
    const compressed = await compressImage(dummySvg, 800, 0.75)
    expect(compressed).toBeDefined()
    expect(typeof compressed).toBe('string')
  })

  it('guarda un movimiento con foto y lo recupera intacto', async () => {
    const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...'
    const newMov = await storageService.createMovement({
      title: 'Factura Almuerzo Restaurante',
      amount: 45000,
      type: 'expense',
      categoryId: 'cat-food',
      date: '2026-10-10',
      paymentMethod: 'cash',
      receiptImage: testImage,
      notes: 'Factura escaneada con cámara',
    })

    expect(newMov.id).toBeDefined()
    expect(newMov.receiptImage).toBe(testImage)

    const retrieved = await storageService.getMovementById(newMov.id)
    expect(retrieved).not.toBeNull()
    expect(retrieved?.receiptImage).toBe(testImage)
    expect(retrieved?.title).toBe('Factura Almuerzo Restaurante')
  })
})
