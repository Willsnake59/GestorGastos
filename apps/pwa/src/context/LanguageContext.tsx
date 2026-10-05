import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { LanguageCode } from '../types'
import { settingsService } from '../services/settingsService'
import { es, en, type TranslationKey } from '../i18n/translations'

export interface LanguageContextType {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
  formatDate: (dateString: string) => string
  formatFullDate: (dateString: string) => string
  getPaymentMethodLabel: (method: string) => string
  formatMovementTitle: (title: string) => string
  formatCategoryName: (category?: { id: string; name: string } | null) => string
  formatDebtTitle: (title: string) => string
  formatSavingsTitle: (title: string) => string
  formatNotes: (notes?: string) => string
}

export const CATEGORY_TRANSLATIONS: Record<string, { es: string; en: string }> = {
  'cat-food': { es: 'Alimentación', en: 'Food & Dining' },
  'cat-housing': { es: 'Vivienda y Servicios', en: 'Housing & Utilities' },
  'cat-transport': { es: 'Transporte', en: 'Transportation' },
  'cat-health': { es: 'Salud y Cuidado', en: 'Health & Care' },
  'cat-entertainment': { es: 'Ocio y Diversión', en: 'Leisure & Entertainment' },
  'cat-education': { es: 'Educación', en: 'Education' },
  'cat-clothes': { es: 'Ropa y Accesorios', en: 'Clothing & Accessories' },
  'cat-salary': { es: 'Salario / Nómina', en: 'Salary / Payroll' },
  'cat-freelance': { es: 'Trabajo Freelance', en: 'Freelance Work' },
  'cat-investments': { es: 'Ahorro e Inversión', en: 'Savings & Investments' },
  'cat-other-expense': { es: 'Otros Gastos', en: 'Other Expenses' },
  'cat-other-income': { es: 'Otros Ingresos', en: 'Other Income' },
}

export const DEMO_TITLES_EN: Record<string, string> = {
  'Pago de Salario Mes Anterior': 'Previous Month Salary Payment',
  'Pago de Salario Quincenal': 'Biweekly Salary Payment',
  'Salario Nómina Quincenal': 'Biweekly Payroll Salary',
  'Proyecto Freelance de Diseño Web': 'Freelance Web Design Project',
  'Proyecto Freelance Frontend': 'Freelance Frontend Project',
  'Supermercado Mensual Éxito': 'Monthly Supermarket Groceries',
  'Supermercado Mensual': 'Monthly Supermarket',
  'Servicio de Energía y Agua Acueducto': 'Power & Water Utilities',
  'Servicios Básicos': 'Basic Utilities',
  'Gasolina Vehículo y Parqueaderos': 'Vehicle Fuel & Parking',
  'Transporte y Gasolina': 'Transport & Gasoline',
  'Cena Restaurante y Salida Fin de Semana': 'Weekend Dinner & Restaurant',
  'Cena de Fin de Semana': 'Weekend Dinner',
  'Abono a deuda: Préstamo de Libre Inversión': 'Debt Payment: Unrestricted Investment Loan',
  'Cobro de préstamo: Préstamo a Juan David': 'Loan Collection: Loan to Juan David',
  'Aporte a meta: Fondo de Emergencia (3 meses)': 'Goal Contribution: Emergency Fund (3 months)',
  'Aporte a meta: Vacaciones Fin de Año': 'Goal Contribution: Year-End Vacation',
}

export const DEMO_TITLES_ES: Record<string, string> = {
  'Previous Month Salary Payment': 'Pago de Salario Mes Anterior',
  'Biweekly Salary Payment': 'Pago de Salario Quincenal',
  'Biweekly Payroll Salary': 'Salario Nómina Quincenal',
  'Freelance Web Design Project': 'Proyecto Freelance de Diseño Web',
  'Freelance Frontend Project': 'Proyecto Freelance Frontend',
  'Monthly Supermarket Groceries': 'Supermercado Mensual Éxito',
  'Monthly Supermarket': 'Supermercado Mensual',
  'Power & Water Utilities': 'Servicio de Energía y Agua Acueducto',
  'Basic Utilities': 'Servicios Básicos',
  'Vehicle Fuel & Parking': 'Gasolina Vehículo y Parqueaderos',
  'Transport & Gasoline': 'Transporte y Gasolina',
  'Weekend Dinner & Restaurant': 'Cena Restaurante y Salida Fin de Semana',
  'Weekend Dinner': 'Cena de Fin de Semana',
  'Debt Payment: Unrestricted Investment Loan': 'Abono a deuda: Préstamo de Libre Inversión',
  'Loan Collection: Loan to Juan David': 'Cobro de préstamo: Préstamo a Juan David',
  'Goal Contribution: Emergency Fund (3 months)': 'Aporte a meta: Fondo de Emergencia (3 meses)',
  'Goal Contribution: Year-End Vacation': 'Aporte a meta: Vacaciones Fin de Año',
}

