const SuperAdminStatusBadge = ({ status }) => {
  const normalized = status?.toLowerCase() || 'pending'
  const badgeStyles = {
    verified: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
    pending: 'bg-orange-500/10 text-orange-300 border border-orange-500/20',
    rejected: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
  }
  const labels = {
    verified: '✅ Verified Hospital',
    pending: '⏳ Verification Pending',
    rejected: '❌ Verification Rejected',
  }

  return (
    <span className={`whitespace-nowrap shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${badgeStyles[normalized] || badgeStyles.pending}`}>
      {labels[normalized] || labels.pending}
    </span>
  )
}

export default SuperAdminStatusBadge
