const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const HOSPITAL_DOCUMENT_TYPES = ['application/pdf']
const PATIENT_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']

const MAX_HOSPITAL_FILE_SIZE = 10 * 1024 * 1024
const MAX_PATIENT_FILE_SIZE = 20 * 1024 * 1024

const normalizeExtension = (fileName) => fileName.split('.').pop()?.toLowerCase() || ''

const getResourceType = (fileName) => {
  const extension = normalizeExtension(fileName)
  if (extension === 'pdf') return 'raw'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image'
  return 'raw'
}

const buildCloudinaryUploadUrl = (resourceType) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary configuration is missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env')
  }
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`
}

const isTypeAllowed = (file, allowedTypes) => {
  const extension = normalizeExtension(file.name)
  if (allowedTypes.includes(file.type)) return true
  if (allowedTypes.includes('application/pdf') && extension === 'pdf') return true
  if (allowedTypes.includes('image/jpeg') && ['jpg', 'jpeg'].includes(extension)) return true
  if (allowedTypes.includes('image/png') && extension === 'png') return true
  return false
}

export const validateCloudinaryFile = ({ file, allowedTypes, maxSize, label = 'File' }) => {
  if (!file) {
    return { valid: false, error: `${label} is required.` }
  }

  if (!isTypeAllowed(file, allowedTypes)) {
    const allowedList = allowedTypes.map((type) => {
      if (type === 'application/pdf') return 'PDF'
      if (type === 'image/jpeg') return 'JPG/JPEG'
      if (type === 'image/png') return 'PNG'
      return type
    }).join(', ')
    return { valid: false, error: `${label} must be one of: ${allowedList}.` }
  }

  if (maxSize && file.size > maxSize) {
    const sizeMb = Math.round(maxSize / 1024 / 1024)
    return { valid: false, error: `${label} must be smaller than ${sizeMb}MB.` }
  }

  return { valid: true, error: null }
}

export const uploadFileToCloudinary = ({ file, folder, onProgress }) => {
  return new Promise((resolve, reject) => {
    try {
      // Determine resource type based on file extension
      const resourceType = getResourceType(file.name)
      const uploadUrl = buildCloudinaryUploadUrl(resourceType)
      
      console.log('[Cloudinary Upload] Starting upload', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        resourceType,
        uploadEndpoint: uploadUrl,
        folder: folder || 'root',
      })

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
      formData.append('resource_type', resourceType)
      if (folder) {
        formData.append('folder', folder)
      }

      const xhr = new XMLHttpRequest()
      xhr.open('POST', uploadUrl, true)

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable || typeof onProgress !== 'function') return
        const progress = Math.round((event.loaded / event.total) * 100)
        onProgress(progress)
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            const secureUrl = response.secure_url

            console.log('[Cloudinary Upload] Success', {
              secureUrl,
              resourceType: response.resource_type,
              publicId: response.public_id,
              format: response.format,
            })

            resolve(response)
          } catch (parseErr) {
            console.error('[Cloudinary Upload] Response parse error', parseErr)
            reject(new Error('Failed to parse Cloudinary response.'))
          }
        } else {
          const errorMsg = xhr.responseText ? xhr.responseText : xhr.statusText
          console.error('[Cloudinary Upload] Failed', {
            status: xhr.status,
            statusText: xhr.statusText,
            error: errorMsg,
          })
          reject(new Error(`Cloudinary upload failed: ${errorMsg}`))
        }
      }

      xhr.onerror = () => {
        console.error('[Cloudinary Upload] Network error')
        reject(new Error('Unable to upload file to Cloudinary. Please check your network connection.'))
      }

      xhr.send(formData)
    } catch (err) {
      console.error('[Cloudinary Upload] Exception', err)
      reject(err)
    }
  })
}

export { HOSPITAL_DOCUMENT_TYPES, PATIENT_DOCUMENT_TYPES, MAX_HOSPITAL_FILE_SIZE, MAX_PATIENT_FILE_SIZE }
