import { db } from './firebase'
import { collection, addDoc, query, where, getDocs, updateDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore'

const APPOINTMENTS_COLLECTION = 'appointments'

export const bookAppointment = async ({ patientId, patientName, doctorId, doctorName, hospitalId, hospitalName, appointmentDate, appointmentTime }) => {
  const appointmentRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), {
    patientId,
    patientName,
    doctorId,
    doctorName,
    hospitalId,
    hospitalName,
    appointmentDate,
    appointmentTime,
    status: 'pending', // Doctors must approve this before documents can be uploaded
    createdAt: serverTimestamp(),
  })
  return appointmentRef.id
}

export const getPatientAppointments = async (patientId) => {
  if (!patientId) return []
  const q = query(collection(db, APPOINTMENTS_COLLECTION), where('patientId', '==', patientId))
  const snap = await getDocs(q)
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const getAppointmentById = async (appointmentId) => {
  if (!appointmentId) return null
  const snap = await getDoc(doc(db, APPOINTMENTS_COLLECTION, appointmentId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const getDoctorAppointments = async (doctorId) => {
  if (!doctorId) return []
  const q = query(collection(db, APPOINTMENTS_COLLECTION), where('doctorId', '==', doctorId))
  const snap = await getDocs(q)
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const updateAppointmentStatus = async (appointmentId, newStatus) => {
  const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId)
  await updateDoc(appointmentRef, { status: newStatus })
}
