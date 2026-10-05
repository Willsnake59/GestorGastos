import { beforeEach, describe, expect, it } from 'vitest'
import { storageService } from '../services/storageService'

describe('Servicio de Almacenamiento y Operaciones CRUD', () => {
  beforeEach(async () => {
    await storageService.resetToDemoData()
  })

  it('inicializa y recupera movimientos de demostración', async () => {
    const movements = await storageService.getMovements()
    expect(movements.length).toBeGreaterThan(0)
    expect(movements[0]).toHaveProperty('title')
    expect(movements[0]).toHaveProperty('amount')
    expect(movements[0]).toHaveProperty('type')
  })

  it('permite crear, consultar, actualizar y eliminar un movimiento', async () => {
    // Crear
    const created = await storageService.createMovement({
      title: 'Prueba de Gasto Test',
      amount: 12500,
      type: 'expense',
      categoryId: 'cat-food',
      date: '2026-09-16',
      paymentMethod: 'cash',
      notes: 'Nota de prueba',
    })

    expect(created.id).toBeDefined()
    expect(created.title).toBe('Prueba de Gasto Test')
    expect(created.amount).toBe(12500)

    // Consultar por ID
    const found = await storageService.getMovementById(created.id)
    expect(found).not.toBeNull()
    expect(found?.title).toBe('Prueba de Gasto Test')

    // Actualizar
    const updated = await storageService.updateMovement(created.id, {
      title: 'Gasto Actualizado',
      amount: 15000,
    })
    expect(updated.title).toBe('Gasto Actualizado')
    expect(updated.amount).toBe(15000)

    // Eliminar
    await storageService.deleteMovement(created.id)
    const afterDelete = await storageService.getMovementById(created.id)
    expect(afterDelete).toBeNull()
  })

  it('permite buscar y filtrar movimientos por tipo y texto', async () => {
    const expenses = await storageService.getMovements({ type: 'expense' })
    expect(expenses.every((m) => m.type === 'expense')).toBe(true)

    const incomes = await storageService.getMovements({ type: 'income' })
    expect(incomes.every((m) => m.type === 'income')).toBe(true)

    const transfers = await storageService.getMovements({ type: 'savings_transfer' })
    expect(transfers.every((m) => m.type === 'savings_transfer')).toBe(true)
    expect(transfers.length).toBeGreaterThan(0)
  })

  it('permite registrar abonos a deudas y reduce el saldo pendiente', async () => {
    const debts = await storageService.getDebts()
    expect(debts.length).toBeGreaterThan(0)

    const debt = debts[0]
    const initialRemaining = debt.remainingAmount

    const updated = await storageService.addDebtPayment(debt.id, 50000, 'Abono de prueba test')
    expect(updated.remainingAmount).toBe(initialRemaining - 50000)
    expect(updated.payments.length).toBe(debt.payments.length + 1)
  })

  it('permite registrar aportes a metas de ahorro', async () => {
    const goals = await storageService.getSavingsGoals()
    expect(goals.length).toBeGreaterThan(0)

    const goal = goals[0]
    const initialAmount = goal.currentAmount

    const updated = await storageService.addSavingsContribution(goal.id, 100000, 'Aporte test')
    expect(updated.currentAmount).toBe(initialAmount + 100000)
    expect(updated.contributions.length).toBe(goal.contributions.length + 1)
  })

  it('permite retirar fondos de metas de ahorro y valida el saldo', async () => {
    const goals = await storageService.getSavingsGoals()
    const goal = goals[0]
    const initialAmount = goal.currentAmount

    const updated = await storageService.withdrawSavings(goal.id, 50000, 'Retiro test')
    expect(updated.currentAmount).toBe(initialAmount - 50000)
    expect(updated.contributions[updated.contributions.length - 1].type).toBe('withdrawal')

    // No debe permitir retirar más de lo acumulado
    await expect(storageService.withdrawSavings(goal.id, updated.currentAmount + 10000)).rejects.toThrow()
  })

  it('guarda en almacenamiento local y persiste los datos ingresados', async () => {
    const newMov = await storageService.createMovement({
      title: 'Gasto Offline Guardado',
      amount: 45000,
      type: 'expense',
      categoryId: 'cat-transport',
      date: '2026-09-16',
      paymentMethod: 'cash',
    })

    // Comprobar que se recupera de inmediato
    const retrieved = await storageService.getMovementById(newMov.id)
    expect(retrieved).not.toBeNull()
    expect(retrieved?.title).toBe('Gasto Offline Guardado')

    // Comprobar que localStorage contiene el espejo de respaldo
    const raw = localStorage.getItem('gestor_gastos_mirror_movements')
    expect(raw).toBeTruthy()
    expect(raw).toContain('Gasto Offline Guardado')
  })
})