export const DEMO_DEBTS_EN: Record<string, string> = {
  'Préstamo de Libre Inversión': 'Unrestricted Investment Loan',
  'Préstamo a Juan David': 'Loan to Juan David',
}

export const DEMO_DEBTS_ES: Record<string, string> = {
  'Unrestricted Investment Loan': 'Préstamo de Libre Inversión',
  'Loan to Juan David': 'Préstamo a Juan David',
}

export const DEMO_SAVINGS_EN: Record<string, string> = {
  'Fondo de Emergencia (3 meses)': 'Emergency Fund (3 months)',
  'Vacaciones Fin de Año': 'Year-End Vacation',
}

export const DEMO_SAVINGS_ES: Record<string, string> = {
  'Emergency Fund (3 months)': 'Fondo de Emergencia (3 meses)',
  'Year-End Vacation': 'Vacaciones Fin de Año',
}

export const DEMO_NOTES_EN: Record<string, string> = {
  'Aporte inicial del fondo': 'Initial fund contribution',
  'Aporte de la nómina pasada': 'Previous payroll contribution',
  'Aporte de prima o bonificación': 'Bonus contribution',
  'Viaje a la costa con la familia.': 'Trip to the coast with family.',
  'Para imprevistos médicos, reparaciones o tranquilidad laboral.': 'For medical emergencies, repairs or peace of mind.',
  'Pago extraordinario inicial': 'Initial extraordinary payment',
  'Primer abono recibido': 'First payment received',
  'Cuota mensual fija para saldar en 3 meses.': 'Fixed monthly installment to settle in 3 months.',
  'Le presté para un imprevisto médico.': 'Lent for a medical emergency.',
  'Combustible y pasajes semanales.': 'Weekly fuel and fares.',
  'Salida a restaurante con amigos.': 'Outing to restaurant with friends.',
  'Compra de alimentos y víveres del mes.': 'Monthly grocery and food shopping.',
  'Pago quincenal de empresa.': 'Biweekly company salary payment.',
  'Pago por desarrollo de sitio web corporativo.': 'Payment for corporate website development.',
  'Servicios de agua, luz, gas e internet.': 'Water, electricity, gas and internet utilities.',
  'Banco Aliado': 'Partner Bank',
}

