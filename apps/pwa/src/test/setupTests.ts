import '@testing-library/jest-dom/vitest'
import '@testing-library/jest-dom'
import { beforeEach, vi } from 'vitest'

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock scrollTo
window.scrollTo = () => {}

// Mock virtual:pwa-register
vi.mock('virtual:pwa-register', () => ({
  registerSW: vi.fn(),
}))

// Mock virtual:pwa-register/react if tested
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    offlineReady: [false, vi.fn()],
    needRefresh: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  }),
}))

// Mock navigator.vibrate
if (typeof navigator !== 'undefined') {
  Object.defineProperty(navigator, 'vibrate', {
    writable: true,
    value: vi.fn(),
  })
}

// Pre-seed demo evaluator session by default for internal navigation tests
beforeEach(() => {
  if (!localStorage.getItem('gestor_gastos_session')) {
    localStorage.setItem(
      'gestor_gastos_session',
      JSON.stringify({
        user: {
          id: 'usr_evaluator_academic',
          email: 'evaluador@universidad.edu',
          name: 'Prof. Evaluador Académico',
          role: 'evaluator',
          university: 'Comité de Evaluación de Proyecto',
          createdAt: '2026-01-15T08:00:00.000Z',
          lastLoginAt: '2026-10-04T17:00:00.000Z',
        },
        token: 'test_token_123',
        expiresAt: '2099-01-01T00:00:00.000Z',
      })
    )
  }
})


