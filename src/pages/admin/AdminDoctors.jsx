import { motion } from 'framer-motion'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import DoctorManagementPanel from '../../components/admin/DoctorManagementPanel'

const AdminDoctors = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
    <DashboardPageHeader
      role="admin"
      title="Doctor Management"
      subtitle="Add, edit, search, and manage doctor accounts"
    />
    <DoctorManagementPanel />
  </motion.div>
)

export default AdminDoctors
