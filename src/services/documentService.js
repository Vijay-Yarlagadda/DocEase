import { db } from './firebase'
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore'
import api from './api'

const DOCUMENTS_COLLECTION = 'documents'

export const createPatientDocument = async ({ appointmentId, patientUid, patientName, patientEmail, doctorId, hospitalId, fileName, fileUrl, mimeType, uploadedByRole = 'patient' }) => {
  const documentRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), {
    appointmentId,
    patientUid,
    patientName,
    patientEmail,
    doctorId,
    hospitalId,
    fileName,
    fileUrl,
    mimeType,
    uploadedByRole,
    uploadedAt: serverTimestamp(),
  })

  try {
    if (doctorId) {
      const doctorDoc = await getDoc(doc(db, 'doctors', doctorId))
      if (doctorDoc.exists()) {
        const doctorData = doctorDoc.data()
        await api.post('/emails/send', {
          action: 'sendDocumentUploadNotification',
          payload: {
            doctorEmail: doctorData.email,
            doctorName: doctorData.name,
            patientName: patientName || 'A Patient'
          }
        })
      }
      
      const { sendNotification } = await import('./notificationService')
      await sendNotification({
        recipientId: doctorId,
        title: 'New Document Uploaded',
        message: `${patientName || 'A Patient'} has uploaded a new document.`,
        type: 'document',
        link: '/doctor/records'
      })
    }
  } catch (err) {
    console.error('Failed to send document upload email/notification:', err)
  }

  return documentRef.id
}

export const getPatientDocuments = async (patientUid) => {
  const q = query(collection(db, DOCUMENTS_COLLECTION), where('patientUid', '==', patientUid))
  const snap = await getDocs(q)
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const getDocumentsForAppointment = async (appointmentId, user = null) => {
  if (!appointmentId) return []
  
  let constraints = [where('appointmentId', '==', appointmentId)]
  
  if (user) {
    if (user.role === 'patient') {
      constraints.push(where('patientUid', '==', user.uid || user.id))
    } else if (user.role === 'doctor') {
      constraints.push(where('doctorId', '==', user.uid || user.id))
    }
  }

  const q = query(collection(db, DOCUMENTS_COLLECTION), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const getDocumentsForDoctor = async (doctorId) => {
  if (!doctorId) return []
  const q = query(collection(db, DOCUMENTS_COLLECTION), where('doctorId', '==', doctorId))
  const snap = await getDocs(q)
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const deletePatientDocument = async (documentId) => {
  await deleteDoc(doc(db, DOCUMENTS_COLLECTION, documentId))
}
