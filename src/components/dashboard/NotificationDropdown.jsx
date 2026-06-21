import { useState, useEffect, useContext, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Trash2, Calendar, FileText, Info, ArrowRight, Building2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { subscribeToNotifications, markNotificationAsRead } from '../../services/notificationService'

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!user?.uid && !user?.id) return
    const userId = user.uid || user.id
    const unsubscribe = subscribeToNotifications(userId, (newNotifs) => {
      setNotifications(newNotifs)
    })
    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleNotificationClick = async (notification) => {
    const { deleteNotification } = await import('../../services/notificationService')
    await deleteNotification(notification.id)
    setIsOpen(false)
    if (notification.link) {
      navigate(notification.link)
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'appointment': return <Calendar className="w-4 h-4 text-primary" />
      case 'report': return <FileText className="w-4 h-4 text-teal-500" />
      case 'hospital': return <Building2 className="w-4 h-4 text-fuchsia-500" />
      default: return <Info className="w-4 h-4 text-slate-500" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700/50 rounded-xl shadow-2xl shadow-black/10 dark:shadow-black/50 overflow-hidden z-50 flex flex-col max-h-[85vh]"
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center whitespace-nowrap shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1 max-h-[400px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">You have no notifications right now.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3 ${
                        !notif.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                      }`}
                    >
                      <div className={`shrink-0 mt-0.5 p-2 rounded-full ${!notif.read ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notif.read ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                          {notif.title}
                        </p>
                        <p className={`text-xs mt-1 line-clamp-2 ${!notif.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500'}`}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">
                          {notif.createdAt?.toDate ? new Date(notif.createdAt.toDate()).toLocaleString() : 'Just now'}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationDropdown
