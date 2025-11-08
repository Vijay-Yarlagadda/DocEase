import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 ml-16 lg:ml-64 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout