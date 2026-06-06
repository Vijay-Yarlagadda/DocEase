import { motion } from 'framer-motion'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import HospitalProfilePanel from '../../components/admin/HospitalProfilePanel'

const AdminHospitals = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
    <DashboardPageHeader
      role="admin"
      title="Hospital Management"
      subtitle="View and edit hospital profile and contact information"
    />
    <HospitalProfilePanel />
  </motion.div>
)

export default AdminHospitals
