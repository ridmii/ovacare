import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getStoredUser, getToken, clearSession, AuthUser } from './authService'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  setUser: (user: AuthUser | null) => void
  logout: () => void
  refresh: () => void
  isLoggedIn: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  setUser: () => {},
  logout: () => {},
  refresh: () => {},
  isLoggedIn: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(getStoredUser)
  const [token, setToken] = useState<string | null>(getToken)

  const refresh = useCallback(() => {
    setUserState(getStoredUser())
    setToken(getToken())
  }, [])

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u)
    setToken(getToken())
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUserState(null)
    setToken(null)
  }, [])

  // Re-sync from localStorage whenever window regains focus (multi-tab safety)
  useEffect(() => {
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refresh])

  return (
    <AuthContext.Provider value={{ user, token, setUser, logout, refresh, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
