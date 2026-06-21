export const getDisplayName = (user) => {
  if (!user) return 'User'
  if (user.role === 'superadmin') return 'DocEase'
  if (user.name?.trim()) return user.name.trim()
  if (user.fullName?.trim()) return user.fullName.trim()
  const email = user.email || user.mail
  if (email) return email.split('@')[0]
  return 'User'
}

export const getUserEmail = (user) => user?.email || user?.mail || ''

export const formatDoctorName = (name) => {
  if (!name) return '—'
  const trimmed = name.trim()
  const nameWithoutDr = trimmed.replace(/^dr\.?\s*/i, '').trim()
  return `Dr. ${nameWithoutDr}`
}

export const getInitials = (user) => {
  const name = getDisplayName(user)
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export const roleStyles = {
  admin: {
    label: 'Administrator',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    gradient: 'from-blue-600 to-blue-400',
    ring: 'ring-blue-500/30',
  },
  doctor: {
    label: 'Doctor',
    badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
    gradient: 'from-cyan-600 to-cyan-400',
    ring: 'ring-cyan-500/30',
  },
  superadmin: {
    label: 'Super Admin',
    badge: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/25',
    gradient: 'from-fuchsia-700 to-pink-500',
    ring: 'ring-fuchsia-500/30',
  },
  patient: {
    label: 'Patient',
    badge: 'bg-teal-500/15 text-teal-400 border-teal-500/25',
    gradient: 'from-teal-600 to-teal-400',
    ring: 'ring-teal-500/30',
  },
}

export const getRoleStyle = (role) => roleStyles[role] || roleStyles.patient