export const DEMO_NOTES_ES: Record<string, string> = {
  'Initial fund contribution': 'Aporte inicial del fondo',
  'Previous payroll contribution': 'Aporte de la nómina pasada',
  'Bonus contribution': 'Aporte de prima o bonificación',
  'Trip to the coast with family.': 'Viaje a la costa con la familia.',
  'For medical emergencies, repairs or peace of mind.': 'Para imprevistos médicos, reparaciones o tranquilidad laboral.',
  'Initial extraordinary payment': 'Pago extraordinario inicial',
  'First payment received': 'Primer abono recibido',
  'Fixed monthly installment to settle in 3 months.': 'Cuota mensual fija para saldar en 3 meses.',
  'Lent for a medical emergency.': 'Le presté para un imprevisto médico.',
  'Weekly fuel and fares.': 'Combustible y pasajes semanales.',
  'Outing to restaurant with friends.': 'Salida a restaurante con amigos.',
  'Monthly grocery and food shopping.': 'Compra de alimentos y víveres del mes.',
  'Biweekly company salary payment.': 'Pago quincenal de empresa.',
  'Payment for corporate website development.': 'Pago por desarrollo de sitio web corporativo.',
  'Water, electricity, gas and internet utilities.': 'Servicios de agua, luz, gas e internet.',
  'Partner Bank': 'Banco Aliado',
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return settingsService.getSettings().language || 'es'
  })

  const setLanguage = useCallback((lang: LanguageCode) => {
    settingsService.setLanguage(lang)
    setLanguageState(lang)
    document.documentElement.lang = lang
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const dict = language === 'en' ? en : es
      let text = (dict as Record<string, string>)[key] || (es as Record<string, string>)[key] || key
      if (params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal))
        })
      }
      return text
    },
    [language]
  )

  const formatDate = useCallback(
    (dateString: string): string => {
      if (!dateString) return ''
      try {
        const [year, month, day] = dateString.split('-').map(Number)
        if (!year || !month || !day) return dateString

        const d = new Date(year, month - 1, day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const targetDate = new Date(d)
        targetDate.setHours(0, 0, 0, 0)

        const diffTime = today.getTime() - targetDate.getTime()
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return language === 'en' ? 'Today' : 'Hoy'
        if (diffDays === 1) return language === 'en' ? 'Yesterday' : 'Ayer'
        if (diffDays === -1) return language === 'en' ? 'Tomorrow' : 'Mañana'

        const locale = language === 'en' ? 'en-US' : 'es-ES'
        return new Intl.DateTimeFormat(locale, {
          day: 'numeric',
          month: 'short',
          year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        }).format(d)
      } catch {
        return dateString
      }
    },
    [language]
  )

  const formatFullDate = useCallback(
    (dateString: string): string => {
      if (!dateString) return ''
      try {
        const [year, month, day] = dateString.split('-').map(Number)
        if (!year || !month || !day) return dateString
        const d = new Date(year, month - 1, day)
        const locale = language === 'en' ? 'en-US' : 'es-ES'
        return new Intl.DateTimeFormat(locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(d)
      } catch {
        return dateString
      }
    },
    [language]
  )

  const getPaymentMethodLabel = useCallback(
    (method: string): string => {
      if (language === 'en') {
        switch (method) {
          case 'cash':
            return 'Cash'
          case 'credit_card':
            return 'Credit Card'
          case 'debit_card':
            return 'Debit Card'
          case 'transfer':
            return 'Direct Transfer / Wire'
          default:
            return 'Other'
        }
      }
      switch (method) {
        case 'cash':
          return 'Efectivo'
        case 'credit_card':
          return 'Tarjeta de Crédito'
        case 'debit_card':
          return 'Tarjeta Débito'
        case 'transfer':
          return 'Transferencia / PSE'
        default:
          return 'Otro'
      }
    },
    [language]
  )

  const formatMovementTitle = useCallback(
    (title: string): string => {
      if (!title) return ''
      if (language === 'en') {
        if (DEMO_TITLES_EN[title]) return DEMO_TITLES_EN[title]
        if (title.startsWith('Aporte a meta: ')) {
          const goal = title.replace('Aporte a meta: ', '')
          return `Goal Contribution: ${DEMO_SAVINGS_EN[goal] || goal}`
        }
        if (title.startsWith('Retiro de meta: ')) {
          const goal = title.replace('Retiro de meta: ', '')
          return `Goal Withdrawal: ${DEMO_SAVINGS_EN[goal] || goal}`
        }
        if (title.startsWith('Abono a deuda: ')) {
          const debt = title.replace('Abono a deuda: ', '')
          return `Debt Payment: ${DEMO_DEBTS_EN[debt] || debt}`
        }
        if (title.startsWith('Cobro de préstamo: ')) {
          const debt = title.replace('Cobro de préstamo: ', '')
          return `Loan Collection: ${DEMO_DEBTS_EN[debt] || debt}`
        }
        return title
      } else {
        if (DEMO_TITLES_ES[title]) return DEMO_TITLES_ES[title]
        if (title.startsWith('Goal Contribution: ')) {
          const goal = title.replace('Goal Contribution: ', '')
          return `Aporte a meta: ${DEMO_SAVINGS_ES[goal] || goal}`
        }
        if (title.startsWith('Goal Withdrawal: ')) {
          const goal = title.replace('Goal Withdrawal: ', '')
          return `Retiro de meta: ${DEMO_SAVINGS_ES[goal] || goal}`
        }
        if (title.startsWith('Debt Payment: ')) {
          const debt = title.replace('Debt Payment: ', '')
          return `Abono a deuda: ${DEMO_DEBTS_ES[debt] || debt}`
        }
        if (title.startsWith('Loan Collection: ')) {
          const debt = title.replace('Loan Collection: ', '')
          return `Cobro de préstamo: ${DEMO_DEBTS_ES[debt] || debt}`
        }
        return title
      }
    },
    [language]
  )

  const formatCategoryName = useCallback(
    (category?: { id: string; name: string } | null): string => {
      if (!category) return ''
      const translation = CATEGORY_TRANSLATIONS[category.id]
      if (translation) {
        return translation[language]
      }
      return category.name
    },
    [language]
  )

  const formatDebtTitle = useCallback(
    (title: string): string => {
      if (!title) return ''
      if (language === 'en') {
        return DEMO_DEBTS_EN[title] || title
      }
      return DEMO_DEBTS_ES[title] || title
    },
    [language]
  )

  const formatSavingsTitle = useCallback(
    (title: string): string => {
      if (!title) return ''
      if (language === 'en') {
        return DEMO_SAVINGS_EN[title] || title
      }
      return DEMO_SAVINGS_ES[title] || title
    },
    [language]
  )

  const formatNotes = useCallback(
    (notes?: string): string => {
      if (!notes) return ''
      if (language === 'en') {
        return DEMO_NOTES_EN[notes] || notes
      }
      return DEMO_NOTES_ES[notes] || notes
    },
    [language]
  )

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatDate,
        formatFullDate,
        getPaymentMethodLabel,
        formatMovementTitle,
        formatCategoryName,
        formatDebtTitle,
        formatSavingsTitle,
        formatNotes,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage debe ser utilizado dentro de un LanguageProvider')
  }
  return ctx
}
