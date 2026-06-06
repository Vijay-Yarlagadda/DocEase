import { db } from './firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

const APPOINTMENTS_COLLECTION = 'appointments'

export const getDoctorAppointments = async (doctorId, doctorEmail) => {
  const snap = await getDocs(collection(db, APPOINTMENTS_COLLECTION))
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

  return all.filter(
    (a) =>
      a.doctorId === doctorId ||
      a.doctorUid === doctorId ||
      (doctorEmail && a.doctorEmail === doctorEmail)
  )
}

export const getDoctorUpcomingAppointments = async (doctorId, doctorEmail) => {
  const today = new Date().toISOString().split('T')[0]
  const all = await getDoctorAppointments(doctorId, doctorEmail)
  return all.filter((a) => {
    const date = typeof a.date === 'string' ? a.date : ''
    return date >= today && !['cancelled', 'completed'].includes(a.status)
  })
}
