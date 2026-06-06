import { db } from './firebase'
import { generateTempPassword, getAllDoctors } from './authService'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'

const USERS_COLLECTION = import.meta.env.VITE_FIRESTORE_USERS_COLLECTION || 'users'
const DOCTORS_COLLECTION = 'doctors'
const HOSPITALS_COLLECTION = 'hospitals'
const APPOINTMENTS_COLLECTION = 'appointments'

const DEFAULT_HOSPITAL = {
  name: 'DocEase General Hospital',
  address: '123 Healthcare Avenue, Medical District',
  phone: '+1 (555) 123-4567',
  email: 'contact@docease.com',
  website: 'www.docease.com',
  description: 'Leading healthcare facility providing comprehensive medical services.',
}

const toDateString = (date = new Date()) => date.toISOString().split('T')[0]

const parseAppointmentDate = (appt) => {
  const raw = appt.date
  if (!raw) return null
  if (typeof raw === 'string') return raw
  if (raw instanceof Timestamp) return raw.toDate().toISOString().split('T')[0]
  if (raw?.toDate) return raw.toDate().toISOString().split('T')[0]
  return null
}

export const getAdminDashboardStats = async () => {
  const [doctorsSnap, patientsSnap, appointmentsSnap] = await Promise.all([
    getDocs(collection(db, DOCTORS_COLLECTION)),
    getDocs(query(collection(db, USERS_COLLECTION), where('role', '==', 'patient'))),
    getDocs(collection(db, APPOINTMENTS_COLLECTION)),
  ])

  const today = toDateString()
  const appointments = appointmentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const todayCount = appointments.filter((a) => parseAppointmentDate(a) === today).length

  return {
    totalDoctors: doctorsSnap.size,
    totalPatients: patientsSnap.size,
    todayAppointments: todayCount,
    totalAppointments: appointmentsSnap.size,
  }
}

export const getHospitalProfile = async (hospitalId = 'default') => {
  const snap = await getDoc(doc(db, HOSPITALS_COLLECTION, hospitalId))
  if (!snap.exists()) return { id: hospitalId, ...DEFAULT_HOSPITAL }
  return { id: snap.id, ...snap.data() }
}

export const updateHospitalProfile = async (hospitalId, data) => {
  await setDoc(
    doc(db, HOSPITALS_COLLECTION, hospitalId),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  )
  return getHospitalProfile(hospitalId)
}

export const updateDoctor = async (doctorId, updates) => {
  const payload = { ...updates, updatedAt: serverTimestamp() }
  if (updates.experience !== undefined) payload.experience = Number(updates.experience) || 0
  await updateDoc(doc(db, DOCTORS_COLLECTION, doctorId), payload)
}

export const deleteDoctor = async (doctorId) => {
  await deleteDoc(doc(db, DOCTORS_COLLECTION, doctorId))
}

export const toggleDoctorActive = async (doctorId, active) => {
  await updateDoc(doc(db, DOCTORS_COLLECTION, doctorId), {
    active,
    updatedAt: serverTimestamp(),
  })
}

export const resetDoctorPassword = async (doctorId) => {
  const tempPassword = generateTempPassword(12)
  await updateDoc(doc(db, DOCTORS_COLLECTION, doctorId), {
    tempPasswordReset: tempPassword,
    firstLogin: true,
    passwordResetAt: serverTimestamp(),
  })
  return { tempPassword }
}

export const getAllPatients = async () => {
  const snap = await getDocs(query(collection(db, USERS_COLLECTION), where('role', '==', 'patient')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const getAllAppointments = async () => {
  const snap = await getDocs(collection(db, APPOINTMENTS_COLLECTION))
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return list.sort((a, b) => {
    const da = parseAppointmentDate(a) || ''
    const db_ = parseAppointmentDate(b) || ''
    return db_.localeCompare(da)
  })
}

export const getUpcomingAppointments = async () => {
  const today = toDateString()
  const all = await getAllAppointments()
  return all.filter((a) => {
    const d = parseAppointmentDate(a)
    return d && d >= today && a.status !== 'cancelled' && a.status !== 'completed'
  })
}

export const getAppointmentStats = async () => {
  const all = await getAllAppointments()
  const today = toDateString()
  return {
    total: all.length,
    today: all.filter((a) => parseAppointmentDate(a) === today).length,
    upcoming: all.filter((a) => {
      const d = parseAppointmentDate(a)
      return d && d >= today && !['cancelled', 'completed'].includes(a.status)
    }).length,
    pending: all.filter((a) => a.status === 'pending').length,
    confirmed: all.filter((a) => a.status === 'confirmed').length,
    completed: all.filter((a) => a.status === 'completed').length,
    cancelled: all.filter((a) => a.status === 'cancelled').length,
  }
}

export const getWeeklyAppointmentData = async () => {
  const all = await getAllAppointments()
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = toDateString(d)
    const label = d.toLocaleDateString('en-US', { weekday: 'short' })
    days.push({
      label,
      count: all.filter((a) => parseAppointmentDate(a) === key).length,
    })
  }
  return days
}

export const getAdminNotifications = async () => {
  const [doctors, appointments] = await Promise.all([getAllDoctors(), getAllAppointments()])

  const notifications = []

  doctors
    .filter((d) => d.createdAt)
    .slice(-5)
    .reverse()
    .forEach((d) => {
      notifications.push({
        id: `doctor-${d.id}`,
        type: 'doctor',
        title: 'New Doctor Added',
        message: `${d.name} joined as ${d.specialization || 'General Physician'}`,
        time: 'Recently',
      })
    })

  appointments
    .filter((a) => a.status === 'pending')
    .slice(0, 5)
    .forEach((a) => {
      notifications.push({
        id: `appt-${a.id}`,
        type: 'appointment',
        title: 'New Appointment Request',
        message: `${a.patientName || 'Patient'} requested appointment with ${a.doctorName || 'Doctor'}`,
        time: a.date || 'Pending',
      })
    })

  if (notifications.length === 0) {
    notifications.push({
      id: 'system-1',
      type: 'system',
      title: 'System Ready',
      message: 'DocEase admin panel is running smoothly.',
      time: 'Now',
    })
  }

  return notifications.slice(0, 8)
}

export { getAllDoctors }
