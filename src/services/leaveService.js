import { db } from './firebase'
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'

const LEAVES_COLLECTION = 'leaves'

export const addLeave = async (doctorId, date, reason) => {
  const leaveRef = await addDoc(collection(db, LEAVES_COLLECTION), {
    doctorId,
    date,
    reason,
    createdAt: new Date().toISOString()
  })
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
