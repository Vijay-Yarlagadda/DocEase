import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const roleAccent = {
  admin: {
    ring: 'ring-blue-500',
    border: 'border-blue-400',
    borderDark: 'dark:border-blue-500',
    glow: 'shadow-[0_0_24px_rgba(59,130,246,0.35)]',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    bgHover: 'hover:bg-blue-100 dark:hover:bg-blue-500/20',
    iconBg: 'bg-gradient-to-br from-blue-600 to-blue-400',
    iconBgLight: 'from-blue-500 to-blue-400',
    text: 'text-blue-600 dark:text-blue-400',
    textLabel: 'text-slate-900 dark:text-white',
    textDesc: 'text-slate-600 dark:text-blue-300',
    unselectedBg: 'bg-slate-50 dark:bg-slate-800/40',
    unselectedBorder: 'border-slate-300 dark:border-slate-700/60',
    unselectedText: 'text-slate-700 dark:text-slate-300',
    unselectedDesc: 'text-slate-500 dark:text-slate-500',
    dot: 'bg-blue-500',
  },
  doctor: {
    ring: 'ring-cyan-500',
    border: 'border-cyan-400',
    borderDark: 'dark:border-cyan-500',
    glow: 'shadow-[0_0_24px_rgba(6,182,212,0.35)]',
    bg: 'bg-cyan-50 dark:bg-cyan-500/10',
    bgHover: 'hover:bg-cyan-100 dark:hover:bg-cyan-500/20',
    iconBg: 'bg-gradient-to-br from-cyan-600 to-cyan-400',
    iconBgLight: 'from-cyan-500 to-cyan-400',
    text: 'text-cyan-600 dark:text-cyan-400',
    textLabel: 'text-slate-900 dark:text-white',
    textDesc: 'text-slate-600 dark:text-cyan-300',
    unselectedBg: 'bg-slate-50 dark:bg-slate-800/40',
    unselectedBorder: 'border-slate-300 dark:border-slate-700/60',
    unselectedText: 'text-slate-700 dark:text-slate-300',
    unselectedDesc: 'text-slate-500 dark:text-slate-500',
    dot: 'bg-cyan-500',
  },
  patient: {
    ring: 'ring-teal-500',
    border: 'border-teal-400',
    borderDark: 'dark:border-teal-500',
    glow: 'shadow-[0_0_24px_rgba(20,184,166,0.35)]',
    bg: 'bg-teal-50 dark:bg-teal-500/10',
    bgHover: 'hover:bg-teal-100 dark:hover:bg-teal-500/20',
    iconBg: 'bg-gradient-to-br from-teal-600 to-teal-400',
    iconBgLight: 'from-teal-500 to-teal-400',
    text: 'text-teal-600 dark:text-teal-400',
    textLabel: 'text-slate-900 dark:text-white',
    textDesc: 'text-slate-600 dark:text-teal-300',
    unselectedBg: 'bg-slate-50 dark:bg-slate-800/40',
    unselectedBorder: 'border-slate-300 dark:border-slate-700/60',
    unselectedText: 'text-slate-700 dark:text-slate-300',
    unselectedDesc: 'text-slate-500 dark:text-slate-500',
    dot: 'bg-teal-500',
  },
}

const AuthRoleSelector = ({ roles, selectedRole, onSelect, columns = 3 }) => {
  const gridClass =
    columns === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1 sm:grid-cols-3'

  return (
    <div className={`grid ${gridClass} gap-3`}>
      {roles.map((role) => {
        const Icon = role.icon
        const isSelected = selectedRole === role.id
        const accent = roleAccent[role.id] || roleAccent.admin

        return (
          <motion.button
            key={role.id}
            type="button"
            onClick={() => onSelect(role.id)}
            whileHover={{ scale: isSelected ? 1.02 : 1.01 }}
            whileTap={{ scale: 0.98 }}
            aria-pressed={isSelected}
            className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
              isSelected
                ? `${accent.border} ${accent.borderDark} ${accent.bg} ${accent.glow} ring-2 ring-offset-2 dark:ring-offset-slate-900 ${accent.ring} scale-[1.02]`
                : `${accent.unselectedBorder} ${accent.unselectedBg} hover:border-slate-400 dark:hover:border-slate-600 ${accent.bgHover}`
            }`}
          >
            {isSelected && (
              <span className={`absolute top-3 right-3 flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br ${accent.iconBgLight}`}>
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </span>
            )}

            <div className="flex flex-col items-center text-center gap-3 sm:gap-2.5">
              <span
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                  isSelected
                    ? `${accent.iconBg} shadow-lg`
                    : 'bg-slate-200 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : ''}`} />
              </span>

              <div>
                <p className={`font-semibold text-sm ${isSelected ? accent.textLabel : accent.unselectedText}`}>
                  {role.label}
                </p>
                <p className={`text-xs mt-0.5 ${isSelected ? accent.textDesc : accent.unselectedDesc}`}>
                  {role.description}
                </p>
              </div>

              {isSelected && (
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider ${accent.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${accent.dot} animate-pulse`} />
                  Selected
                </span>
              )}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

export default AuthRoleSelector
