#!/usr/bin/env node
/**
 * Reconcile Firebase Auth users and Firestore user documents
 * - Creates Firestore docs for Auth users if missing
 * - Optionally deletes orphan Firestore docs (no matching Auth user)
 *
 * Usage:
 *   node scripts/reconcileFirestoreUsers.js [--delete-orphans]
 */

import fs from 'fs'
import path from 'path'
import admin from 'firebase-admin'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
if (!keyPath) {
  console.error('FIREBASE_SERVICE_ACCOUNT_PATH not set in backend/.env')
  process.exit(1)
}

const absKey = path.isAbsolute(keyPath) ? keyPath : path.join(process.cwd(), keyPath)
if (!fs.existsSync(absKey)) {
  console.error('Service account file not found at', absKey)
  process.exit(1)
}

const serviceAccount = JSON.parse(fs.readFileSync(absKey, 'utf8'))
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const db = admin.firestore()
const USERS_COLLECTION = process.env.FIRESTORE_USERS_COLLECTION || 'users'
const deleteOrphans = process.argv.includes('--delete-orphans')

async function listAllAuthUids() {
  const uids = new Set()
  let nextPageToken
  do {
    const res = await admin.auth().listUsers(1000, nextPageToken)
    res.users.forEach(u => uids.add(u.uid))
    nextPageToken = res.pageToken
  } while (nextPageToken)
  return uids
}

async function reconcile() {
  console.log('USERS_COLLECTION=', USERS_COLLECTION)
  const authUids = await listAllAuthUids()
  console.log('Found', authUids.size, 'auth users')

  // Ensure docs for auth users
  for (const uid of authUids) {
    const docRef = db.collection(USERS_COLLECTION).doc(uid)
    const snap = await docRef.get()
    if (!snap.exists) {
      let usr
      try { usr = await admin.auth().getUser(uid) } catch (e) { usr = null }
      const payload = {
        fullName: (usr && usr.displayName) || '',
        email: (usr && usr.email) || '',
        phone: (usr && usr.phoneNumber) || '',
        role: 'patient',
        uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }
      await docRef.set(payload)
      console.log('Created doc for', uid, payload.email)
    } else {
      // Ensure uid present
      const data = snap.data() || {}
      const updates = {}
      if (!data.uid) updates.uid = uid
      if (!data.email) {
        try { updates.email = (await admin.auth().getUser(uid)).email } catch (e) {}
      }
      if (Object.keys(updates).length) {
        await docRef.update(updates)
        console.log('Updated doc for', uid)
      }
    }
  }

  // Find orphans
  const orphanDocs = []
  const snapshot = await db.collection(USERS_COLLECTION).get()
  snapshot.forEach(doc => {
    if (!authUids.has(doc.id)) orphanDocs.push({ id: doc.id, data: doc.data() })
  })
  console.log('Orphan docs found:', orphanDocs.length)
  orphanDocs.forEach(d => console.log(' -', d.id, d.data?.email))

  if (deleteOrphans && orphanDocs.length) {
    console.log('Deleting orphan docs...')
    for (const d of orphanDocs) {
      await db.collection(USERS_COLLECTION).doc(d.id).delete()
      console.log('Deleted orphan doc', d.id)
    }
  }
}

reconcile().then(() => { console.log('Reconcile complete'); process.exit(0) }).catch(err => { console.error(err); process.exit(1) })
