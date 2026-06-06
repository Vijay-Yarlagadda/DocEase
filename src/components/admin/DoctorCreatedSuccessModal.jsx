import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, CheckCircle, Mail, KeyRound, UserCheck } from 'lucide-react'
import { useState } from 'react'

const DoctorCreatedSuccessModal = ({ isOpen, onClose, doctor }) => {
  const [copiedField, setCopiedField] = useState(null)

  if (!doctor) return null

  const copy = async (text, field) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const copyAll = async () => {
    const text = `DocEase Doctor Account\nEmail: ${doctor.email}\nTemporary Password: ${doctor.tempPassword}`
    await navigator.clipboard.writeText(text)
    setCopiedField('all')
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="w-full max-w-md bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 bg-gradient-to-r from-cyan-600 to-cyan-400" />

            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/25">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Doctor Account Created</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Share these credentials securely with the doctor</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {doctor.name && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-700/40 mb-3">
                  <UserCheck className="w-4 h-4 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Doctor Name</p>
                    <p className="text-sm text-white font-medium">{doctor.name}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-700/40">
                  <div className="flex items-center gap-3 min-w-0">
                    <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">Email</p>
                      <p className="text-sm text-white truncate">{doctor.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copy(doctor.email, 'email')}
                    className="p-2 rounded-lg text-slate-400 hover:text-accent hover:bg-slate-800 transition-colors flex-shrink-0"
                  >
                    {copiedField === 'email' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-amber-500/20">
                  <div className="flex items-center gap-3 min-w-0">
                    <KeyRound className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">Temporary Password</p>
                      <code className="text-sm text-amber-200 font-mono">{doctor.tempPassword}</code>
                    </div>
                  </div>
                  <button
                    onClick={() => copy(doctor.tempPassword, 'password')}
                    className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors flex-shrink-0"
                  >
                    {copiedField === 'password' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                The doctor must change this password on first login before accessing the dashboard.
              </p>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={copyAll}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-600 text-slate-300 hover:bg-slate-700/50 transition-colors inline-flex items-center justify-center gap-2"
                >
                  {copiedField === 'all' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  Copy All
                </button>
                <button onClick={onClose} className="flex-1 btn-primary text-sm py-2.5">
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default DoctorCreatedSuccessModal
