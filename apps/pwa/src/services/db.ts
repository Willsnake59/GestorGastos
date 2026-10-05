const DB_NAME = 'gestor_gastos_db'
const DB_VERSION = 1
const STORAGE_PREFIX = 'gestor_gastos_mirror_'

export type StoreName = 'movements' | 'debts' | 'savings' | 'categories' | 'budgets'

export class IndexedDBClient {
  private dbPromise: Promise<IDBDatabase> | null = null
  private memoryStore: Map<StoreName, Map<string, unknown>> = new Map()
  private isIndexedDBAvailable: boolean = typeof window !== 'undefined' && !!window.indexedDB

  constructor() {
    const stores: StoreName[] = ['movements', 'debts', 'savings', 'categories', 'budgets']
    for (const store of stores) {
      this.memoryStore.set(store, new Map())
      this.hydrateFromLocalStorage(store)
    }
  }

  // Carga inicial instantánea desde localStorage como respaldo de alta resiliencia
  private hydrateFromLocalStorage(storeName: StoreName) {
    if (typeof window === 'undefined' || !window.localStorage) return
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${storeName}`)
      if (raw) {
        const items = JSON.parse(raw) as Array<{ id: string }>
        const map = this.memoryStore.get(storeName)
        if (map && Array.isArray(items)) {
          for (const item of items) {
            if (item && item.id) {
              map.set(item.id, item)
            }
          }
        }
      }
    } catch {
      // Ignorar errores de parseo
    }
  }

  // Espejo sincrónico a localStorage
  private syncToLocalStorage(storeName: StoreName) {
    if (typeof window === 'undefined' || !window.localStorage) return
    try {
      const map = this.memoryStore.get(storeName)
      const items = Array.from(map?.values() || [])
      localStorage.setItem(`${STORAGE_PREFIX}${storeName}`, JSON.stringify(items))
    } catch (e) {
      console.warn('Advertencia en espejo LocalStorage:', e)
    }
  }

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise
    }

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      if (!this.isIndexedDBAvailable) {
        reject(new Error('IndexedDB no está soportado en este entorno.'))
        return
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Store: movements
        if (!db.objectStoreNames.contains('movements')) {
          const movementStore = db.createObjectStore('movements', { keyPath: 'id' })
          movementStore.createIndex('date', 'date', { unique: false })
          movementStore.createIndex('type', 'type', { unique: false })
          movementStore.createIndex('categoryId', 'categoryId', { unique: false })
        }

        // Store: debts
        if (!db.objectStoreNames.contains('debts')) {
          const debtStore = db.createObjectStore('debts', { keyPath: 'id' })
          debtStore.createIndex('type', 'type', { unique: false })
          debtStore.createIndex('status', 'status', { unique: false })
          debtStore.createIndex('dueDate', 'dueDate', { unique: false })
        }

        // Store: savings
        if (!db.objectStoreNames.contains('savings')) {
          const savingsStore = db.createObjectStore('savings', { keyPath: 'id' })
          savingsStore.createIndex('targetDate', 'targetDate', { unique: false })
        }

        // Store: categories
        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', { keyPath: 'id' })
          categoryStore.createIndex('type', 'type', { unique: false })
        }

        // Store: budgets
        if (!db.objectStoreNames.contains('budgets')) {
          const budgetStore = db.createObjectStore('budgets', { keyPath: 'id' })
          budgetStore.createIndex('month', 'month', { unique: false })
          budgetStore.createIndex('categoryId', 'categoryId', { unique: false })
        }
      }

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        this.isIndexedDBAvailable = false
        reject(request.error || new Error('Error al abrir la base de datos IndexedDB.'))
      }
    })

    return this.dbPromise
  }

  public async getAll<T>(storeName: StoreName): Promise<T[]> {
    if (!this.isIndexedDBAvailable) {
      const store = this.memoryStore.get(storeName)
      return Array.from(store?.values() || []) as T[]
    }

    try {
      const db = await this.getDB()
      return new Promise<T[]>((resolve) => {
        const transaction = db.transaction(storeName, 'readonly')
        const store = transaction.objectStore(storeName)
        const request = store.getAll()

        request.onsuccess = () => {
          const result = request.result as T[]
          if (Array.isArray(result) && result.length > 0) {
            const map = this.memoryStore.get(storeName)
            map?.clear()
            for (const it of result as unknown as Array<{ id: string }>) {
              if (it && it.id) map?.set(it.id, it)
            }
            this.syncToLocalStorage(storeName)
            resolve(result)
          } else {
            // Si IndexedDB está vacío pero teníamos datos en memoria / localStorage
            const memItems = Array.from(this.memoryStore.get(storeName)?.values() || []) as T[]
            resolve(memItems)
          }
        }
        request.onerror = () => {
          const memItems = Array.from(this.memoryStore.get(storeName)?.values() || []) as T[]
          resolve(memItems)
        }
      })
    } catch {
      const store = this.memoryStore.get(storeName)
      return Array.from(store?.values() || []) as T[]
    }
  }

  public async getById<T>(storeName: StoreName, id: string): Promise<T | null> {
    if (!this.isIndexedDBAvailable) {
      const store = this.memoryStore.get(storeName)
      return (store?.get(id) as T) || null
    }

    try {
      const db = await this.getDB()
      return new Promise<T | null>((resolve) => {
        const transaction = db.transaction(storeName, 'readonly')
        const store = transaction.objectStore(storeName)
        const request = store.get(id)

        request.onsuccess = () => {
          const res = (request.result as T) || (this.memoryStore.get(storeName)?.get(id) as T) || null
          resolve(res)
        }
        request.onerror = () => {
          resolve((this.memoryStore.get(storeName)?.get(id) as T) || null)
        }
      })
    } catch {
      const store = this.memoryStore.get(storeName)
      return (store?.get(id) as T) || null
    }
  }

  public async put<T extends { id: string }>(storeName: StoreName, item: T): Promise<T> {
    this.memoryStore.get(storeName)?.set(item.id, item)
    this.syncToLocalStorage(storeName)

    if (!this.isIndexedDBAvailable) {
      return item
    }

    try {
      const db = await this.getDB()
      return new Promise<T>((resolve) => {
        const transaction = db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.put(item)

        request.onsuccess = () => resolve(item)
        request.onerror = () => resolve(item) // Retornar item igualmente ya que está en memoria y localStorage
      })
    } catch {
      return item
    }
  }

  public async putBatch<T extends { id: string }>(storeName: StoreName, items: T[]): Promise<void> {
    for (const item of items) {
      this.memoryStore.get(storeName)?.set(item.id, item)
    }
    this.syncToLocalStorage(storeName)

    if (!this.isIndexedDBAvailable) {
      return
    }

    try {
      const db = await this.getDB()
      return new Promise<void>((resolve) => {
        const transaction = db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)

        transaction.oncomplete = () => resolve()
        transaction.onerror = () => resolve() // Ya respaldado en memoria y localStorage

        for (const item of items) {
          store.put(item)
        }
      })
    } catch {
      // Memory store already updated
    }
  }

  public async delete(storeName: StoreName, id: string): Promise<void> {
    this.memoryStore.get(storeName)?.delete(id)
    this.syncToLocalStorage(storeName)

    if (!this.isIndexedDBAvailable) {
      return
    }

    try {
      const db = await this.getDB()
      return new Promise<void>((resolve) => {
        const transaction = db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.delete(id)

        request.onsuccess = () => resolve()
        request.onerror = () => resolve()
      })
    } catch {
      // Memory store already updated
    }
  }

  public async clear(storeName: StoreName): Promise<void> {
    this.memoryStore.get(storeName)?.clear()
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(`${STORAGE_PREFIX}${storeName}`)
      } catch {
        // Ignorar
      }
    }

    if (!this.isIndexedDBAvailable) {
      return
    }

    try {
      const db = await this.getDB()
      return new Promise<void>((resolve) => {
        const transaction = db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.clear()

        request.onsuccess = () => resolve()
        request.onerror = () => resolve()
      })
    } catch {
      // Memory store already updated
    }
  }

  public async clearAll(): Promise<void> {
    const stores: StoreName[] = ['movements', 'debts', 'savings', 'categories', 'budgets']
    for (const store of stores) {
      await this.clear(store)
    }
  }
}

export const dbClient = new IndexedDBClient()
