import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Stethoscope } from 'lucide-react'

const AuthPageShell = ({ title, highlight, subtitle, children, footerText, footerLink, footerLinkText }) => {
  return (
    <div className="auth-page min-h-screen flex items-center justify-center px-4 py-24 sm:py-28">
      <div className="auth-page-glow auth-page-glow--left" aria-hidden="true" />
      <div className="auth-page-glow auth-page-glow--right" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5 text-white" />
            </span>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              DocEase
            </span>
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
            {title}{' '}
            {highlight && (
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                {highlight}
              </span>
            )}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="auth-card rounded-2xl p-6 sm:p-8"
        >
          {children}
        </motion.div>

        {footerText && footerLink && (
          <p className="text-center text-slate-500 text-sm mt-6">
            {footerText}{' '}
            <Link
              to={footerLink}
              className="text-accent hover:text-cyan-300 font-medium transition-colors"
            >
              {footerLinkText}
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default AuthPageShell
