import { db } from './firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

const HOSPITALS_COLLECTION = 'hospitals'
const DOCTORS_COLLECTION = 'doctors'

export const getVerifiedHospitals = async () => {
  const q = query(collection(db, HOSPITALS_COLLECTION), where('verificationStatus', '==', 'verified'))
  const snap = await getDocs(q)
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const getDoctorsByHospital = async (hospitalId) => {
  if (!hospitalId) return []
  const q = query(collection(db, DOCTORS_COLLECTION), where('hospitalId', '==', hospitalId))
  const snap = await getDocs(q)
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const searchDoctors = async (searchQuery) => {
  const q = query(collection(db, DOCTORS_COLLECTION))
  const snap = await getDocs(q)
  const doctors = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  
  if (!searchQuery) return doctors
  
  const lowerQuery = searchQuery.toLowerCase()
  return doctors.filter(doctor => 
    doctor.name?.toLowerCase().includes(lowerQuery) || 
    doctor.specialization?.toLowerCase().includes(lowerQuery) ||
    doctor.email?.toLowerCase().includes(lowerQuery)
  )
}
