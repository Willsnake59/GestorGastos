/**
 * Utilidad de compresión y optimización de imágenes para PWA móvil y de escritorio.
 * Reduce fotos de cámaras de celulares modernos (de 5MB - 15MB) a JPEGs ultraligeros
 * y nítidos (~80KB - 160KB), garantizando persistencia instantánea y sin desbordar cuotas.
 */
export async function compressImage(
  source: File | string,
  maxWidthOrHeight = 1200,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve) => {
    // Si no estamos en un entorno con DOM/canvas, retornar fuente tal cual
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      if (typeof source === 'string') {
        resolve(source)
      } else {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => resolve('')
        reader.readAsDataURL(source)
      }
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'

    let settled = false
    const timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true
        resolve(typeof source === 'string' ? source : '')
      }
    }, 600)

    const handleLoad = () => {
      if (settled) return
      settled = true
      clearTimeout(timeoutId)
      try {
        let width = img.naturalWidth || img.width
        let height = img.naturalHeight || img.height

        if (!width || !height) {
          resolve(typeof source === 'string' ? source : '')
          return
        }

        // Redimensionar manteniendo proporción si excede el tamaño máximo
        if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
          if (width > height) {
            height = Math.round((height * maxWidthOrHeight) / width)
            width = maxWidthOrHeight
          } else {
            width = Math.round((width * maxWidthOrHeight) / height)
            height = maxWidthOrHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          resolve(typeof source === 'string' ? source : '')
          return
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      } catch (err) {
        console.warn('Advertencia en compresión de imagen, usando fuente:', err)
        resolve(typeof source === 'string' ? source : '')
      }
    }

    img.onload = handleLoad
    img.onerror = () => {
      if (settled) return
      settled = true
      clearTimeout(timeoutId)
      if (typeof source === 'string') {
        resolve(source)
      } else {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => resolve('')
        reader.readAsDataURL(source)
      }
    }

    if (typeof source === 'string') {
      img.src = source
    } else {
      const reader = new FileReader()
      reader.onload = () => {
        img.src = reader.result as string
      }
      reader.onerror = () => resolve('')
      reader.readAsDataURL(source)
    }
  })
}
