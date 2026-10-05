import React, { createContext, useContext, useEffect, useState } from 'react'
import type { ThemePreference } from '../types'
import { settingsService } from '../services/settingsService'

interface ThemeContextType {
  theme: ThemePreference
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: ThemePreference) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme] = useState<ThemePreference>('dark')
  const resolvedTheme: 'light' | 'dark' = 'dark'

  // Aplicar tema en el elemento HTML permanentemente
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', 'dark')
    root.classList.add('dark')
    root.classList.remove('light')

    // Actualizar meta theme-color para navegadores móviles y PWA
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#08080a')
    }
  }, [])

  const setTheme = () => {
    settingsService.setTheme('dark')
  }

  const toggleTheme = () => {
    // Modo oscuro exclusivo Slash
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe ser utilizado dentro de un ThemeProvider')
  }
  return context
}
