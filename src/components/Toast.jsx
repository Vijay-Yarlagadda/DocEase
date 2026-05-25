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
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
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
          bg: 'bg-green-500',
          icon: <CheckCircle className="w-5 h-5" />,
        }
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: <XCircle className="w-5 h-5" />,
        }
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          icon: <AlertCircle className="w-5 h-5" />,
        }
      case 'info':
      default:
        return {
          bg: 'bg-blue-500',
          icon: <Info className="w-5 h-5" />,
        }
    }
  }

  const { bg, icon } = getStyles(toast.type)

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`${bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3`}
    >
      {icon}
      <p className="text-sm flex-1">{toast.message}</p>
      <button
        onClick={onClose}
        className="text-white opacity-70 hover:opacity-100 transition-opacity"
      >
        ×
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
