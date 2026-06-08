import { useContext } from 'react'
import { ShieldCheck, Lock, Settings } from 'lucide-react'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import { AuthContext } from '../../context/AuthContext'

const SuperAdminSettings = () => {
  const { user } = useContext(AuthContext)

  return (
    <div>
      <DashboardPageHeader
        role="superadmin"
        title="Settings"
        subtitle="Manage your hidden Super Admin profile and security preferences."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="dashboard-card">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-fuchsia-500" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Super Admin account</h2>
              <p className="text-sm text-slate-500">Your access is hidden from public signup and login screens.</p>
            </div>
          </div>
          <div className="space-y-4 text-sm text-slate-500">
            <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/60 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</p>
              <p className="mt-2 text-sm text-slate-900 dark:text-white">{user?.email || 'docease06@gmail.com'}</p>
            </div>
            <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/60 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Role</p>
              <p className="mt-2 text-sm text-slate-900 dark:text-white">Super Admin</p>
            </div>
            <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/60 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Security</p>
              <p className="mt-2 text-sm text-slate-900 dark:text-white">This dashboard is protected by role-based access control and hidden from the public authentication flow.</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-emerald-500" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Security details</h2>
              <p className="text-sm text-slate-500">Hidden account protection and admin-only controls.</p>
            </div>
          </div>
          <div className="space-y-4 text-sm text-slate-500">
            <p>Only the hidden Super Admin email can access this dashboard. Public signup and role selection never reveal this account.</p>
            <p>Any request to /super-admin/* is blocked unless the authenticated user has the Firestore role field set to <span className="font-semibold text-slate-900 dark:text-white">superadmin</span>.</p>
            <p>If you need to rotate the Super Admin password, update it securely from the Firebase Console or Auth provider.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminSettings
