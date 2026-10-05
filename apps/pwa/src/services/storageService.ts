import type {
  Budget,
  Category,
  Debt,
  DebtPayment,
  Movement,
  MovementFilterOptions,
  MovementSortOptions,
  SavingsContribution,
  SavingsGoal,
} from '../types'
import { dbClient } from './db'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Alimentación', icon: 'Utensils', color: '#10b981', type: 'expense' },
  { id: 'cat-housing', name: 'Vivienda y Servicios', icon: 'Home', color: '#0ea5e9', type: 'expense' },
  { id: 'cat-transport', name: 'Transporte', icon: 'Car', color: '#f59e0b', type: 'expense' },
  { id: 'cat-health', name: 'Salud y Cuidado', icon: 'HeartPulse', color: '#ec4899', type: 'expense' },
  { id: 'cat-entertainment', name: 'Ocio y Diversión', icon: 'Gamepad2', color: '#8b5cf6', type: 'expense' },
  { id: 'cat-education', name: 'Educación', icon: 'GraduationCap', color: '#06b6d4', type: 'expense' },
  { id: 'cat-clothes', name: 'Ropa y Accesorios', icon: 'ShoppingBag', color: '#f97316', type: 'expense' },
  { id: 'cat-salary', name: 'Salario / Nómina', icon: 'Wallet', color: '#10b981', type: 'income' },
  { id: 'cat-freelance', name: 'Trabajo Freelance', icon: 'Briefcase', color: '#6366f1', type: 'income' },
  { id: 'cat-investments', name: 'Ahorro e Inversión', icon: 'PiggyBank', color: '#10b981', type: 'both' },
  { id: 'cat-other-expense', name: 'Otros Gastos', icon: 'HelpCircle', color: '#64748b', type: 'expense' },
  { id: 'cat-other-income', name: 'Otros Ingresos', icon: 'PlusCircle', color: '#3b82f6', type: 'income' },
]

