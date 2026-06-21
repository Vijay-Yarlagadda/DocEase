import { useState, useRef, useEffect } from 'react'
import { normalizeCloudinaryUrl } from '../utils/hospitalHelpers'
import { motion } from 'framer-motion'
import { X, Download } from 'lucide-react'

const PDFViewer = ({ isOpen, url, fileName, onClose }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pdfSrc, setPdfSrc] = useState(null)
  const [isImage, setIsImage] = useState(false)
  const iframeRef = useRef(null)

  useEffect(() => {
    if (isOpen && url) {
      setLoading(true)
      setError(null)
      setPdfSrc(null)
      setIsImage(false)
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

  let resolved = normalizeCloudinaryUrl(url)

  useEffect(() => {
    if (!isOpen || !resolved) return

    let cancelled = false
    let objectUrl = null

    const tryLoad = async () => {
      setLoading(true)
      setError(null)

      try {
        // First try a simple fetch to verify accessibility
        let resp = await fetch(resolved, { method: 'GET' })

        // If it failed and is a Cloudinary raw URL, try image fallback
        if (!resp.ok && resolved.includes('/raw/upload/')) {
          const imageFallback = resolved.replace('/raw/upload/', '/image/upload/')
          console.warn('[PDF Viewer] Fetch failed for raw, trying image fallback:', imageFallback)
          const fallbackResp = await fetch(imageFallback, { method: 'GET' })
          if (fallbackResp.ok) {
            resp = fallbackResp
            resolved = imageFallback // Update resolved so we use the correct URL
          }
        }

        if (resp.ok) {
          const contentType = resp.headers.get('content-type')
          if (contentType && contentType.includes('text/html')) {
             throw new Error('Server returned an HTML page instead of a document.')
          }

          // Check if the file is an image based on content type or extension
          const isImg = contentType.includes('image') || (fileName && fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/))
          
          const rawBlob = await resp.blob()
          const fileBlob = new Blob([rawBlob], { type: isImg ? (rawBlob.type || 'image/png') : 'application/pdf' })
          objectUrl = URL.createObjectURL(fileBlob)
          if (!cancelled) {
            setPdfSrc(objectUrl)
            setIsImage(!!isImg)
          }
          setLoading(false)
          return
        }

        // If we got a 401/403, try fetching with Authorization header (token)
        if (resp.status === 401 || resp.status === 403) {
          const token = localStorage.getItem('docease_token')
          if (token) {
            const authResp = await fetch(resolved, { method: 'GET', headers: { Authorization: `Bearer ${token}` } })
            if (authResp.ok) {
              const contentType = authResp.headers.get('content-type')
              if (contentType && contentType.includes('text/html')) {
                 throw new Error('Server returned an HTML page instead of a document.')
              }
              const isImg = contentType && contentType.includes('image')
              const rawBlob = await authResp.blob()
              const fileBlob = new Blob([rawBlob], { type: isImg ? (rawBlob.type || 'image/png') : 'application/pdf' })
              objectUrl = URL.createObjectURL(fileBlob)
              if (!cancelled) {
                setPdfSrc(objectUrl)
                setIsImage(!!isImg)
              }
              setLoading(false)
              return
            }
            throw new Error(`Authenticated fetch failed: ${authResp.status}`)
          }
          throw new Error('Resource requires authentication')
        }

        throw new Error(`Failed to load document: HTTP ${resp.status}`)
      } catch (err) {
        console.error('[PDF Viewer] Load error:', err)
        if (!cancelled) {
          setError(err.message || 'Unable to load the document.')
          setLoading(false)
        }
      }
    }

    tryLoad()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [isOpen, resolved])

  const pdfUrl = pdfSrc

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 overflow-y-auto bg-slate-950/90 backdrop-blur-sm"
      style={{ zIndex: 9999 }}
    >
      <div className="flex min-h-full items-center justify-center p-4 py-10">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl h-[85vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col"
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

          {/* Document Renderer */}
          {isImage ? (
            <img 
              src={pdfUrl} 
              alt={fileName || 'Document'} 
              className="max-w-full max-h-full object-contain p-4"
              onLoad={() => setLoading(false)}
            />
          ) : (
            <iframe
              ref={iframeRef}
              src={pdfUrl}
              className="w-full h-full border-0 bg-white"
              title="Document Viewer"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          )}
        </div>
      </motion.div>
      </div>
    </motion.div>
  )
}

export default PDFViewer
