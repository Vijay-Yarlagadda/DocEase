import { db } from './firebase'
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'

const DOCUMENTS_COLLECTION = 'documents'

export const createPatientDocument = async ({ patientUid, patientName, patientEmail, fileName, fileUrl, mimeType }) => {
  const documentRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), {
    patientUid,
    patientName,
    patientEmail,
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

export const getAllPatientDocuments = async () => {
  const snap = await getDocs(collection(db, DOCUMENTS_COLLECTION))
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const deletePatientDocument = async (documentId) => {
  await deleteDoc(doc(db, DOCUMENTS_COLLECTION, documentId))
}
