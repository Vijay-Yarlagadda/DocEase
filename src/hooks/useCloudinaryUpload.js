import { useState, useCallback } from 'react'
import { uploadFileToCloudinary, validateCloudinaryFile } from '../services/cloudinaryService'

export const useCloudinaryUpload = ({ allowedTypes, maxSize, folder }) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const upload = useCallback(
    async (file) => {
      setError(null)
      const validation = validateCloudinaryFile({ file, allowedTypes, maxSize })
      if (!validation.valid) {
        setError(validation.error)
        throw new Error(validation.error)
      }

      setUploading(true)
      setProgress(0)

      try {
        const response = await uploadFileToCloudinary({ file, folder, onProgress: setProgress })
        return response
      } finally {
        setUploading(false)
      }
    },
    [allowedTypes, maxSize, folder]
  )

  return { upload, uploading, progress, error, setError }
}
