import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardNavbar from '../components/dashboard/DashboardNavbar'

const DashboardLayout = ({ darkMode, toggleDarkMode }) => {
  const location = useLocation()

  return (
    <div className="dashboard-layout">
      <div className="dashboard-glow dashboard-glow--left" aria-hidden="true" />
      <div className="dashboard-glow dashboard-glow--right" aria-hidden="true" />

      <DashboardNavbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="dashboard-main">
        <div className="dashboard-main-inner">
          <div className="max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
