import { collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export const generateReport = async (reportData) => {
  try {
    const reportRef = await addDoc(collection(db, 'reports'), {
      ...reportData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return reportRef.id
  } catch (error) {
    console.error('Error generating report:', error)
    throw error
  }
}

export const getReportForAppointment = async (appointmentId) => {
  try {
    const q = query(
      collection(db, 'reports'),
      where('appointmentId', '==', appointmentId)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
  } catch (error) {
    console.error('Error fetching report:', error)
    throw error
  }
}

export const getReportsForPatient = async (patientId) => {
  try {
    const q = query(
      collection(db, 'reports'),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error fetching reports for patient:', error)
    throw error
  }
}
