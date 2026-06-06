import { Routes, Route, useLocation } from 'react-router-dom'
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
import DoctorDashboard from './pages/dashboards/DoctorDashboard'
import PatientDashboard from './pages/dashboards/PatientDashboard'
import DoctorChangePassword from './pages/DoctorChangePassword'
import DashboardPlaceholder from './components/dashboard/DashboardPlaceholder'
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
                           location.pathname.startsWith('/patient')
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
        <Route path="/admin" element={<DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="hospitals" element={<AdminHospitals />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="add-doctor" element={<AdminDoctors />} />
          <Route path="users" element={<DashboardPlaceholder title="User Management" />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="analytics" element={<DashboardPlaceholder title="Analytics Dashboard" />} />
          <Route path="settings" element={<DashboardPlaceholder title="Admin Settings" />} />
        </Route>

        <Route path="/doctor" element={<DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="patients" element={<DashboardPlaceholder title="Patient List" />} />
          <Route path="appointments" element={<DashboardPlaceholder title="Appointments" />} />
          <Route path="records" element={<DashboardPlaceholder title="Medical Records" />} />
          <Route path="settings" element={<DashboardPlaceholder title="Doctor Settings" />} />
        </Route>

        <Route path="/patient" element={<DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="appointments" element={<DashboardPlaceholder title="My Appointments" />} />
          <Route path="history" element={<DashboardPlaceholder title="Medical History" />} />
          <Route path="settings" element={<DashboardPlaceholder title="Patient Settings" />} />
        </Route>
      </Routes>
      {showFooter && <Footer />}
    </div>
  )
}

export default App

