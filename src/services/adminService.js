import { auth, db } from './firebase'
import { sendPasswordResetEmail } from 'firebase/auth'
import { generateTempPassword, getAllDoctors } from './authService'
import api from './api'
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
  if (!snap.exists()) return { id: hospitalId }
  return { id: snap.id, ...snap.data() }
}

export const updateHospitalProfile = async (hospitalId, data) => {
  const hospitalRef = doc(db, HOSPITALS_COLLECTION, hospitalId)
  const existingSnap = await getDoc(hospitalRef)
  const oldData = existingSnap.exists() ? existingSnap.data() : {}
  const currentStatus = oldData.verificationStatus

  let verificationStatus = currentStatus || 'pending'
  if (currentStatus === 'rejected' && (data.registrationCertificateUrl || data.hospitalLicenseUrl)) {
    verificationStatus = 'pending'
  }

  const newData = { ...oldData, ...data, verificationStatus }

  await setDoc(
    hospitalRef,
    { ...data, verificationStatus, updatedAt: serverTimestamp() },
    { merge: true }
  )
  
  const previouslyHadBoth = !!(oldData.registrationCertificateUrl && oldData.hospitalLicenseUrl)
  const nowHasBoth = !!(newData.registrationCertificateUrl && newData.hospitalLicenseUrl)
  
  const justCompletedUploads = nowHasBoth && !previouslyHadBoth
  const justReapplied = currentStatus === 'rejected' && verificationStatus === 'pending' && nowHasBoth

  if (justCompletedUploads || justReapplied) {
    try {
      // Fetch Super Admin from Firestore
      const adminQ = query(collection(db, USERS_COLLECTION), where('role', '==', 'superadmin'))
      const adminSnap = await getDocs(adminQ)
      let actualAdminEmail = import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'superadmin@docease.com'
      
      if (!adminSnap.empty) {
        const adminData = adminSnap.docs[0].data()
        actualAdminEmail = adminData.email || actualAdminEmail
        
        // Send in-app notification
        const { sendNotification } = await import('./notificationService')
        await sendNotification({
          recipientId: adminSnap.docs[0].id,
          type: 'hospital',
          title: 'New Hospital Verification',
          message: `${newData.name || 'A hospital'} submitted documents and is pending verification.`,
          link: '/super-admin/verification'
        })
      }

      // Send Email using Nodemailer
      await api.post('/emails/send', {
        action: 'sendHospitalSubmittedToSuperAdmin',
        payload: {
          adminEmail: actualAdminEmail,
          hospitalName: newData.name || 'New Hospital'
        }
      })
    } catch (err) {
      console.error('Failed to notify super admin:', err)
    }
  }

  return getHospitalProfile(hospitalId)
}

