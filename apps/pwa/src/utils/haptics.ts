/**
 * Utilidad de retroalimentación háptica (vibración) para dispositivos móviles táctiles.
 * Proporciona patrones de vibración sutiles emulando el Taptic Engine / hápticos de Android.
 */
export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

export const triggerHaptic = (type: HapticFeedbackType = 'light'): void => {
  if (typeof window === 'undefined') return
  if (!('vibrate' in navigator) || typeof navigator.vibrate !== 'function') return

  try {
    switch (type) {
      case 'light':
        // Pulsación extremadamente sutil y corta para clics de navegación
        navigator.vibrate(8)
        break
      case 'medium':
        // Pulsación para aperturas de modales, hojas o acciones secundarias
        navigator.vibrate(16)
        break
      case 'heavy':
        // Pulsación firme para confirmación de acciones
        navigator.vibrate(28)
        break
      case 'success':
        // Patrón doble sutil que celebra el guardado exitoso
        navigator.vibrate([10, 40, 15])
        break
      case 'warning':
        navigator.vibrate([20, 60, 20])
        break
      case 'error':
        // Patrón de alerta en error de validación
        navigator.vibrate([25, 40, 25, 40, 30])
        break
    }
  } catch {
    // Si el navegador bloquea la vibración por políticas de interacción, silenciar sin fallar
  }
}