export const DEMO_MOVEMENTS: Movement[] = [
  {
    id: 'mov-0',
    title: 'Pago de Salario Mes Anterior',
    amount: 3200000,
    type: 'income',
    categoryId: 'cat-salary',
    date: new Date(Date.now() - 42 * 24 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'transfer',
    notes: 'Abono nómina mensual período anterior.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mov-sav-sc-1',
    title: 'Aporte a meta: Fondo de Emergencia (3 meses)',
    amount: 1500000,
    type: 'savings_transfer',
    transferDirection: 'out',
    categoryId: 'cat-investments',
    date: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'transfer',
    notes: 'Aporte inicial del fondo de reserva',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mov-debt-pay-1',
    title: 'Abono a deuda: Préstamo de Libre Inversión',
    amount: 850000,
    type: 'expense',
    categoryId: 'cat-other-expense',
    date: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'transfer',
    notes: 'Pago extraordinario inicial a Banco Aliado',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mov-sav-sc-3',
    title: 'Aporte a meta: Vacaciones Fin de Año',
    amount: 800000,
    type: 'savings_transfer',
    transferDirection: 'out',
    categoryId: 'cat-investments',
    date: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'transfer',
    notes: 'Aporte de ahorro para vacaciones con la familia',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mov-sav-sc-2',
    title: 'Aporte a meta: Fondo de Emergencia (3 meses)',
    amount: 950000,
    type: 'savings_transfer',
    transferDirection: 'out',
    categoryId: 'cat-investments',
    date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'transfer',
    notes: 'Aporte de la nómina pasada a reserva',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mov-debt-pay-2',
    title: 'Cobro de préstamo: Préstamo a Juan David',
    amount: 150000,
    type: 'income',
    categoryId: 'cat-other-income',
    date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'transfer',
    notes: 'Primer abono recibido de Juan David Gómez',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mov-5',
    title: 'Proyecto Freelance de Diseño Web',
    amount: 850000,
    type: 'income',
    categoryId: 'cat-freelance',
    date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'transfer',
    notes: 'Entrega final y aprobación del cliente.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mov-3',
    title: 'Pago Recibo de Energía y Gas',
    amount: 142000,
    type: 'expense',
    categoryId: 'cat-housing',
    date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'transfer',
    notes: 'Servicios públicos correspondientes al mes.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mov-1',
    title: 'Pago de Salario Mensual',
    amount: 3200000,
    type: 'income',
    categoryId: 'cat-salary',
    date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'transfer',
    notes: 'Abono nómina quincenal/mensual transferida.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mov-2',
    title: 'Compra de Supermercado',
    amount: 345000,
    type: 'expense',
    categoryId: 'cat-food',
    date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'debit_card',
    notes: 'Mercado familiar del mes: frutas, verduras y despensa.',
    receiptImage:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="360" height="520" viewBox="0 0 360 520"><rect width="360" height="520" fill="%23f8fafc" rx="16"/><rect x="20" y="20" width="320" height="480" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2" stroke-dasharray="6 4" rx="8"/><text x="180" y="65" text-anchor="middle" font-family="monospace" font-size="18" font-weight="bold" fill="%230f172a">SUPERMERCADO CENTRAL</text><text x="180" y="88" text-anchor="middle" font-family="monospace" font-size="11" fill="%2364748b">NIT: 900.842.109-1 | TICKET #48921</text><line x1="40" y1="105" x2="320" y2="105" stroke="%23e2e8f0" stroke-width="2"/><text x="45" y="135" font-family="monospace" font-size="12" fill="%23334155">1x Mercado Canasta Basica</text><text x="315" y="135" text-anchor="end" font-family="monospace" font-size="12" fill="%23334155">$180.000</text><text x="45" y="165" font-family="monospace" font-size="12" fill="%23334155">1x Frutas y Verduras Frescas</text><text x="315" y="165" text-anchor="end" font-family="monospace" font-size="12" fill="%23334155">$95.000</text><text x="45" y="195" font-family="monospace" font-size="12" fill="%23334155">1x Aseo y Despensa Hogar</text><text x="315" y="195" text-anchor="end" font-family="monospace" font-size="12" fill="%23334155">$70.000</text><line x1="40" y1="220" x2="320" y2="220" stroke="%230f172a" stroke-width="1.5"/><text x="45" y="250" font-family="monospace" font-size="14" font-weight="bold" fill="%230f172a">TOTAL COP</text><text x="315" y="250" text-anchor="end" font-family="monospace" font-size="16" font-weight="bold" fill="%230f172a">$345.000</text><text x="180" y="300" text-anchor="middle" font-family="monospace" font-size="10" fill="%2394a3b8">PAGO TARJETA DEBITO APROBADO</text><text x="180" y="320" text-anchor="middle" font-family="monospace" font-size="10" fill="%2394a3b8">AUT: 928374 | TERM: POS-02</text><rect x="60" y="350" width="240" height="60" fill="%230f172a" rx="4"/><line x1="75" y1="360" x2="75" y2="400" stroke="%23ffffff" stroke-width="3"/><line x1="85" y1="360" x2="85" y2="400" stroke="%23ffffff" stroke-width="1"/><line x1="95" y1="360" x2="95" y2="400" stroke="%23ffffff" stroke-width="4"/><line x1="110" y1="360" x2="110" y2="400" stroke="%23ffffff" stroke-width="2"/><line x1="125" y1="360" x2="125" y2="400" stroke="%23ffffff" stroke-width="5"/><line x1="140" y1="360" x2="140" y2="400" stroke="%23ffffff" stroke-width="2"/><line x1="155" y1="360" x2="155" y2="400" stroke="%23ffffff" stroke-width="4"/><line x1="170" y1="360" x2="170" y2="400" stroke="%23ffffff" stroke-width="1"/><line x1="185" y1="360" x2="185" y2="400" stroke="%23ffffff" stroke-width="3"/><line x1="200" y1="360" x2="200" y2="400" stroke="%23ffffff" stroke-width="2"/><line x1="215" y1="360" x2="215" y2="400" stroke="%23ffffff" stroke-width="5"/><line x1="235" y1="360" x2="235" y2="400" stroke="%23ffffff" stroke-width="3"/><line x1="250" y1="360" x2="250" y2="400" stroke="%23ffffff" stroke-width="2"/><line x1="265" y1="360" x2="265" y2="400" stroke="%23ffffff" stroke-width="4"/><line x1="280" y1="360" x2="280" y2="400" stroke="%23ffffff" stroke-width="2"/><text x="180" y="445" text-anchor="middle" font-family="monospace" font-size="11" fill="%2364748b">¡Gracias por su compra!</text><text x="180" y="465" text-anchor="middle" font-family="monospace" font-size="9" fill="%23d97706">CAPTURA DIGITAL CAMARA MOVIL PWA</text></svg>',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mov-4',
    title: 'Recarga Tarjeta de Transporte / Gasolina',
    amount: 85000,
    type: 'expense',
    categoryId: 'cat-transport',
    date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: 'Combustible y pasajes semanales.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mov-6',
    title: 'Cena de Fin de Semana',
    amount: 98000,
    type: 'expense',
    categoryId: 'cat-entertainment',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'credit_card',
    notes: 'Salida a restaurante con amigos.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const DEMO_DEBTS: Debt[] = [
  {
    id: 'debt-1',
    title: 'Préstamo de Libre Inversión',
    type: 'payable',
    contactName: 'Banco Aliado',
    contactPhone: '+57 300 123 4567',
    totalAmount: 1500000,
    remainingAmount: 650000,
    dueDate: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'partially_paid',
    notes: 'Cuota mensual fija para saldar en 3 meses.',
    payments: [
      {
        id: 'pay-1',
        debtId: 'debt-1',
        amount: 850000,
        date: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
        notes: 'Pago extraordinario inicial',
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'debt-2',
    title: 'Préstamo a Juan David',
    type: 'receivable',
    contactName: 'Juan David Gómez',
    contactPhone: '+57 311 987 6543',
    totalAmount: 300000,
    remainingAmount: 150000,
    dueDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'partially_paid',
    notes: 'Le presté para un imprevisto médico.',
    payments: [
      {
        id: 'pay-2',
        debtId: 'debt-2',
        amount: 150000,
        date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
        notes: 'Primer abono recibido',
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const DEMO_SAVINGS: SavingsGoal[] = [
  {
    id: 'sav-1',
    title: 'Fondo de Emergencia (3 meses)',
    targetAmount: 4000000,
    currentAmount: 2450000,
    targetDate: new Date(Date.now() + 120 * 24 * 3600 * 1000).toISOString().split('T')[0],
    icon: 'ShieldCheck',
    color: '#10b981',
    notes: 'Para imprevistos médicos, reparaciones o tranquilidad laboral.',
    contributions: [
      {
        id: 'sc-1',
        goalId: 'sav-1',
        amount: 1500000,
        date: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString().split('T')[0],
        notes: 'Aporte inicial del fondo',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'sc-2',
        goalId: 'sav-1',
        amount: 950000,
        date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
        notes: 'Aporte de la nómina pasada',
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sav-2',
    title: 'Vacaciones Fin de Año',
    targetAmount: 1800000,
    currentAmount: 800000,
    targetDate: new Date(Date.now() + 85 * 24 * 3600 * 1000).toISOString().split('T')[0],
    icon: 'Palmtree',
    color: '#f59e0b',
    notes: 'Viaje a la costa con la familia.',
    contributions: [
      {
        id: 'sc-3',
        goalId: 'sav-2',
        amount: 800000,
        date: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString().split('T')[0],
        notes: 'Aporte de prima o bonificación',
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const DEMO_BUDGETS: Budget[] = [
  {
    id: 'bud-1',
    categoryId: 'cat-food',
    monthlyLimit: 750000,
    month: new Date().toISOString().substring(0, 7),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bud-2',
    categoryId: 'cat-transport',
    monthlyLimit: 220000,
    month: new Date().toISOString().substring(0, 7),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bud-3',
    categoryId: 'cat-entertainment',
    monthlyLimit: 250000,
    month: new Date().toISOString().substring(0, 7),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const storageService = {
  // Inicialización
  async initialize(): Promise<void> {
    const categories = await dbClient.getAll<Category>('categories')
    if (categories.length === 0) {
      await dbClient.putBatch('categories', DEFAULT_CATEGORIES)
      await dbClient.putBatch('movements', DEMO_MOVEMENTS)
      await dbClient.putBatch('debts', DEMO_DEBTS)
      await dbClient.putBatch('savings', DEMO_SAVINGS)
      await dbClient.putBatch('budgets', DEMO_BUDGETS)
    } else {
      // Sincronizar categoría de ahorro e inversión a 'both'
      const invCat = await dbClient.getById<Category>('categories', 'cat-investments')
      if (invCat && invCat.type !== 'both') {
        invCat.type = 'both'
        invCat.name = 'Ahorro e Inversión'
        invCat.icon = 'PiggyBank'
        invCat.color = '#10b981'
        await dbClient.put('categories', invCat)
      }

      // Si los datos actuales corresponden al demo inicial (sin armonizar aún),
      // incorporar automáticamente los movimientos de ahorro y deuda pendientes
      const hasHarmonizedDemo = await dbClient.getById<Movement>('movements', 'mov-debt-pay-1')
      if (!hasHarmonizedDemo) {
        const existingMovs = await dbClient.getAll<Movement>('movements')
        const isPureDemo =
          existingMovs.length > 0 && existingMovs.every((m) => m.id.startsWith('mov-'))
        if (isPureDemo) {
          const missingMovs = DEMO_MOVEMENTS.filter(
            (dm) => !existingMovs.some((em) => em.id === dm.id)
          )
          if (missingMovs.length > 0) {
            await dbClient.putBatch('movements', missingMovs)
          }
        }
      }

      // Migrar movimientos existentes de ahorro hacia 'savings_transfer'
      const allCurrentMovs = await dbClient.getAll<Movement>('movements')
      const savingsToMigrate = allCurrentMovs.filter(
        (m) =>
          m.type !== 'savings_transfer' &&
          (m.id.startsWith('mov-sav-') ||
            m.title.toLowerCase().startsWith('aporte a meta') ||
            m.title.toLowerCase().startsWith('retiro de meta'))
      )
      for (const sm of savingsToMigrate) {
        sm.type = 'savings_transfer'
        sm.transferDirection = sm.title.toLowerCase().includes('retiro') ? 'in' : 'out'
        await dbClient.put('movements', sm)
      }
    }
  },

  // Reset a datos de demostración
  async resetToDemoData(): Promise<void> {
    await dbClient.clearAll()
    await dbClient.putBatch('categories', DEFAULT_CATEGORIES)
    await dbClient.putBatch('movements', DEMO_MOVEMENTS)
    await dbClient.putBatch('debts', DEMO_DEBTS)
    await dbClient.putBatch('savings', DEMO_SAVINGS)
    await dbClient.putBatch('budgets', DEMO_BUDGETS)
  },

  // Limpiar todos los datos
  async clearAllData(): Promise<void> {
    await dbClient.clearAll()
    // Conservar al menos las categorías base
    await dbClient.putBatch('categories', DEFAULT_CATEGORIES)
  },

  // Guarda el estado actual en el snapshot persistente del usuario
  async saveUserSnapshot(userId: string): Promise<void> {
    if (!userId || typeof window === 'undefined' || !window.localStorage) return
    try {
      const [cats, movs, debts, savings, budgets] = await Promise.all([
        dbClient.getAll<Category>('categories'),
        dbClient.getAll<Movement>('movements'),
        dbClient.getAll<Debt>('debts'),
        dbClient.getAll<SavingsGoal>('savings'),
        dbClient.getAll<Budget>('budgets'),
      ])
      const payload = { cats, movs, debts, savings, budgets }
      localStorage.setItem(`gestor_gastos_user_data_${userId}`, JSON.stringify(payload))
    } catch (e) {
      console.warn('Error al guardar snapshot de usuario:', e)
    }
  },

  // Carga el estado del usuario: si es demo, asegura datos precargados; si es nuevo, asegura todo en cero
  async loadUserSnapshot(userId: string, isDemo: boolean): Promise<void> {
    if (typeof window === 'undefined') return

    if (isDemo) {
      // Para evaluador demo o credenciales de prueba, siempre restaurar o presentar los datos de prueba
      const saved = localStorage.getItem(`gestor_gastos_user_data_${userId}`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          await dbClient.clearAll()
          await dbClient.putBatch('categories', parsed.cats?.length ? parsed.cats : DEFAULT_CATEGORIES)
          await dbClient.putBatch('movements', parsed.movs || DEMO_MOVEMENTS)
          await dbClient.putBatch('debts', parsed.debts || DEMO_DEBTS)
          await dbClient.putBatch('savings', parsed.savings || DEMO_SAVINGS)
          await dbClient.putBatch('budgets', parsed.budgets || DEMO_BUDGETS)
          return
        } catch {
          // Fallback a demo puro
        }
      }
      await this.resetToDemoData()
      return
    }

    // Para un usuario nuevo o registrado (no demo)
    const saved = localStorage.getItem(`gestor_gastos_user_data_${userId}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        await dbClient.clearAll()
        await dbClient.putBatch('categories', parsed.cats?.length ? parsed.cats : DEFAULT_CATEGORIES)
        await dbClient.putBatch('movements', parsed.movs || [])
        await dbClient.putBatch('debts', parsed.debts || [])
        await dbClient.putBatch('savings', parsed.savings || [])
        await dbClient.putBatch('budgets', parsed.budgets || [])
        return
      } catch (e) {
        console.error('Error cargando snapshot de usuario:', e)
      }
    }

    // Perfil nuevo: comenzar absolutamente en CERO (todo vacío excepto categorías base)
    await this.clearAllData()
  },

  // Exportar respaldo JSON
  async exportBackup(): Promise<string> {
    const movements = await dbClient.getAll('movements')
    const debts = await dbClient.getAll('debts')
    const savings = await dbClient.getAll('savings')
    const categories = await dbClient.getAll('categories')
    const budgets = await dbClient.getAll('budgets')

    const backupData = {
      app: 'Gestor de gastos',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        movements,
        debts,
        savings,
        categories,
        budgets,
      },
    }

    return JSON.stringify(backupData, null, 2)
  },

  // Importar respaldo JSON
  async importBackup(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString)
      if (!parsed.data) {
        throw new Error('Formato de respaldo no válido')
      }

      await dbClient.clearAll()

      if (Array.isArray(parsed.data.categories)) {
        await dbClient.putBatch('categories', parsed.data.categories)
      } else {
        await dbClient.putBatch('categories', DEFAULT_CATEGORIES)
      }

      if (Array.isArray(parsed.data.movements)) {
        await dbClient.putBatch('movements', parsed.data.movements)
      }

      if (Array.isArray(parsed.data.debts)) {
        await dbClient.putBatch('debts', parsed.data.debts)
      }

      if (Array.isArray(parsed.data.savings)) {
        await dbClient.putBatch('savings', parsed.data.savings)
      }

      if (Array.isArray(parsed.data.budgets)) {
        await dbClient.putBatch('budgets', parsed.data.budgets)
      }

      return true
    } catch (err) {
      console.error('Error importing backup:', err)
      return false
    }
  },

  // ================= MOVEMENTS CRUD =================
  async getMovements(
    filters?: MovementFilterOptions,
    sort?: MovementSortOptions
  ): Promise<Movement[]> {
    let items = await dbClient.getAll<Movement>('movements')

    // Filtros
    if (filters) {
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase().trim()
        items = items.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            (m.notes && m.notes.toLowerCase().includes(q))
        )
      }

      if (filters.type && filters.type !== 'all') {
        items = items.filter((m) => m.type === filters.type)
      }

      if (filters.categoryId && filters.categoryId !== 'all') {
        items = items.filter((m) => m.categoryId === filters.categoryId)
      }

      if (filters.startDate) {
        items = items.filter((m) => m.date >= filters.startDate!)
      }

      if (filters.endDate) {
        items = items.filter((m) => m.date <= filters.endDate!)
      }

      if (typeof filters.minAmount === 'number') {
        items = items.filter((m) => m.amount >= filters.minAmount!)
      }

      if (typeof filters.maxAmount === 'number') {
        items = items.filter((m) => m.amount <= filters.maxAmount!)
      }
    }

    // Ordenamiento
    const sortField = sort?.field || 'date'
    const sortOrder = sort?.order || 'desc'

    items.sort((a, b) => {
      let valA: string | number = a[sortField]
      let valB: string | number = b[sortField]

      if (sortField === 'date') {
        valA = new Date(a.date).getTime()
        valB = new Date(b.date).getTime()
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return items
  },

  async getMovementById(id: string): Promise<Movement | null> {
    return dbClient.getById<Movement>('movements', id)
  },

  async createMovement(data: Omit<Movement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Movement> {
    const newMovement: Movement = {
      ...data,
      id: 'mov-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return dbClient.put('movements', newMovement)
  },

  async updateMovement(id: string, data: Partial<Omit<Movement, 'id' | 'createdAt'>>): Promise<Movement> {
    const existing = await dbClient.getById<Movement>('movements', id)
    if (!existing) {
      throw new Error(`Movimiento con id ${id} no encontrado`)
    }

    const updated: Movement = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    return dbClient.put('movements', updated)
  },

  async deleteMovement(id: string): Promise<void> {
    return dbClient.delete('movements', id)
  },

  // ================= CATEGORIES CRUD =================
  async getCategories(): Promise<Category[]> {
    const categories = await dbClient.getAll<Category>('categories')
    if (categories.length === 0) {
      await dbClient.putBatch('categories', DEFAULT_CATEGORIES)
      return DEFAULT_CATEGORIES
    }
    return categories
  },

  async getCategoryById(id: string): Promise<Category | undefined> {
    const categories = await this.getCategories()
    return categories.find((c) => c.id === id)
  },

  // ================= DEBTS CRUD =================
  async getDebts(): Promise<Debt[]> {
    const debts = await dbClient.getAll<Debt>('debts')
    return debts.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  },

  async getDebtById(id: string): Promise<Debt | null> {
    return dbClient.getById<Debt>('debts', id)
  },

  async createDebt(data: Omit<Debt, 'id' | 'payments' | 'createdAt' | 'updatedAt'>): Promise<Debt> {
    const newDebt: Debt = {
      ...data,
      id: 'debt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return dbClient.put('debts', newDebt)
  },

  async updateDebt(id: string, data: Partial<Omit<Debt, 'id' | 'createdAt'>>): Promise<Debt> {
    const existing = await dbClient.getById<Debt>('debts', id)
    if (!existing) {
      throw new Error(`Deuda con id ${id} no encontrada`)
    }

    const updated: Debt = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    return dbClient.put('debts', updated)
  },

  async addDebtPayment(debtId: string, amount: number, notes?: string): Promise<Debt> {
    const existing = await dbClient.getById<Debt>('debts', debtId)
    if (!existing) {
      throw new Error(`Deuda no encontrada`)
    }

    const newPayment: DebtPayment = {
      id: 'pay-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      debtId,
      amount,
      date: new Date().toISOString().split('T')[0],
      notes,
      createdAt: new Date().toISOString(),
    }

    const remaining = Math.max(0, existing.remainingAmount - amount)
    const newStatus = remaining <= 0 ? 'paid' : 'partially_paid'

    const updatedDebt: Debt = {
      ...existing,
      remainingAmount: remaining,
      status: newStatus,
      payments: [...existing.payments, newPayment],
      updatedAt: new Date().toISOString(),
    }

    return dbClient.put('debts', updatedDebt)
  },

  async deleteDebt(id: string): Promise<void> {
    return dbClient.delete('debts', id)
  },

  // ================= SAVINGS GOALS CRUD =================
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    const goals = await dbClient.getAll<SavingsGoal>('savings')
    return goals.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
  },

  async getSavingsGoalById(id: string): Promise<SavingsGoal | null> {
    return dbClient.getById<SavingsGoal>('savings', id)
  },

  async createSavingsGoal(data: Omit<SavingsGoal, 'id' | 'contributions' | 'createdAt' | 'updatedAt'>): Promise<SavingsGoal> {
    const newGoal: SavingsGoal = {
      ...data,
      id: 'sav-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      contributions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return dbClient.put('savings', newGoal)
  },

  async addSavingsContribution(goalId: string, amount: number, notes?: string): Promise<SavingsGoal> {
    const existing = await dbClient.getById<SavingsGoal>('savings', goalId)
    if (!existing) {
      throw new Error('Meta de ahorro no encontrada')
    }

    const newContrib: SavingsContribution = {
      id: 'sc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      goalId,
      amount,
      type: 'deposit',
      date: new Date().toISOString().split('T')[0],
      notes,
      createdAt: new Date().toISOString(),
    }

    const updated: SavingsGoal = {
      ...existing,
      currentAmount: existing.currentAmount + amount,
      contributions: [...existing.contributions, newContrib],
      updatedAt: new Date().toISOString(),
    }

    return dbClient.put('savings', updated)
  },

  async withdrawSavings(goalId: string, amount: number, notes?: string): Promise<SavingsGoal> {
    const existing = await dbClient.getById<SavingsGoal>('savings', goalId)
    if (!existing) {
      throw new Error('Meta de ahorro no encontrada')
    }

    if (amount <= 0) {
      throw new Error('El monto a retirar debe ser mayor a cero')
    }

    if (amount > existing.currentAmount) {
      throw new Error('No es posible retirar más fondos de los acumulados')
    }

    const newWithdrawal: SavingsContribution = {
      id: 'sw-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      goalId,
      amount,
      type: 'withdrawal',
      date: new Date().toISOString().split('T')[0],
      notes,
      createdAt: new Date().toISOString(),
    }

    const updated: SavingsGoal = {
      ...existing,
      currentAmount: Math.max(0, existing.currentAmount - amount),
      contributions: [...existing.contributions, newWithdrawal],
      updatedAt: new Date().toISOString(),
    }

    return dbClient.put('savings', updated)
  },

  async deleteSavingsGoal(id: string): Promise<void> {
    return dbClient.delete('savings', id)
  },

  // ================= BUDGETS CRUD =================
  async getBudgets(month?: string): Promise<Budget[]> {
    const targetMonth = month || new Date().toISOString().substring(0, 7)
    const allBudgets = await dbClient.getAll<Budget>('budgets')
    return allBudgets.filter((b) => b.month === targetMonth)
  },

  async saveBudget(categoryId: string, monthlyLimit: number, month?: string): Promise<Budget> {
    const targetMonth = month || new Date().toISOString().substring(0, 7)
    const existingBudgets = await this.getBudgets(targetMonth)
    const found = existingBudgets.find((b) => b.categoryId === categoryId)

    if (found) {
      const updated: Budget = {
        ...found,
        monthlyLimit,
        updatedAt: new Date().toISOString(),
      }
      return dbClient.put('budgets', updated)
    }

    const newBudget: Budget = {
      id: 'bud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      categoryId,
      monthlyLimit,
      month: targetMonth,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return dbClient.put('budgets', newBudget)
  },
}
