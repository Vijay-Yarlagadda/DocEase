import { db } from './firebase'
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'

const DOCUMENTS_COLLECTION = 'documents'

export const createPatientDocument = async ({ appointmentId, patientUid, patientName, patientEmail, doctorId, hospitalId, fileName, fileUrl, mimeType }) => {
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
    uploadedAt: serverTimestamp(),
  })
  return documentRef.id
}

export const getPatientDocuments = async (patientUid) => {
  const q = query(collection(db, DOCUMENTS_COLLECTION), where('patientUid', '==', patientUid))
  const snap = await getDocs(q)
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const getDocumentsForAppointment = async (appointmentId) => {
  if (!appointmentId) return []
  const q = query(collection(db, DOCUMENTS_COLLECTION), where('appointmentId', '==', appointmentId))
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
