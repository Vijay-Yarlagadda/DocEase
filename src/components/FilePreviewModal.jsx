import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

const FilePreviewModal = ({ document, onClose }) => {
  if (!document) return null

  const isImage = document.mimeType?.startsWith('image/')
  const isPdf = document.mimeType === 'application/pdf' || document.fileUrl?.toLowerCase().endsWith('.pdf')

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm"
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
            <button onClick={onClose} className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="min-h-[60vh] bg-slate-100 dark:bg-slate-900 p-4">
            {isImage ? (
              <img src={document.fileUrl} alt={document.fileName} className="mx-auto max-h-[70vh] w-full object-contain rounded-3xl" />
            ) : isPdf ? (
              <iframe
                src={document.fileUrl}
                title={document.fileName}
                className="h-[70vh] w-full rounded-3xl border border-slate-200/70 bg-white"
              />
            ) : (
              <div className="flex h-[70vh] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-center text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                <p className="max-w-xl px-4">Preview not available for this file type. Use download to view it in a native application.</p>
              </div>
            )}
          </div>
        </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default FilePreviewModal
