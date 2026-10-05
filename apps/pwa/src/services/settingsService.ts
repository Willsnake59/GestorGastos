import type { CurrencyCode, LanguageCode, ThemePreference, UserSettings } from '../types'

const SETTINGS_KEY = 'gestor_gastos_settings'

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  currency: 'COP',
  language: 'es',
  showDemoNotice: true,
  dateFormat: 'DD/MM/YYYY',
  soundEffects: false,
}

export const CURRENCY_SYMBOLS: Record<CurrencyCode, { symbol: string; label: string }> = {
  COP: { symbol: '$', label: 'COP - Peso Colombiano' },
  USD: { symbol: 'US$', label: 'USD - Dólar Estadounidense' },
  EUR: { symbol: '€', label: 'EUR - Euro' },
  MXN: { symbol: 'Mex$', label: 'MXN - Peso Mexicano' },
  ARS: { symbol: 'Arg$', label: 'ARS - Peso Argentino' },
  CLP: { symbol: 'CLP$', label: 'CLP - Peso Chileno' },
}

export const settingsService = {
  getSettings(): UserSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      if (!stored) return DEFAULT_SETTINGS
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    } catch {
      return DEFAULT_SETTINGS
    }
  },

  updateSettings(partial: Partial<UserSettings>): UserSettings {
    const current = this.getSettings()
    const updated = { ...current, ...partial }
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
    } catch (err) {
      console.error('Error saving settings to localStorage:', err)
    }
    return updated
  },

  setTheme(theme: ThemePreference): UserSettings {
    return this.updateSettings({ theme })
  },

  setCurrency(currency: CurrencyCode): UserSettings {
    return this.updateSettings({ currency })
  },

  setLanguage(language: LanguageCode): UserSettings {
    return this.updateSettings({ language })
  },

  dismissDemoNotice(): UserSettings {
    return this.updateSettings({ showDemoNotice: false })
  },
}
