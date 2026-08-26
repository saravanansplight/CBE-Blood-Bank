import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('cbc_token')
    const role = localStorage.getItem('cbc_role')
    const name = localStorage.getItem('cbc_name')
    return token ? { token, role, name } : null
  })

  const login = useCallback(({ token, role, fullName }) => {
    localStorage.setItem('cbc_token', token)
    localStorage.setItem('cbc_role', role)
    localStorage.setItem('cbc_name', fullName || '')
    setUser({ token, role, name: fullName || '' })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('cbc_token')
    localStorage.removeItem('cbc_role')
    localStorage.removeItem('cbc_name')
    setUser(null)
  }, [])

  const updateName = useCallback((fullName) => {
    localStorage.setItem('cbc_name', fullName || '')
    setUser((u) => (u ? { ...u, name: fullName || '' } : u))
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, updateName }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const portalHome = (role) =>
  ({ donor: '/donor/dashboard', requester: '/requester/dashboard', admin: '/admin/dashboard' }[role] || '/login')
