import AdminLayout from '@/layouts/AdminLayout'

const AdminDashboard = () => {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Overview</p>
        <h1 className="text-2xl font-semibold text-white">Welcome back, admin</h1>
        <p className="text-sm text-slate-400">Use the navigation to manage the platform.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-800/70 bg-slate-900/50 p-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">Status</p>
          <p className="text-3xl font-semibold text-white">Healthy</p>
        </div>
        <div className="rounded-lg border border-slate-800/70 bg-slate-900/50 p-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">Users</p>
          <p className="text-3xl font-semibold text-white">—</p>
        </div>
        <div className="rounded-lg border border-slate-800/70 bg-slate-900/50 p-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">Alerts</p>
          <p className="text-3xl font-semibold text-white">0</p>
        </div>
      </div>
    </div>
  )
}

AdminDashboard.title = 'Admin Dashboard'
AdminDashboard.Layout = AdminLayout

export default AdminDashboard
