import { motion } from 'framer-motion'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import AdminSettingsPanel from '../../components/admin/AdminSettingsPanel'

const AdminSettings = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
    <DashboardPageHeader
      role="admin"
      title="Settings"
      subtitle="Update your profile, manage hospital details, and configure security preferences."
    />
    <AdminSettingsPanel />
  </motion.div>
)

export default AdminSettings
