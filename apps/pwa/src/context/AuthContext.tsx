import React, { createContext, useContext, useEffect, useState } from 'react'
import type { UserProfile } from '../types'
import {
  getCurrentSession,
  loginAsDemo as serviceLoginAsDemo,
  loginUser,
  logoutUser,
  registerUser,
  seedDemoUsers,
  updateActiveUserProfile,
} from '../services/authService'

export interface AuthContextValue {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, university?: string) => Promise<void>
  loginAsDemo: (role?: 'evaluator' | 'student') => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<UserProfile>) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const session = getCurrentSession()
    return session ? session.user : null
  })
  const [isLoading] = useState<boolean>(false)

  useEffect(() => {
    // Inicializar semillas de usuarios demo en segundo plano
    seedDemoUsers().catch(console.error)
  }, [])

  const login = async (email: string, password: string) => {
    const loggedUser = await loginUser(email, password)
    setUser(loggedUser)
  }

  const register = async (name: string, email: string, password: string, university?: string) => {
    const registeredUser = await registerUser({ name, email, password, university })
    setUser(registeredUser)
  }

  const loginAsDemo = async (role: 'evaluator' | 'student' = 'evaluator') => {
    const demoUser = await serviceLoginAsDemo(role)
    setUser(demoUser)
  }

  const logout = () => {
    logoutUser()
    setUser(null)
  }

  const updateProfile = (data: Partial<UserProfile>) => {
    const updated = updateActiveUserProfile(data)
    setUser(updated)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginAsDemo,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  const fallback = React.useMemo<AuthContextValue>(() => {
    const session = getCurrentSession()
    return {
      user: session ? session.user : null,
      isAuthenticated: !!session,
      isLoading: false,
      login: async () => {},
      register: async () => {},
      loginAsDemo: async () => {},
      logout: () => {},
      updateProfile: () => {},
    }
  }, [])
  return context || fallback
}
