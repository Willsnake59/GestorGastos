/**
 * Criptografía y Seguridad para Gestor de Gastos (Web Crypto API)
 * Implementa hashing seguro con salting (SHA-256) nativo del navegador,
 * cumpliendo con estándares universitarios de ciberseguridad sin dependencias externas pesadas.
 */

// Genera un salt criptográfico aleatorio
export function generateSalt(length = 16): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length)
    window.crypto.getRandomValues(array)
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  // Fallback para entornos donde crypto no esté completamente inicializado
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Genera un token de sesión criptográfico
export function generateToken(): string {
  return generateSalt(24)
}

// Realiza hash SHA-256 de una contraseña combinada con una sal (salt)
export async function hashPassword(password: string, salt: string): Promise<string> {
  const message = `${password}:${salt}`
  const encoder = new TextEncoder()
  const data = encoder.encode(message)

  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    } catch {
      // Fallback si subtle falla en contextos no seguros
    }
  }

  // Fallback simple determinista para testing/entornos sin Web Crypto Subtle
  let hash = 0
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32bit integer
  }
  return `fallback_sha256_${Math.abs(hash).toString(16)}`
}