export const approveHospital = async (hospitalId) => {
  await updateDoc(doc(db, HOSPITALS_COLLECTION, hospitalId), {
    verificationStatus: 'verified',
    verifiedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  
  try {
    const snap = await getDoc(doc(db, HOSPITALS_COLLECTION, hospitalId))
    if (snap.exists()) {
      const data = snap.data()
      const adminDoc = await getDoc(doc(db, USERS_COLLECTION, hospitalId))
      const adminEmail = adminDoc.exists() ? adminDoc.data().email : data.email
      
      await api.post('/emails/send', {
        action: 'sendHospitalVerificationStatus',
        payload: { hospitalEmail: adminEmail, hospitalName: data.name, status: 'approved' }
      })
      const { sendNotification } = await import('./notificationService')
      await sendNotification({
        recipientId: hospitalId,
        type: 'hospital',
        title: 'Hospital Profile Approved',
        message: 'Your hospital profile has been successfully verified and approved by the Super Admin.',
        link: '/admin/dashboard'
      })
    }
  } catch (err) {
    console.error('Failed to send hospital approval email/notification', err)
  }
}

export const rejectHospital = async (hospitalId) => {
  await updateDoc(doc(db, HOSPITALS_COLLECTION, hospitalId), {
    verificationStatus: 'rejected',
    rejectedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  try {
    const snap = await getDoc(doc(db, HOSPITALS_COLLECTION, hospitalId))
    if (snap.exists()) {
      const data = snap.data()
      const adminDoc = await getDoc(doc(db, USERS_COLLECTION, hospitalId))
      const adminEmail = adminDoc.exists() ? adminDoc.data().email : data.email

      await api.post('/emails/send', {
        action: 'sendHospitalVerificationStatus',
        payload: { hospitalEmail: adminEmail, hospitalName: data.name, status: 'rejected' }
      })
      const { sendNotification } = await import('./notificationService')
      await sendNotification({
        recipientId: hospitalId,
        type: 'hospital',
        title: 'Hospital Profile Rejected',
        message: 'Your hospital profile verification was rejected. Please update your documents and reapply.',
        link: '/admin/hospital-profile'
      })
    }
  } catch (err) {
    console.error('Failed to send hospital rejection email/notification', err)
  }
}

export const getHospitalVerificationCounts = async () => {
  const hospitals = await getAllHospitals()
  return hospitals.reduce(
    (counts, hospital) => {
      const status = hospital.verificationStatus || 'pending'
      counts[status] = (counts[status] || 0) + 1
      counts.total += 1
      return counts
    },
    { verified: 0, pending: 0, rejected: 0, total: 0 }
  )
}

export const deleteHospital = async (hospitalId) => {
  const docsQ = query(collection(db, DOCTORS_COLLECTION), where('hospitalId', '==', hospitalId))
  const docsSnap = await getDocs(docsQ)
  for (const docSnap of docsSnap.docs) {
    await deleteDoctor(docSnap.id)
  }

  await deleteDoc(doc(db, HOSPITALS_COLLECTION, hospitalId))
}

export const updateDoctor = async (doctorId, updates) => {
  const payload = { ...updates, updatedAt: serverTimestamp() }
  if (updates.experience !== undefined) payload.experience = Number(updates.experience) || 0
  await updateDoc(doc(db, DOCTORS_COLLECTION, doctorId), payload)
}

export const deleteDoctor = async (doctorId) => {
  const apptsQ = query(collection(db, APPOINTMENTS_COLLECTION), where('doctorId', '==', doctorId))
  const apptsSnap = await getDocs(apptsQ)
  for (const docSnap of apptsSnap.docs) {
    await deleteDoc(docSnap.ref)
  }

  const leavesQ = query(collection(db, 'leaves'), where('doctorId', '==', doctorId))
  const leavesSnap = await getDocs(leavesQ)
  for (const docSnap of leavesSnap.docs) {
    await deleteDoc(docSnap.ref)
  }

  await deleteDoc(doc(db, DOCTORS_COLLECTION, doctorId))
}

export const toggleDoctorActive = async (doctorId, active) => {
  await updateDoc(doc(db, DOCTORS_COLLECTION, doctorId), {
    active,
    updatedAt: serverTimestamp(),
  })
}

export const resetDoctorPassword = async (doctorId) => {
  const doctorDocRef = doc(db, DOCTORS_COLLECTION, doctorId)
  const doctorDoc = await getDoc(doctorDocRef)
  if (!doctorDoc.exists()) throw new Error('Doctor not found')
  const email = doctorDoc.data().email

  await sendPasswordResetEmail(auth, email)

  await updateDoc(doctorDocRef, {
    passwordResetAt: serverTimestamp(),
    mustChangePassword: false,
  })
  return { success: true }
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

export const getPatientsByHospital = async (hospitalId) => {
  // Get appointments for this hospital and derive unique patient identifiers
  const appointments = await getAppointmentsByHospital(hospitalId)
  const patientUidSet = new Set()
  const patientEmailSet = new Set()
  const patientsFromAppts = {}

  appointments.forEach((appt) => {
    if (appt.patientId) patientUidSet.add(appt.patientId)
    if (appt.patientEmail) patientEmailSet.add(appt.patientEmail)
    const key = appt.patientId || appt.patientEmail || appt.patientName
    if (!patientsFromAppts[key]) {
      patientsFromAppts[key] = {
        id: appt.patientId || appt.patientEmail || key,
        name: appt.patientName || null,
        email: appt.patientEmail || null,
        createdAt: null,
        phone: '',
      }
    }
  })

  // Fetch known patient user documents and merge
  const allPatients = await getAllPatients()
  const matched = allPatients.filter((p) => patientUidSet.has(p.id) || patientEmailSet.has(p.email) || patientEmailSet.has(p.mail))

  // Build a map of matched patients by id/email
  const finalMap = {}
  matched.forEach((p) => {
    finalMap[p.id] = p
    if (p.email) finalMap[p.email] = p
    if (p.mail) finalMap[p.mail] = p
  })

  // Combine explicit users with derived ones from appointments
  const combinedKeys = new Set([...Object.keys(patientsFromAppts), ...matched.map((m) => m.id)])
  const result = []
  combinedKeys.forEach((k) => {
    const fromUser = finalMap[k]
    if (fromUser) result.push(fromUser)
    else if (patientsFromAppts[k]) result.push(patientsFromAppts[k])
  })

  return result
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
  
  const doctors = await getAllDoctors()
  const doctorIds = new Set(doctors.map((d) => d.id))
  
  const validList = list.filter((a) => doctorIds.has(a.doctorId) || doctorIds.has(a.doctorUid))
  
  return validList.sort((a, b) => {
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
