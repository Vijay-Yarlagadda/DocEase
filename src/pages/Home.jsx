import { motion } from 'framer-motion'
import HeroSection from '../components/HeroSection'
import RoleCard from '../components/RoleCard'
import { Shield, UserCheck, Users, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const Home = () => {
  const roles = [
    {
      icon: Shield,
      title: 'Admin Portal',
      description: 'Manage hospitals, add doctors, and oversee the entire system with comprehensive administrative tools.',
      features: [
        'Hospital management',
        'Doctor registration',
        'System analytics',
        'User management'
      ],
      gradient: 'from-blue-900 to-blue-600',
    },
    {
      icon: UserCheck,
      title: 'Doctor Portal',
      description: 'Manage appointments, view patient records, and upload prescriptions efficiently.',
      features: [
        'Appointment management',
        'Patient records',
        'Prescription uploads',
        'Schedule optimization'
      ],
      gradient: 'from-cyan-600 to-cyan-400',
    },
    {
      icon: Users,
      title: 'Patient Portal',
      description: 'Book appointments, upload medical files, and access your health information easily.',
      features: [
        'Appointment booking',
        'Medical file uploads',
        'Prescription access',
        'Health records'
      ],
      gradient: 'from-teal-600 to-teal-400',
    },
  ]

  return (
    <div className="pt-20">
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Three Powerful Portals
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose the portal that fits your role and start streamlining your healthcare workflow today.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <RoleCard
                key={role.title}
                {...role}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
  <section className="py-20 bg-gradient-to-br from-primary via-secondary to-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of healthcare professionals and patients who trust DocEase for their medical needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/signup"
                className="inline-flex items-center px-8 py-4 rounded-lg font-semibold text-primary bg-white dark:bg-accent dark:text-white border-2 border-white dark:border-accent hover:bg-gray-100 dark:hover:bg-accent/80 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Create Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-8 py-4 rounded-lg font-semibold text-white border-2 border-white hover:bg-white/10 transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home

