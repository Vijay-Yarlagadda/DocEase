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

export const getAdminDashboardStats = async (hospitalId = null) => {
  const doctorsSnap = await getDocs(collection(db, DOCTORS_COLLECTION))
  const appointmentsSnap = await getDocs(collection(db, APPOINTMENTS_COLLECTION))
  const patientsSnap = await getDocs(query(collection(db, USERS_COLLECTION), where('role', '==', 'patient')))
  const hospitalsSnap = await getDocs(collection(db, HOSPITALS_COLLECTION))

  const allDoctors = doctorsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const allAppointments = appointmentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const today = toDateString()
  const filteredAppointments = hospitalId
    ? allAppointments.filter((appt) => {
        const doctor = allDoctors.find((d) => d.id === appt.doctorId || d.uid === appt.doctorId || d.id === appt.doctorUid)
        return doctor?.hospitalId === hospitalId
      })
    : allAppointments

  const totalPatients = hospitalId
    ? new Set(filteredAppointments.map((a) => a.patientEmail || a.patientId || a.patientName)).size
    : patientsSnap.size

  const todayCount = filteredAppointments.filter((a) => parseAppointmentDate(a) === today).length

  return {
    totalHospitals: hospitalsSnap.size,
    totalDoctors: hospitalId ? allDoctors.filter((d) => d.hospitalId === hospitalId).length : doctorsSnap.size,
    totalPatients,
    todayAppointments: todayCount,
    totalAppointments: filteredAppointments.length,
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
    mustChangePassword: true,
    firstLogin: true,
    passwordResetAt: serverTimestamp(),
  })
  return { tempPassword }
}

export const getAllPatients = async () => {
  const snap = await getDocs(query(collection(db, USERS_COLLECTION), where('role', '==', 'patient')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const getAllHospitals = async () => {
  const snap = await getDocs(collection(db, HOSPITALS_COLLECTION))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const getDoctorsByHospital = async (hospitalId) => {
  const snap = await getDocs(collection(db, DOCTORS_COLLECTION))
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((doctor) => doctor.hospitalId === hospitalId)
}

export const getAppointmentsByHospital = async (hospitalId) => {
  const doctors = await getDoctorsByHospital(hospitalId)
  const doctorIds = new Set(doctors.map((d) => d.id))
  const snap = await getDocs(collection(db, APPOINTMENTS_COLLECTION))
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter(
      (appt) =>
        doctorIds.has(appt.doctorId) ||
        doctorIds.has(appt.doctorUid)
    )
}

export const getHospitalsWithStats = async () => {
  const [hospitals, doctors, appointments] = await Promise.all([
    getAllHospitals(),
    getAllDoctors(),
    getAllAppointments(),
  ])

  return hospitals.map((hospital) => {
    const hospitalDoctors = doctors.filter((doctor) => doctor.hospitalId === hospital.id)
    const appointmentCount = appointments.filter((appt) =>
      hospitalDoctors.some(
        (doctor) => doctor.id === appt.doctorId || doctor.id === appt.doctorUid
      )
    ).length
    return {
      ...hospital,
      doctorCount: hospitalDoctors.length,
      appointmentCount,
    }
  })
}

export const getDoctorAppointmentStats = async (hospitalId = null) => {
  const doctors = await getAllDoctors()
  const appointments = await getAllAppointments()
  const filteredDoctors = hospitalId ? doctors.filter((d) => d.hospitalId === hospitalId) : doctors

  return filteredDoctors.map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    specialization: doctor.specialization,
    appointmentCount: appointments.filter(
      (appt) => appt.doctorId === doctor.id || appt.doctorUid === doctor.id
    ).length,
  }))
}

export const getMonthlyAppointmentTrends = async (rangeMonths = 6, hospitalId = null) => {
  const appointments = hospitalId ? await getAppointmentsByHospital(hospitalId) : await getAllAppointments()
  const now = new Date()
  const months = []

  for (let i = rangeMonths - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = date.toLocaleDateString('en-US', { month: 'short' })
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months.push({ label, key, count: 0 })
  }

  appointments.forEach((appt) => {
    const date = parseAppointmentDate(appt)
    if (!date) return
    const [year, month] = date.split('-')
    const key = `${year}-${month}`
    const bucket = months.find((m) => m.key === key)
    if (bucket) bucket.count += 1
  })

  return months
}

export const getPatientRegistrationTrends = async (rangeMonths = 6) => {
  const patients = await getAllPatients()
  const now = new Date()
  const months = []

  for (let i = rangeMonths - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = date.toLocaleDateString('en-US', { month: 'short' })
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months.push({ label, key, count: 0 })
  }

  patients.forEach((patient) => {
    const createdAt = patient.createdAt
    const date = createdAt?.toDate ? createdAt.toDate() : createdAt instanceof Date ? createdAt : null
    if (!date) return
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const bucket = months.find((m) => m.key === key)
    if (bucket) bucket.count += 1
  })

  return months
}

export const getHospitalPerformanceMetrics = async () => {
  const [hospitals, doctors, appointments] = await Promise.all([
    getAllHospitals(),
    getAllDoctors(),
    getAllAppointments(),
  ])

  return hospitals.map((hospital) => {
    const hospitalDoctors = doctors.filter((doctor) => doctor.hospitalId === hospital.id)
    const appointmentCount = appointments.filter((appt) =>
      hospitalDoctors.some((doctor) => doctor.id === appt.doctorId || doctor.id === appt.doctorUid)
    ).length
    const patientCount = new Set(
      appointments
        .filter((appt) => hospitalDoctors.some((doctor) => doctor.id === appt.doctorId || doctor.id === appt.doctorUid))
        .map((appt) => appt.patientEmail || appt.patientId || appt.patientName)
    ).size

    return {
      id: hospital.id,
      name: hospital.name,
      doctorCount: hospitalDoctors.length,
      appointmentCount,
      patientCount,
      contact: hospital.phone || hospital.email || '',
    }
  })
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
