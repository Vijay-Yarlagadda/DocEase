import { Routes, Route } from 'react-router-dom'
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
import DoctorDashboard from './pages/dashboards/DoctorDashboard'
import PatientDashboard from './pages/dashboards/PatientDashboard'
import DoctorChangePassword from './pages/DoctorChangePassword'
import { AuthContext } from './context/AuthContext'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const { user } = useContext(AuthContext)

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

  // Only show navbar/footer on non-dashboard pages or when not logged in
  const showMainLayout = !user || !['/admin', '/doctor', '/patient'].some(prefix => 
    window.location.pathname.startsWith(prefix)
  )

  return (
    <div className="min-h-screen flex flex-col">
      {showMainLayout && <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
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
        <Route path="/admin" element={<DashboardLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="hospitals" element={<div>Hospitals Management</div>} />
          <Route path="add-doctor" element={<div>Add New Doctor</div>} />
          <Route path="users" element={<div>User Management</div>} />
          <Route path="analytics" element={<div>Analytics Dashboard</div>} />
          <Route path="settings" element={<div>Admin Settings</div>} />
        </Route>

        <Route path="/doctor" element={<DashboardLayout />}>
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="patients" element={<div>Patient List</div>} />
          <Route path="appointments" element={<div>Appointments</div>} />
          <Route path="records" element={<div>Medical Records</div>} />
          <Route path="settings" element={<div>Doctor Settings</div>} />
        </Route>

        <Route path="/patient" element={<DashboardLayout />}>
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="appointments" element={<div>My Appointments</div>} />
          <Route path="history" element={<div>Medical History</div>} />
          <Route path="settings" element={<div>Patient Settings</div>} />
        </Route>
      </Routes>
      {showMainLayout && <Footer />}
    </div>
  )
}

export default App

