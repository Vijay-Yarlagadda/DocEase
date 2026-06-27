import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const FilePreviewModal = ({ document, onClose }) => {
  if (!document) return null

  const isImage = document.mimeType?.startsWith('image/')
  const isPdf = document.mimeType === 'application/pdf' || document.fileUrl?.toLowerCase().endsWith('.pdf')

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm"
      >
        <div className="flex min-h-full items-center justify-center p-4 py-10">
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-950"
        >
          <div className="flex items-center justify-between border-b border-slate-200/70 p-4 dark:border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Preview Document</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{document.fileName}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="bg-slate-50/50 p-4 dark:bg-slate-900/50 h-[80vh] min-h-[400px]">
            {isImage ? (
              <img src={document.fileUrl} alt={document.fileName} className="h-full w-full object-contain rounded-2xl" />
            ) : isPdf ? (
              <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(document.fileUrl)}&embedded=true`} title={document.fileName} className="h-full w-full rounded-2xl bg-white dark:bg-slate-950 border-0" />
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl bg-white dark:bg-slate-950 text-slate-500">
                <p>Preview not available for this file type.</p>
              </div>
            )}
          </div>
        </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

export default FilePreviewModal
