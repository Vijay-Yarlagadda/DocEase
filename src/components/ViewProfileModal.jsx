import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, Stethoscope, Award, Briefcase } from 'lucide-react'
import { getDisplayName, getUserEmail, getInitials, getRoleStyle } from '../utils/userProfile'

const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-700/30 last:border-0">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900/60 border border-slate-700/40">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-white truncate">{value}</p>
      </div>
    </div>
  )
}

const ViewProfileModal = ({ isOpen, onClose, user }) => {
  const displayName = getDisplayName(user)
  const email = getUserEmail(user)
  const initials = getInitials(user)
  const roleStyle = getRoleStyle(user?.role)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`h-1.5 bg-gradient-to-r ${roleStyle.gradient}`} />

            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white">View Profile</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <span className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${roleStyle.gradient} text-base font-bold text-white`}>
                  {initials}
                </span>
                <div>
                  <p className="text-lg font-semibold text-white">{displayName}</p>
                  <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${roleStyle.badge}`}>
                    {roleStyle.label}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/50 border border-slate-700/40 px-4">
                <InfoRow icon={User} label="Full Name" value={displayName} />
                <InfoRow icon={Mail} label="Email" value={email} />
                <InfoRow icon={Phone} label="Phone" value={user?.phone} />
                {user?.role === 'doctor' && (
                  <>
                    <InfoRow icon={Stethoscope} label="Specialization" value={user?.specialization} />
                    <InfoRow icon={Award} label="Qualification" value={user?.qualification} />
                    <InfoRow
                      icon={Briefcase}
                      label="Experience"
                      value={user?.experience != null && user?.experience !== '' ? `${user.experience} years` : null}
                    />
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ViewProfileModal
