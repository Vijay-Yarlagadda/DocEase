import { Link } from 'react-router-dom'
import { Stethoscope } from 'lucide-react'

const DocEaseLogo = ({ collapsed = false, to = '/' }) => {
  return (
    <Link to={to} className="flex items-center space-x-2 group flex-shrink-0">
      <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary group-hover:scale-110 transition-transform">
        <Stethoscope className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </div>
      {!collapsed && (
        <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          DocEase
        </span>
      )}
    </Link>
  )
}

export default DocEaseLogo
