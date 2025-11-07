import { motion } from 'framer-motion'
import { Target, Heart, Zap, Shield, Users, Clock } from 'lucide-react'

const About = () => {
  const features = [
    {
      icon: Target,
      title: 'Mission',
      description: 'To revolutionize healthcare communication and make medical services more accessible and efficient for everyone.',
    },
    {
      icon: Heart,
      title: 'Patient-Centered',
      description: 'We put patients first, ensuring their needs are met with care, compassion, and convenience.',
    },
    {
      icon: Zap,
      title: 'Efficiency',
      description: 'Streamline workflows and reduce administrative burden so healthcare professionals can focus on what matters.',
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Your data is protected with industry-leading security measures and compliance standards.',
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Foster better communication between doctors, patients, and administrators.',
    },
    {
      icon: Clock,
      title: '24/7 Access',
      description: 'Access your medical information and manage appointments anytime, anywhere.',
    },
  ]

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              About <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">DocEase</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              DocEase is a comprehensive healthcare platform designed to bridge the gap between medical professionals and patients, 
              making healthcare more accessible, efficient, and user-friendly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Purpose Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Our Purpose
            </h2>
            <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300">
              <p>
                Healthcare systems worldwide face challenges in communication, appointment management, and patient record accessibility. 
                DocEase addresses these issues by providing a unified platform that connects all stakeholders in the healthcare ecosystem.
              </p>
              <p>
                Our platform empowers administrators to manage hospitals effectively, enables doctors to focus on patient care by 
                reducing administrative tasks, and gives patients convenient access to their medical information and services.
              </p>
              <p>
                With DocEase, we're not just building software—we're building a better healthcare experience for everyone.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What We Stand For
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Our core values drive everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card text-center"
                >
                  <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-primary to-secondary mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Portal Details */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Three Portals, One Mission
            </h2>
          </motion.div>

          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Admin Portal
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Comprehensive tools for hospital administrators to manage the entire healthcare ecosystem. 
                Register doctors, manage hospital profiles, monitor system analytics, and ensure smooth operations.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Hospital and department management</li>
                <li>Doctor registration and verification</li>
                <li>System-wide analytics and reporting</li>
                <li>User access control and permissions</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Doctor Portal
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Streamlined interface for medical professionals to manage appointments, access patient records, 
                upload prescriptions, and optimize their schedules.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Real-time appointment management</li>
                <li>Comprehensive patient history access</li>
                <li>Digital prescription creation and sharing</li>
                <li>Schedule optimization and calendar sync</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Patient Portal
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                User-friendly platform for patients to book appointments, upload medical documents, 
                access prescriptions, and view their health records anytime.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Easy appointment booking and management</li>
                <li>Secure medical file uploads</li>
                <li>Prescription and test result access</li>
                <li>Complete health record history</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About

