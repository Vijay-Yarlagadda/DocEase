import { motion } from 'framer-motion'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import PatientManagementPanel from '../../components/admin/PatientManagementPanel'

const AdminUsers = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
    <DashboardPageHeader
      role="admin"
      title="Patient Management"
      subtitle="View registered patients, search by name, and review appointment history counts."
    />
    <PatientManagementPanel />
  </motion.div>
)

export default AdminUsers
