import { db } from './src/services/firebase.js';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';

async function run() {
  try {
    const doctorsSnap = await getDocs(collection(db, 'doctors'));
    const doctorIds = new Set(doctorsSnap.docs.map(d => d.id));
    
    const apptsSnap = await getDocs(collection(db, 'appointments'));
    let deletedCount = 0;
    
    for (const appt of apptsSnap.docs) {
      const data = appt.data();
      const docId = data.doctorId || data.doctorUid;
      if (!doctorIds.has(docId)) {
        await deleteDoc(appt.ref);
        deletedCount++;
        console.log(`Deleted orphaned appointment: ${appt.id}`);
      }
    }
    
    console.log(`Cleanup complete. Deleted ${deletedCount} orphaned appointments.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
