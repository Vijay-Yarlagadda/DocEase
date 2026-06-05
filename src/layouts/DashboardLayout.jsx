import { Outlet } from 'react-router-dom'
import DashboardNavbar from '../components/dashboard/DashboardNavbar'

const DashboardLayout = ({ darkMode, toggleDarkMode }) => {
  return (
    <div className="dashboard-layout">
      <div className="dashboard-glow dashboard-glow--left" aria-hidden="true" />
      <div className="dashboard-glow dashboard-glow--right" aria-hidden="true" />

      <DashboardNavbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="dashboard-main">
        <div className="dashboard-main-inner">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
