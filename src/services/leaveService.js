import { db } from './firebase'
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, getDoc, onSnapshot } from 'firebase/firestore'
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
        // The admin's document ID in the 'users' collection is the hospitalId
        const adminDoc = await getDoc(doc(db, 'users', hospitalId))
        if (adminDoc.exists() && adminDoc.data().role === 'admin') {
          const adminData = adminDoc.data()
          if (adminData.email) {
            try {
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
            } catch (emailErr) {
              console.error('Failed to send leave email to admin:', emailErr)
            }
          }
          
          try {
            const { sendNotification } = await import('./notificationService')
            await sendNotification({
              recipientId: adminDoc.id,
              title: 'Doctor Leave Scheduled',
              message: `${formatDoctorName(doctorName)} scheduled a leave on ${date}.`,
              type: 'doctor',
              link: '/admin/doctors'
            })
          } catch (notifErr) {
            console.error('Failed to send leave in-app notification:', notifErr)
          }
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

export const subscribeToDoctorLeaveOnDate = (doctorId, date, callback) => {
  if (!doctorId || !date) {
    callback(false)
    return () => {}
  }
  const q = query(
    collection(db, LEAVES_COLLECTION), 
    where('doctorId', '==', doctorId),
    where('date', '==', date)
  )
  return onSnapshot(q, (snap) => {
    callback(!snap.empty)
  })
}