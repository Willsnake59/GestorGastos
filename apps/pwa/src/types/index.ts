export type MovementType = 'expense' | 'income' | 'savings_transfer'

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: 'expense' | 'income' | 'both'
}

export interface Movement {
  id: string
  title: string
  amount: number
  type: MovementType
  transferDirection?: 'in' | 'out'
  categoryId: string
  date: string // ISO string: YYYY-MM-DD
  notes?: string
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'transfer' | 'other'
  createdAt: string
  updatedAt: string
}

export type DebtType = 'payable' | 'receivable' // 'payable' = debo dinero, 'receivable' = me deben dinero
export type DebtStatus = 'pending' | 'partially_paid' | 'paid'

export interface DebtPayment {
  id: string
  debtId: string
  amount: number
  date: string
  notes?: string
  createdAt: string
}

export interface Debt {
  id: string
  title: string
  type: DebtType
  contactName: string
  contactPhone?: string
  totalAmount: number
  remainingAmount: number
  dueDate: string
  status: DebtStatus
  notes?: string
  payments: DebtPayment[]
  createdAt: string
  updatedAt: string
}

export interface SavingsContribution {
  id: string
  goalId: string
  amount: number
  type?: 'deposit' | 'withdrawal'
  date: string
  notes?: string
  createdAt: string
}

export interface SavingsGoal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  icon: string
  color: string
  notes?: string
  contributions: SavingsContribution[]
  createdAt: string
  updatedAt: string
}

export interface Budget {
  id: string
  categoryId: string
  monthlyLimit: number
  month: string // YYYY-MM
  createdAt: string
  updatedAt: string
}

export type ThemePreference = 'light' | 'dark' | 'system'
export type CurrencyCode = 'COP' | 'USD' | 'EUR' | 'MXN' | 'ARS' | 'CLP'
export type LanguageCode = 'es' | 'en'

export interface UserSettings {
  theme: ThemePreference
  currency: CurrencyCode
  language: LanguageCode
  showDemoNotice: boolean
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  soundEffects: boolean
}

export interface MovementFilterOptions {
  searchQuery?: string
  type?: MovementType | 'all'
  categoryId?: string | 'all'
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
}

export type MovementSortField = 'date' | 'amount' | 'title'
export type SortOrder = 'asc' | 'desc'

export interface MovementSortOptions {
  field: MovementSortField
  order: SortOrder
}

export type UserRole = 'student' | 'evaluator' | 'user'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  university?: string
  createdAt: string
  lastLoginAt: string
}

export interface StoredUser extends UserProfile {
  passwordHash: string
  salt: string
}

export interface AuthSession {
  user: UserProfile
  token: string
  expiresAt: string
}

