import type { AuthSession, StoredUser, UserProfile } from '../types'
import { generateSalt, generateToken, hashPassword } from '../utils/crypto'

const USERS_KEY = 'gestor_gastos_users'
const SESSION_KEY = 'gestor_gastos_session'

export const DEMO_EVALUATOR_USER: UserProfile = {
  id: 'usr_evaluator_academic',
  email: 'evaluador@universidad.edu',
  name: 'Prof. Evaluador Académico',
  role: 'evaluator',
  university: 'Comité de Evaluación de Proyecto',
  createdAt: '2026-01-15T08:00:00.000Z',
  lastLoginAt: new Date().toISOString(),
}

export const DEMO_STUDENT_USER: UserProfile = {
  id: 'usr_student_demo',
  email: 'estudiante@universidad.edu',
  name: 'Estudiante Universitario',
  role: 'student',
  university: 'Facultad de Ingeniería de Sistemas',
  createdAt: '2026-02-01T10:00:00.000Z',
  lastLoginAt: new Date().toISOString(),
}

/**
 * Determina si el perfil corresponde a las cuentas de demostración precargadas
 */
export function isDemoUser(user: UserProfile | null | undefined): boolean {
  if (!user) return false
  const email = user.email.toLowerCase()
  return (
    user.id === DEMO_EVALUATOR_USER.id ||
    user.id === DEMO_STUDENT_USER.id ||
    email === DEMO_EVALUATOR_USER.email.toLowerCase() ||
    email === DEMO_STUDENT_USER.email.toLowerCase() ||
    user.role === 'evaluator'
  )
}

/**
 * Obtiene la lista de usuarios registrados en el almacenamiento local
 */
export function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as StoredUser[]
  } catch (error) {
    console.error('Error al leer usuarios de localStorage:', error)
    return []
  }
}

/**
 * Guarda los usuarios en almacenamiento local
 */
export function saveStoredUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch (error) {
    console.error('Error al guardar usuarios en localStorage:', error)
  }
}

/**
 * Obtiene la sesión actual activa
 */
export function getCurrentSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as AuthSession
    // Verificar expiración si existiese
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch (error) {
    console.error('Error al leer sesión:', error)
    return null
  }
}

/**
 * Guarda o borra la sesión actual
 */
export function saveSession(session: AuthSession | null): void {
  try {
    if (!session) {
      localStorage.removeItem(SESSION_KEY)
    } else {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    }
  } catch (error) {
    console.error('Error al guardar sesión:', error)
  }
}

/**
 * Crea una sesión para un perfil de usuario
 */
export function createSessionForUser(user: UserProfile): AuthSession {
  // Expiración a 30 días
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const session: AuthSession = {
    user: {
      ...user,
      lastLoginAt: new Date().toISOString(),
    },
    token: generateToken(),
    expiresAt,
  }
  saveSession(session)
  return session
}

/**
 * Inicializa y asegura que los usuarios de demostración existan en el sistema
 */
export async function seedDemoUsers(): Promise<void> {
  const users = getStoredUsers()
  let modified = false

  const existsEvaluator = users.some((u) => u.email === DEMO_EVALUATOR_USER.email)
  if (!existsEvaluator) {
    const salt = generateSalt()
    const passwordHash = await hashPassword('demo123', salt)
    users.push({
      ...DEMO_EVALUATOR_USER,
      salt,
      passwordHash,
    })
    modified = true
  }

  const existsStudent = users.some((u) => u.email === DEMO_STUDENT_USER.email)
  if (!existsStudent) {
    const salt = generateSalt()
    const passwordHash = await hashPassword('demo123', salt)
    users.push({
      ...DEMO_STUDENT_USER,
      salt,
      passwordHash,
    })
    modified = true
  }

  if (modified) {
    saveStoredUsers(users)
  }
}

/**
 * Registra un nuevo usuario con hashing seguro de contraseña
 */
export async function registerUser(data: {
  name: string
  email: string
  password: string
  university?: string
}): Promise<UserProfile> {
  const normalizedEmail = data.email.trim().toLowerCase()
  const users = getStoredUsers()

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('AUTH_USER_EXISTS')
  }

  const salt = generateSalt()
  const passwordHash = await hashPassword(data.password, salt)

  const newUser: StoredUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: normalizedEmail,
    name: data.name.trim(),
    role: 'student',
    university: data.university?.trim() || undefined,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    salt,
    passwordHash,
  }

  users.push(newUser)
  saveStoredUsers(users)

  const profile: UserProfile = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    avatar: newUser.avatar,
    university: newUser.university,
    createdAt: newUser.createdAt,
    lastLoginAt: newUser.lastLoginAt,
  }
  createSessionForUser(profile)
  return profile
}

/**
 * Valida credenciales e inicia sesión
 */
export async function loginUser(email: string, password: string): Promise<UserProfile> {
  await seedDemoUsers()
  const normalizedEmail = email.trim().toLowerCase()
  const users = getStoredUsers()
  const found = users.find((u) => u.email.toLowerCase() === normalizedEmail)

  if (!found) {
    throw new Error('AUTH_INVALID_CREDENTIALS')
  }

  const calculatedHash = await hashPassword(password, found.salt)
  if (calculatedHash !== found.passwordHash) {
    throw new Error('AUTH_INVALID_CREDENTIALS')
  }

  const profile: UserProfile = {
    id: found.id,
    email: found.email,
    name: found.name,
    role: found.role,
    avatar: found.avatar,
    university: found.university,
    createdAt: found.createdAt,
    lastLoginAt: new Date().toISOString(),
  }

  // Actualizar lastLoginAt en la base de datos local
  const updatedUsers = users.map((u) =>
    u.id === found.id ? { ...u, lastLoginAt: profile.lastLoginAt } : u
  )
  saveStoredUsers(updatedUsers)

  createSessionForUser(profile)
  return profile
}

/**
 * Inicia sesión instantánea en Modo Demostración (Evaluador Académico o Estudiante)
 * Diseñado específicamente para que jurados y profesores califiquen de inmediato.
 */
export async function loginAsDemo(role: 'evaluator' | 'student' = 'evaluator'): Promise<UserProfile> {
  await seedDemoUsers()
  const baseProfile = role === 'evaluator' ? DEMO_EVALUATOR_USER : DEMO_STUDENT_USER
  const session = createSessionForUser(baseProfile)
  return session.user
}

/**
 * Cierra la sesión activa actual
 */
export function logoutUser(): void {
  saveSession(null)
}

/**
 * Actualiza los datos del perfil activo
 */
export function updateActiveUserProfile(data: Partial<UserProfile>): UserProfile {
  const current = getCurrentSession()
  if (!current) {
    throw new Error('NO_ACTIVE_SESSION')
  }

  const updatedProfile: UserProfile = {
    ...current.user,
    ...data,
  }

  createSessionForUser(updatedProfile)

  // Actualizar en la lista general de usuarios
  const users = getStoredUsers()
  const userIdx = users.findIndex((u) => u.id === updatedProfile.id)
  if (userIdx >= 0) {
    users[userIdx] = {
      ...users[userIdx],
      ...data,
    }
    saveStoredUsers(users)
  }

  return updatedProfile
}
