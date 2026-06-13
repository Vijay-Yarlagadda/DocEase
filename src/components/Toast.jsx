import React, { createContext, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react'

export const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now()
    const newToast = { id, message, type }

    setToasts((prev) => [...prev, newToast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showSuccess = useCallback((message, duration = 3000) => {
    return addToast(message, 'success', duration)
  }, [addToast])

  const showError = useCallback((message, duration = 4000) => {
    return addToast(message, 'error', duration)
  }, [addToast])

  const showInfo = useCallback((message, duration = 3000) => {
    return addToast(message, 'info', duration)
  }, [addToast])

  const showWarning = useCallback((message, duration = 3000) => {
    return addToast(message, 'warning', duration)
  }, [addToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

const Toast = ({ toast, onClose }) => {
  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
        }
      case 'error':
        return {
          icon: <XCircle className="w-4 h-4 text-rose-400" />,
        }
      case 'warning':
        return {
          icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
        }
      case 'info':
      default:
        return {
          icon: <Info className="w-4 h-4 text-blue-400" />,
        }
    }
  }

  const { icon } = getStyles(toast.type)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-slate-100 px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 max-w-[90vw]"
    >
      {icon}
      <p className="text-xs sm:text-sm font-medium pr-1">{toast.message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-slate-400 hover:text-white transition-colors"
      >
        <span className="sr-only">Close</span>
        <XCircle className="w-4 h-4 opacity-0 hover:opacity-100 absolute -right-2" style={{display: 'none'}} />
      </button>
    </motion.div>
  )
}

// Custom hook to use toast
export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
