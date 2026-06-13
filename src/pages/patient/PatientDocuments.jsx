import { useEffect, useState, useContext, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Archive } from 'lucide-react'
import { AuthContext } from '../../context/AuthContext'
import { getPatientDocuments } from '../../services/documentService'
import FilePreviewModal from '../../components/FilePreviewModal'
import { useToast } from '../../components/Toast'

const PatientDocuments = () => {
  const { user } = useContext(AuthContext)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [previewDocument, setPreviewDocument] = useState(null)
  const { showError } = useToast()

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const docs = await getPatientDocuments(user?.uid)
      setDocuments(docs)
    } catch (err) {
      showError(err.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    fetchDocuments()
  }, [user])

  const documentCountText = useMemo(() => {
    if (documents.length === 0) return 'No documents found.'
    return `${documents.length} ${documents.length === 1 ? 'document' : 'documents'} found`
  }, [documents.length])

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="dashboard-card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Medical Records Vault</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">View all your uploaded medical reports, prescriptions, and imaging files.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-slate-50 px-4 py-2 text-sm text-slate-600 dark:border-slate-700/50 dark:bg-slate-800/60 dark:text-slate-300">
            <Archive className="w-4 h-4" />
            {documentCountText}
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="dashboard-card">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="h-24 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300/70 bg-slate-50 p-10 text-center text-slate-500 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-400">
            You haven't uploaded any medical documents yet. Go to an Appointment to upload documents.
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <motion.div key={doc.id} whileHover={{ y: -2 }} className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900 dark:text-white">{doc.fileName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Uploaded {new Date(doc.uploadedAt?.toDate ? doc.uploadedAt.toDate() : doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm">
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <FilePreviewModal document={previewDocument} onClose={() => setPreviewDocument(null)} />
    </div>
  )
}

export default PatientDocuments
