export const normalizeCloudinaryUrl = (url) => {
  if (!url) return ''

  // If an object is passed (some upload responses), attempt common fields
  if (typeof url === 'object') {
    if (url.secure_url) return String(url.secure_url)
    if (url.url) return String(url.url)
    if (url.path) return String(url.path)
    // fallback to JSON string to help debugging
    return String(url)
  }

  try {
    return new URL(String(url)).href
  } catch {
    const s = String(url)
    // If it looks like a filename or a Cloudinary public id (no slashes), try building a Cloudinary raw URL when cloud name is configured
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const looksLikeFilename = s.includes('.') && !s.includes('/')
    const looksLikePublicId = !s.includes('/') && !s.startsWith('http') && !s.includes('.')
    if (cloudName && (looksLikeFilename || looksLikePublicId)) {
      // Prefer raw resource type for PDFs
      return `https://res.cloudinary.com/${cloudName}/raw/upload/${s}`
    }
    return s.startsWith('http') ? s : `https://${s}`
  }
}

export const getHospitalDocuments = (hospital) => {
  const metadata = hospital.hospitalDocuments || []
  const sourceDocs = [
    { id: 'registrationCertificateUrl', label: 'Registration Certificate', url: hospital.registrationCertificateUrl },
    { id: 'hospitalLicenseUrl', label: 'Hospital License', url: hospital.hospitalLicenseUrl },
  ]

  const baseDocs = sourceDocs
    .filter((doc) => doc.url)
    .map((doc) => {
      const meta = metadata.find((item) => item.id === doc.id) || {}
      return {
        id: doc.id,
        title: doc.label,
        url: normalizeCloudinaryUrl(meta.url || doc.url),
        name: meta.name || `${doc.label}.pdf`,
        uploadedAt: meta.uploadedAt || hospital.updatedAt || hospital.createdAt || null,
        mimeType: meta.type || 'application/pdf',
      }
    })

  const extraDocs = metadata
    .filter((item) => !['registrationCertificateUrl', 'hospitalLicenseUrl'].includes(item.id))
    .map((item) => ({
      ...item,
      url: normalizeCloudinaryUrl(item.url),
      name: item.name || 'Document',
      uploadedAt: item.uploadedAt || hospital.updatedAt || hospital.createdAt || null,
    }))

  return [...baseDocs, ...extraDocs]
}

export const getHospitalDocCount = (hospital) => {
  if (Array.isArray(hospital.documents) && hospital.documents.length > 0) return hospital.documents.length
  return (hospital.registrationCertificateUrl ? 1 : 0) + (hospital.hospitalLicenseUrl ? 1 : 0)
}

export const formatDate = (value) => {
  if (!value) return 'Unknown upload time'
  const date = value?.toDate ? value.toDate() : new Date(value)
  return !isNaN(date) ? date.toLocaleString() : 'Unknown upload time'
}

export default {
  normalizeCloudinaryUrl,
  getHospitalDocuments,
  getHospitalDocCount,
  formatDate,
}
