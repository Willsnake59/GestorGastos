import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type {
  Budget,
  Category,
  CurrencyCode,
  Debt,
  Movement,
  MovementFilterOptions,
  MovementSortOptions,
  SavingsGoal,
  UserSettings,
} from '../types'
import { settingsService } from '../services/settingsService'
import { storageService } from '../services/storageService'
import { useAuth } from './AuthContext'
import { isDemoUser } from '../services/authService'

interface DataContextType {
  isLoading: boolean
  movements: Movement[]
  categories: Category[]
  debts: Debt[]
  savings: SavingsGoal[]
  budgets: Budget[]
  settings: UserSettings
  // Métricas calculadas
  totalIncome: number
  totalExpense: number
  netBalance: number
  totalDebtsPayable: number
  totalDebtsReceivable: number
  totalSavings: number
  // Operaciones Movimientos
  fetchMovements: (filters?: MovementFilterOptions, sort?: MovementSortOptions) => Promise<Movement[]>
  getMovementById: (id: string) => Promise<Movement | null>
  createMovement: (data: Omit<Movement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Movement>
  updateMovement: (id: string, data: Partial<Omit<Movement, 'id' | 'createdAt'>>) => Promise<Movement>
  deleteMovement: (id: string) => Promise<void>
  // Operaciones Deudas
  createDebt: (data: Omit<Debt, 'id' | 'payments' | 'createdAt' | 'updatedAt'>) => Promise<Debt>
  updateDebt: (id: string, data: Partial<Omit<Debt, 'id' | 'createdAt'>>) => Promise<Debt>
  addDebtPayment: (debtId: string, amount: number, notes?: string) => Promise<Debt>
  deleteDebt: (id: string) => Promise<void>
  // Operaciones Ahorros
  createSavingsGoal: (data: Omit<SavingsGoal, 'id' | 'contributions' | 'createdAt' | 'updatedAt'>) => Promise<SavingsGoal>
  addSavingsContribution: (goalId: string, amount: number, notes?: string) => Promise<SavingsGoal>
  withdrawSavings: (goalId: string, amount: number, notes?: string) => Promise<SavingsGoal>
  deleteSavingsGoal: (id: string) => Promise<void>
  // Operaciones Presupuestos
  saveBudget: (categoryId: string, monthlyLimit: number, month?: string) => Promise<Budget>
  // Operaciones Globales
  resetToDemo: () => Promise<void>
  clearAll: () => Promise<void>
  exportData: () => Promise<string>
  importData: (jsonString: string) => Promise<boolean>
  setCurrency: (currency: CurrencyCode) => void
  dismissDemoNotice: () => void
  refreshData: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const userRef = useRef(user)
  const prevUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    userRef.current = user
  }, [user])

  const [isLoading, setIsLoading] = useState(true)
  const [movements, setMovements] = useState<Movement[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [savings, setSavings] = useState<SavingsGoal[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [settings, setSettings] = useState<UserSettings>(() => settingsService.getSettings())

  const loadAll = useCallback(async () => {
    try {
      const [allCats, allMovs, allDebts, allSavings, allBudgets] = await Promise.all([
        storageService.getCategories(),
        storageService.getMovements(),
        storageService.getDebts(),
        storageService.getSavingsGoals(),
        storageService.getBudgets(),
      ])

      setCategories(allCats)
      setMovements(allMovs)
      setDebts(allDebts)
      setSavings(allSavings)
      setBudgets(allBudgets)
    } catch (err) {
      console.error('Error cargando datos de almacenamiento:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Sincronizar datos al cambiar de usuario o ingresar a un perfil nuevo
  useEffect(() => {
    let ignore = false
    const syncUserData = async () => {
      setIsLoading(true)
      try {
        // Si había un usuario previo diferente, respaldar su estado actual
        if (prevUserIdRef.current && prevUserIdRef.current !== user?.id) {
          await storageService.saveUserSnapshot(prevUserIdRef.current)
        }

        if (user) {
          await storageService.loadUserSnapshot(user.id, isDemoUser(user))
        } else {
          await storageService.initialize()
        }

        prevUserIdRef.current = user?.id || null

        if (!ignore) {
          await loadAll()
        }
      } catch (err) {
        console.error('Error sincronizando datos de usuario:', err)
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void syncUserData()

    return () => {
      ignore = true
    }
  }, [user, loadAll])

  // Cálculos reactivos de finanzas
  const totalIncome = movements
    .filter((m) => m.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const totalExpense = movements
    .filter((m) => m.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const totalSavingsOut = movements
    .filter((m) => m.type === 'savings_transfer' && m.transferDirection !== 'in')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const totalSavingsIn = movements
    .filter((m) => m.type === 'savings_transfer' && m.transferDirection === 'in')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const netBalance = totalIncome - totalExpense - totalSavingsOut + totalSavingsIn

  const totalDebtsPayable = debts
    .filter((d) => d.type === 'payable' && d.status !== 'paid')
    .reduce((acc, curr) => acc + curr.remainingAmount, 0)

  const totalDebtsReceivable = debts
    .filter((d) => d.type === 'receivable' && d.status !== 'paid')
    .reduce((acc, curr) => acc + curr.remainingAmount, 0)

  const totalSavings = savings.reduce((acc, curr) => acc + curr.currentAmount, 0)

  // Handlers para movimientos
  const fetchMovements = useCallback(
    async (filters?: MovementFilterOptions, sort?: MovementSortOptions) => {
      return storageService.getMovements(filters, sort)
    },
    []
  )

  const getMovementById = useCallback(async (id: string) => {
    return storageService.getMovementById(id)
  }, [])

  const createMovement = useCallback(
    async (data: Omit<Movement, 'id' | 'createdAt' | 'updatedAt'>) => {
      const created = await storageService.createMovement(data)
      setMovements((prev) => [created, ...prev])
      if (userRef.current?.id) {
        void storageService.saveUserSnapshot(userRef.current.id)
      }
      return created
    },
    []
  )

  const updateMovement = useCallback(
    async (id: string, data: Partial<Omit<Movement, 'id' | 'createdAt'>>) => {
      const updated = await storageService.updateMovement(id, data)
      setMovements((prev) => prev.map((m) => (m.id === id ? updated : m)))
      if (userRef.current?.id) {
        void storageService.saveUserSnapshot(userRef.current.id)
      }
      return updated
    },
    []
  )

  const deleteMovement = useCallback(
    async (id: string) => {
      await storageService.deleteMovement(id)
      setMovements((prev) => prev.filter((m) => m.id !== id))
      if (userRef.current?.id) {
        void storageService.saveUserSnapshot(userRef.current.id)
      }
    },
    []
  )

  // Handlers para deudas
  const createDebt = useCallback(
    async (data: Omit<Debt, 'id' | 'payments' | 'createdAt' | 'updatedAt'>) => {
      const created = await storageService.createDebt(data)
      setDebts((prev) => [...prev, created])
      if (userRef.current?.id) {
        void storageService.saveUserSnapshot(userRef.current.id)
      }
      return created
    },
    []
  )

  const updateDebt = useCallback(
    async (id: string, data: Partial<Omit<Debt, 'id' | 'createdAt'>>) => {
      const updated = await storageService.updateDebt(id, data)
      setDebts((prev) => prev.map((d) => (d.id === id ? updated : d)))
      if (userRef.current?.id) {
        void storageService.saveUserSnapshot(userRef.current.id)
      }
      return updated
    },
    []
  )

  const addDebtPayment = useCallback(
    async (debtId: string, amount: number, notes?: string) => {
      const updated = await storageService.addDebtPayment(debtId, amount, notes)
      setDebts((prev) => prev.map((d) => (d.id === debtId ? updated : d)))

      // Opcionalmente registrar como movimiento de egreso (pago de deuda) o ingreso (cobro de deuda)
      const isPayable = updated.type === 'payable'
      await createMovement({
        title: isPayable ? `Abono a deuda: ${updated.title}` : `Cobro de préstamo: ${updated.title}`,
        amount,
        type: isPayable ? 'expense' : 'income',
        categoryId: isPayable ? 'cat-other-expense' : 'cat-other-income',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'transfer',
        notes: notes || `Pago registrado a ${updated.contactName}`,
      })

      if (userRef.current?.id) {
        void storageService.saveUserSnapshot(userRef.current.id)
      }

      return updated
    },
    [createMovement]
  )

  const deleteDebt = useCallback(
    async (id: string) => {
      await storageService.deleteDebt(id)
      setDebts((prev) => prev.filter((d) => d.id !== id))
      if (userRef.current?.id) {
        void storageService.saveUserSnapshot(userRef.current.id)
      }
    },
    []
  )

  // Handlers para ahorros
  const createSavingsGoal = useCallback(
    async (data: Omit<SavingsGoal, 'id' | 'contributions' | 'createdAt' | 'updatedAt'>) => {
      const created = await storageService.createSavingsGoal(data)
      setSavings((prev) => [...prev, created])
      if (userRef.current?.id) {
        void storageService.saveUserSnapshot(userRef.current.id)
      }
      return created
    },
    []
  )

  const addSavingsContribution = useCallback(
    async (goalId: string, amount: number, notes?: string) => {
      const updated = await storageService.addSavingsContribution(goalId, amount, notes)
      setSavings((prev) => prev.map((s) => (s.id === goalId ? updated : s)))

      // Registrar también movimiento de transferencia a ahorro
      await createMovement({
        title: `Aporte a meta: ${updated.title}`,
        amount,
        type: 'savings_transfer',
        transferDirection: 'out',
        categoryId: 'cat-investments',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'transfer',
        notes: notes || `Contribución destinada al ahorro '${updated.title}'`,
      })

      if (userRef.current?.id) {
        void storageService.saveUserSnapshot(userRef.current.id)
      }

      return updated
    },
    [createMovement]
  )

  const withdrawSavings = useCallback(
    async (goalId: string, amount: number, notes?: string) => {
      const updated = await storageService.withdrawSavings(goalId, amount, notes)
      setSavings((prev) => prev.map((s) => (s.id === goalId ? updated : s)))

      // Registrar movimiento de retorno de fondos a la liquidez disponible
      await createMovement({
        title: `Retiro de meta: ${updated.title}`,
        amount,
        type: 'savings_transfer',
        transferDirection: 'in',
        categoryId: 'cat-investments',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'transfer',
        notes: notes || `Retiro de fondos desde la meta '${updated.title}'`,
      })

      if (userRef.current?.id) {
        void storageService.saveUserSnapshot(userRef.current.id)
      }

      return updated
    },
    [createMovement]
  )

  const deleteSavingsGoal = useCallback(
    async (id: string) => {
      await storageService.deleteSavingsGoal(id)
      setSavings((prev) => prev.filter((s) => s.id !== id))
      if (userRef.current?.id) {
        void storageService.saveUserSnapshot(userRef.current.id)
      }
    },
    []
  )

  // Handlers para presupuestos
  const saveBudget = useCallback(
    async (categoryId: string, monthlyLimit: number, month?: string) => {
      const saved = await storageService.saveBudget(categoryId, monthlyLimit, month)
      setBudgets((prev) => {
        const idx = prev.findIndex((b) => b.id === saved.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = saved
          return next
        }
        return [...prev, saved]
      })
      if (userRef.current?.id) {
        void storageService.saveUserSnapshot(userRef.current.id)
      }
      return saved
    },
    []
  )

  // Operaciones de datos y settings
  const resetToDemo = useCallback(async () => {
    setIsLoading(true)
    await storageService.resetToDemoData()
    if (userRef.current?.id) {
      await storageService.saveUserSnapshot(userRef.current.id)
    }
    await loadAll()
  }, [loadAll])

  const clearAll = useCallback(async () => {
    setIsLoading(true)
    await storageService.clearAllData()
    if (userRef.current?.id) {
      await storageService.saveUserSnapshot(userRef.current.id)
    }
    await loadAll()
  }, [loadAll])

  const exportData = useCallback(async () => {
    return storageService.exportBackup()
  }, [])

  const importData = useCallback(
    async (jsonString: string) => {
      setIsLoading(true)
      const success = await storageService.importBackup(jsonString)
      if (success) {
        await loadAll()
      }
      setIsLoading(false)
      return success
    },
    [loadAll]
  )

  const setCurrency = useCallback((currency: CurrencyCode) => {
    const updated = settingsService.setCurrency(currency)
    setSettings(updated)
  }, [])

  const dismissDemoNotice = useCallback(() => {
    const updated = settingsService.dismissDemoNotice()
    setSettings(updated)
  }, [])

  return (
    <DataContext.Provider
      value={{
        isLoading,
        movements,
        categories,
        debts,
        savings,
        budgets,
        settings,
        totalIncome,
        totalExpense,
        netBalance,
        totalDebtsPayable,
        totalDebtsReceivable,
        totalSavings,
        fetchMovements,
        getMovementById,
        createMovement,
        updateMovement,
        deleteMovement,
        createDebt,
        updateDebt,
        addDebtPayment,
        deleteDebt,
        createSavingsGoal,
        addSavingsContribution,
        withdrawSavings,
        deleteSavingsGoal,
        saveBudget,
        resetToDemo,
        clearAll,
        exportData,
        importData,
        setCurrency,
        dismissDemoNotice,
        refreshData: loadAll,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export const useData = (): DataContextType => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData debe ser utilizado dentro de un DataProvider')
  }
  return context
}
