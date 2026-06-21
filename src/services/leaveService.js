import { db } from './firebase'
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore'
import { formatDoctorName } from '../utils/userProfile'
import api from './api'

const LEAVES_COLLECTION = 'leaves'

export const addLeave = async (doctorId, date, reason) => {
  const leaveRef = await addDoc(collection(db, LEAVES_COLLECTION), {
    doctorId,
    date,
    reason,
    createdAt: new Date().toISOString()
  })

  try {
    // Fetch doctor to get name and hospitalId
    const doctorDoc = await getDoc(doc(db, 'doctors', doctorId))
    if (doctorDoc.exists()) {
      const doctorData = doctorDoc.data()
      const hospitalId = doctorData.hospitalId
      const doctorName = doctorData.name || doctorData.firstName

      if (hospitalId) {
        // Fetch the admin for this hospital
        const q = query(
          collection(db, 'users'), 
          where('role', '==', 'admin'),
          where('hospitalId', '==', hospitalId)
        )
        const adminSnap = await getDocs(q)
        if (!adminSnap.empty) {
          const adminDoc = adminSnap.docs[0]
          const adminData = adminDoc.data()
          if (adminData.email) {
            await api.post('/emails/send', {
              action: 'sendDoctorLeaveToAdmin',
              payload: {
                adminEmail: adminData.email,
                adminName: adminData.name || adminData.firstName || 'Hospital Admin',
                doctorName,
                leaveDate: date,
                reason: reason || 'Personal Leave'
              }
            })
          }
          
          const { sendNotification } = await import('./notificationService')
          await sendNotification({
            recipientId: adminDoc.id,
            title: 'Doctor Leave Scheduled',
            message: `${formatDoctorName(doctorName)} scheduled a leave on ${date}.`,
            type: 'doctor',
            link: '/admin/doctors'
          })
        }
      }
    }
  } catch (error) {
    console.error('Failed to send leave notification email:', error)
  }

  return leaveRef.id
}

export const getDoctorLeaves = async (doctorId) => {
  if (!doctorId) return []
  const q = query(collection(db, LEAVES_COLLECTION), where('doctorId', '==', doctorId))
  const snap = await getDocs(q)
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const checkDoctorLeaveOnDate = async (doctorId, date) => {
  if (!doctorId || !date) return false
  const q = query(
    collection(db, LEAVES_COLLECTION), 
    where('doctorId', '==', doctorId),
    where('date', '==', date)
  )
  const snap = await getDocs(q)
  return !snap.empty
}

export const deleteLeave = async (leaveId) => {
  if (!leaveId) return
  await deleteDoc(doc(db, LEAVES_COLLECTION, leaveId))
}
