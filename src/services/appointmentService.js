import { db } from './firebase'
import { collection, addDoc, query, where, getDocs, updateDoc, doc, getDoc, serverTimestamp, deleteDoc, onSnapshot } from 'firebase/firestore'
import api from './api'

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

  try {
    const { sendNotification } = await import('./notificationService')
    await sendNotification({
      recipientId: doctorId,
      title: 'New Appointment Request',
      message: `${patientName} has requested an appointment on ${appointmentDate} at ${appointmentTime}.`,
      type: 'appointment',
      link: `/doctor/appointments/${appointmentRef.id}`
    })
  } catch (err) {
    console.error('Failed to send notification:', err)
  }

  try {
    const doctorDoc = await getDoc(doc(db, 'doctors', doctorId))
    if (doctorDoc.exists()) {
      const doctorData = doctorDoc.data()
      await api.post('/emails/send', {
        action: 'sendAppointmentBookedToDoctor',
        payload: {
          doctorEmail: doctorData.email,
          patientName,
          date: appointmentDate,
          time: appointmentTime
        }
      })
    }
  } catch (err) {
    console.error('Failed to trigger email:', err)
  }

  return appointmentRef.id
}

export const getPatientAppointments = async (patientUid) => {
  if (!patientUid) return []
  const q = query(collection(db, APPOINTMENTS_COLLECTION), where('patientId', '==', patientUid))
  const snap = await getDocs(q)
  const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  
  // Filter out appointments where the doctor has been deleted
  const doctorsSnap = await getDocs(collection(db, 'doctors'))
  const doctorIds = new Set(doctorsSnap.docs.map(d => d.id))
  
  return list.filter(a => doctorIds.has(a.doctorId) || doctorIds.has(a.doctorUid))
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

  try {
    const aptSnap = await getDoc(appointmentRef)
    if (aptSnap.exists()) {
      const aptData = aptSnap.data()
      
      let doctorEmail = null
      let patientEmail = aptData.patientEmail || null // Use if saved directly

      // Fetch doctor email
      try {
        const doctorDoc = await getDoc(doc(db, 'doctors', aptData.doctorId))
        if (doctorDoc.exists()) doctorEmail = doctorDoc.data().email
      } catch (err) {
        console.warn('Could not fetch doctor doc for email', err)
      }

      // Fetch patient email if not directly saved
      if (!patientEmail) {
        try {
          const patientDoc = await getDoc(doc(db, 'users', aptData.patientId))
          if (patientDoc.exists()) patientEmail = patientDoc.data().email || patientDoc.data().mail
        } catch (err) {
          console.warn('Could not fetch patient doc for email', err)
        }
      }

      const { sendNotification } = await import('./notificationService')
      
      if (newStatus === 'approved' || newStatus === 'rejected') {
        if (patientEmail) {
          try {
            await api.post('/emails/send', {
              action: 'sendAppointmentStatusToPatient',
              payload: {
                patientEmail,
                patientName: aptData.patientName,
                doctorName: aptData.doctorName,
                date: aptData.appointmentDate,
                time: aptData.appointmentTime,
                status: newStatus
              }
            })
          } catch (emailErr) {
            console.error('Failed to send status email to patient:', emailErr)
          }
        }
        if (aptData.patientId) {
          try {
            await sendNotification({
              recipientId: aptData.patientId,
              title: `Appointment ${newStatus === 'approved' ? 'Approved' : 'Rejected'}`,
              message: `Your appointment with ${aptData.doctorName} on ${aptData.appointmentDate} at ${aptData.appointmentTime} has been ${newStatus}.`,
              type: 'appointment'
            })
          } catch (notifErr) {
            console.error('Failed to send status notification to patient:', notifErr)
          }
        }
      } else if (newStatus === 'cancelled') {
        if (doctorEmail) {
          try {
            await api.post('/emails/send', {
              action: 'sendAppointmentCancelled',
              payload: { email: doctorEmail, oppositeName: aptData.patientName, date: aptData.appointmentDate, time: aptData.appointmentTime }
            })
          } catch (err) { console.error(err) }
        }
        if (patientEmail) {
          try {
            await api.post('/emails/send', {
              action: 'sendAppointmentCancelled',
              payload: { email: patientEmail, oppositeName: aptData.doctorName, date: aptData.appointmentDate, time: aptData.appointmentTime }
            })
          } catch (err) { console.error(err) }
        }
        
        try {
          await sendNotification({
            recipientId: aptData.doctorId || aptData.doctorUid,
            title: 'Appointment Cancelled',
            message: `Appointment with ${aptData.patientName} on ${aptData.appointmentDate} at ${aptData.appointmentTime} was cancelled.`,
            type: 'appointment'
          })
        } catch (err) { console.error(err) }

        if (aptData.patientId) {
          try {
            await sendNotification({
              recipientId: aptData.patientId,
              title: 'Appointment Cancelled',
              message: `Your appointment with ${aptData.doctorName} on ${aptData.appointmentDate} at ${aptData.appointmentTime} was cancelled.`,
              type: 'appointment'
            })
          } catch (err) { console.error(err) }
        }
      }
    }
  } catch (err) {
    console.error('Failed to process appointment status update Side Effects:', err)
  }
}

export const getDoctorAppointmentsByDate = async (doctorId, date) => {
  if (!doctorId || !date) return []
  const q = query(
    collection(db, APPOINTMENTS_COLLECTION),
    where('doctorId', '==', doctorId),
    where('appointmentDate', '==', date)
  )
  const snap = await getDocs(q)
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const deleteAppointment = async (appointmentId) => {
  if (!appointmentId) return
  await deleteDoc(doc(db, APPOINTMENTS_COLLECTION, appointmentId))
}

export const notifyPatientPrescriptionUploaded = async (patientId, doctorName) => {
  try {
    const patientDoc = await getDoc(doc(db, 'users', patientId))
    if (patientDoc.exists()) {
      const patientData = patientDoc.data()
      if (patientData.email) {
        await api.post('/emails/send', {
          action: 'sendPrescriptionUploadedToPatient',
          payload: {
            patientEmail: patientData.email,
            patientName: patientData.name || patientData.firstName,
            doctorName
          }
        })
      }
      
      const { sendNotification } = await import('./notificationService')
      await sendNotification({
        recipientId: patientId,
        title: 'Prescription Uploaded',
        message: `${doctorName} has uploaded a prescription for your recent appointment.`,
        type: 'document',
        link: '/patient/documents'
      })
    }
  } catch (error) {
    console.error('Failed to send prescription uploaded email/notification:', error)
  }
}

export const subscribeToDoctorAppointmentsByDate = (doctorId, date, callback, onError) => {
  if (!doctorId || !date) {
    callback([])
    return () => {}
  }
  const q = query(
    collection(db, APPOINTMENTS_COLLECTION),
    where('doctorId', '==', doctorId),
    where('appointmentDate', '==', date)
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  }, (err) => {
    console.error('Appointment subscription error:', err)
    if (onError) onError(err)
  })
}
