import { type PropsWithChildren, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAdminAuth } from '@/features/auth/hooks/admin/useAdminAuth'
import { useAdminAuthToken } from '@/features/auth/hooks/admin/useAdminAuthToken'
import { pagesPath } from '@/utils/$path'

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin',
  },
]

export default function AdminLayout({ children }: PropsWithChildren) {
  const router = useRouter()
  const { isAuthorized } = useAdminAuthToken()
  const { handleAdminLogout } = useAdminAuth()
  const [isReady, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (!isReady) return
    if (!isAuthorized) {
      void router.replace(pagesPath.admin.auth.login.$url())
    }
  }, [isAuthorized, isReady, router])

  if (!isReady) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="hidden w-60 border-r border-slate-800/80 bg-slate-900/50 px-5 py-8 lg:block">
        <div className="mb-8 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Admin Console
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
            <p className="text-lg font-semibold text-white">Control Center</p>
          </div>
          <div className="flex items-center gap-3">
            <Separator orientation="vertical" className="h-6 bg-slate-700" />
            <Button variant="outline" className="border-slate-700 text-slate-100" onClick={handleAdminLogout}>
              Logout
            </Button>
          </div>
        </header>

        <main className="px-6 py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
