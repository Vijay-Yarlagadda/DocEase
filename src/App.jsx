import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import DashboardLayout from './layouts/DashboardLayout'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import AdminHospitals from './pages/admin/AdminHospitals'
import AdminDoctors from './pages/admin/AdminDoctors'
import AdminAppointments from './pages/admin/AdminAppointments'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminSettings from './pages/admin/AdminSettings'
import DoctorDashboard from './pages/dashboards/DoctorDashboard'
import PatientDashboard from './pages/dashboards/PatientDashboard'
import DoctorChangePassword from './pages/DoctorChangePassword'
import DashboardPlaceholder from './components/dashboard/DashboardPlaceholder'
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard'
import SuperAdminVerification from './pages/super-admin/SuperAdminVerification'
import SuperAdminHospitals from './pages/super-admin/SuperAdminHospitals'
import SuperAdminAnalytics from './pages/super-admin/SuperAdminAnalytics'
import SuperAdminSettings from './pages/super-admin/SuperAdminSettings'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthContext } from './context/AuthContext'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const { user } = useContext(AuthContext)
  const location = useLocation()

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    if (newMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // determine if current route is part of a dashboard
  const isDashboardRoute = location.pathname.startsWith('/admin') || 
                           location.pathname.startsWith('/doctor') || 
                           location.pathname.startsWith('/patient') || 
                           location.pathname.startsWith('/super-admin')
  const showNavbar = !isDashboardRoute
  const showFooter = !isDashboardRoute

  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && (
        <Navbar
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          user={user}
        />
      )}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/doctor/change-password" element={<DoctorChangePassword />} />
        
        {/* Dashboard routes - using DashboardLayout */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="hospitals" element={<AdminHospitals />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="add-doctor" element={<AdminDoctors />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>}>
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="patients" element={<DashboardPlaceholder title="Patient List" />} />
          <Route path="appointments" element={<DashboardPlaceholder title="Appointments" />} />
          <Route path="records" element={<DashboardPlaceholder title="Medical Records" />} />
          <Route path="settings" element={<DashboardPlaceholder title="Doctor Settings" />} />
        </Route>

        <Route path="/patient" element={<ProtectedRoute roles={['patient']}><DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>}>
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="appointments" element={<DashboardPlaceholder title="My Appointments" />} />
          <Route path="history" element={<DashboardPlaceholder title="Medical History" />} />
          <Route path="settings" element={<DashboardPlaceholder title="Patient Settings" />} />
        </Route>

        <Route path="/super-admin" element={<ProtectedRoute roles={['superadmin']}><DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="verification" element={<SuperAdminVerification />} />
          <Route path="hospitals" element={<SuperAdminHospitals />} />
          <Route path="analytics" element={<SuperAdminAnalytics />} />
          <Route path="settings" element={<SuperAdminSettings />} />
        </Route>
      </Routes>
      {showFooter && <Footer />}
    </div>
  )
}

export default App

