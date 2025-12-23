import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { useAdminAuth } from '@/features/auth/hooks/admin/useAdminAuth'
import { useAdminAuthToken } from '@/features/auth/hooks/admin/useAdminAuthToken'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type LoginFormValues = {
  email: string
  password: string
}

const LoginPage = () => {
  const router = useRouter()
  const { handleAdminLogin, isSubmitting } = useAdminAuth()
  const { isAuthorized } = useAdminAuthToken()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (isAuthorized) {
      void router.replace('/admin')
    }
  }, [isAuthorized, router])

  const onSubmit = handleSubmit(async (values) => {
    // await handleAdminLogin(values)
    void router.push('/admin')
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        <Card className="border-none bg-slate-900/60 backdrop-blur-md">
          <CardHeader className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Admin Console</p>
            <CardTitle className="text-2xl text-white">Sign in to continue</CardTitle>
            <CardDescription className="text-sm text-slate-400">
              Use your administrator credentials to access the console.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password', { required: 'Password is required' })}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

LoginPage.title = 'Admin Login'

export default LoginPage
