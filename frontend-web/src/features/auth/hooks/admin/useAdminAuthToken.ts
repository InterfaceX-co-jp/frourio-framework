import { adminAuthStateInCookieStorage } from '@/utils/cookieStorage'
import { adminAuthStateInSessionStorage } from '@/utils/sessionStorage'
import { useEffect, useState } from 'react'

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN'

export const useAdminAuthToken = () => {
  const [isAuthorized, setAuthorized] = useState(false)
  const [isLoading, setLoading] = useState(true)
  const [role, setRole] = useState<AdminRole | null>(null)

  useEffect(() => {
    const authData = adminAuthStateInSessionStorage.get()
    setAuthorized(authData.token !== '')
    setRole((authData.role as AdminRole) || null)
    setLoading(false)
  }, [])

  const setAuthState = (args: { token: string; role: string }) => {
    adminAuthStateInSessionStorage.set(args)
    adminAuthStateInCookieStorage.set(args)
    setAuthorized(true)
    setRole(args.role as AdminRole)
  }

  const getAuthState = () => {
    return adminAuthStateInSessionStorage.get()
  }

  const removeAuthState = () => {
    adminAuthStateInSessionStorage.remove()
    adminAuthStateInCookieStorage.remove()
    setAuthorized(false)
    setRole(null)
  }

  return {
    isAuthorized,
    isLoading,
    role,
    setAuthState,
    getAuthState,
    removeAuthState,
  }
}
