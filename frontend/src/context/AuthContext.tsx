import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import * as authApi from '@/api/auth'
import { getCurrentUser } from '@/api/auth'
import { removeToken, setToken } from '@/api/client'
import type { LoginCredentials, RegisterCredentials, User } from '@/types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials)
    setToken(response.access_token)
    setUser(response.user)
  }, [])

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const response = await authApi.register(credentials)
    setUser(response.user)
  }, [])

  const logout = useCallback(() => {
    removeToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
