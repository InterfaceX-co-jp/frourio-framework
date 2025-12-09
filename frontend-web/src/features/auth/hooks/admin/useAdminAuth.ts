import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { API_BASE_PATH, API_ORIGIN } from '@/env'
import { pagesPath } from '@/utils/$path'
import { useAdminAuthToken } from './useAdminAuthToken'

export const useAdminAuth = () => {
  const router = useRouter()
  const { setAuthState, removeAuthState, getAuthState } = useAdminAuthToken()
  const [isSubmitting, setSubmitting] = useState(false)

  const handleAdminLogin = async (params: { email: string; password: string }) => {
    setSubmitting(true)
    try {
      const response = await axios.post<{ token: string }>(
        `${API_ORIGIN}${API_BASE_PATH}/auth/admin/login`,
        params,
      )

      setAuthState({ token: response.data.token })
      toast.success('管理画面にログインしました')
      return response.data
    } catch (error) {
      console.error('Admin login failed', error)
      toast.error('ログインに失敗しました')
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  const handleAdminLogout = () => {
    removeAuthState()
    toast.success('ログアウトしました')
    router.push(pagesPath.admin.auth.login.$url())
  }

  return {
    handleAdminLogin,
    handleAdminLogout,
    getAuthState,
    isSubmitting,
  }
}
