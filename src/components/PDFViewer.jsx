import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Download } from 'lucide-react'

const PDFViewer = ({ isOpen, url, fileName, onClose }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const iframeRef = useRef(null)

  useEffect(() => {
    if (isOpen && url) {
      setLoading(true)
      setError(null)
    }
  }, [isOpen, url])

  if (!isOpen || !url) return null

  const handleDownload = () => {
    console.log('[PDF Viewer] Downloading', { fileName, url })
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || 'document.pdf'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleIframeLoad = () => {
    console.log('[PDF Viewer] PDF loaded successfully')
    setLoading(false)
  }

  const handleIframeError = () => {
    console.error('[PDF Viewer] Failed to load PDF iframe')
    setLoading(false)
    setError('Could not load PDF in viewer. Try downloading instead.')
  }

  // Use direct URL for inline preview, avoid forcing download in the browser.
  const pdfUrl = url

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl h-[90vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-800 bg-slate-950 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate">{fileName || 'Document'}</h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">{url}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Container */}
        <div className="flex-1 overflow-hidden bg-slate-950 relative flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 animate-spin mb-3">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-cyan-500"></div>
                </div>
                <p className="text-slate-400 text-sm">Loading PDF...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
              <div className="text-center max-w-xs">
                <div className="text-red-500 text-4xl mb-3">⚠️</div>
                <p className="text-white font-semibold mb-1">Failed to load PDF</p>
                <p className="text-slate-400 text-sm mb-4">{error}</p>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition"
                >
                  <Download className="w-4 h-4" />
                  Download instead
                </button>
              </div>
            </div>
          )}

          {/* Using embed for better compatibility with PDFs */}
          <embed
            ref={iframeRef}
            src={pdfUrl}
            type="application/pdf"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            className="w-full h-full"
            title="PDF Viewer"
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PDFViewer
