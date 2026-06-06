import { motion } from 'framer-motion'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import AdminAnalyticsPanel from '../../components/admin/AdminAnalyticsPanel'

const AdminAnalytics = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
    <DashboardPageHeader
      role="admin"
      title="Analytics Overview"
      subtitle="Doctor performance, appointment trends, patient registration insights, and hospital metrics."
    />
    <AdminAnalyticsPanel />
  </motion.div>
)

export default AdminAnalytics
