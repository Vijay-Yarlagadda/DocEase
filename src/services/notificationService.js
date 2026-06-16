import { collection, addDoc, getDocs, updateDoc, doc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export const sendNotification = async (notificationData) => {
  try {
    const notifRef = await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp()
    })
    return notifRef.id
  } catch (error) {
    console.error('Error sending notification:', error)
    throw error
  }
}

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notifRef = doc(db, 'notifications', notificationId)
    await updateDoc(notifRef, { read: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

export const subscribeToNotifications = (userId, callback) => {
  if (!userId) return () => {}
  const q = query(
    collection(db, 'notifications'),
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(notifications)
  }, (error) => {
    console.error('Error in notification subscription:', error)
  })
}
