import { motion } from 'framer-motion'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import AppointmentManagementPanel from '../../components/admin/AppointmentManagementPanel'

const AdminAppointments = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
    <DashboardPageHeader
      role="admin"
      title="Appointment Management"
      subtitle="View all appointments, upcoming schedules, and statistics"
    />
    <AppointmentManagementPanel />
  </motion.div>
)

export default AdminAppointments
