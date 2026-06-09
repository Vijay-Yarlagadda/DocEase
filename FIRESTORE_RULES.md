Paste these rules into Firebase Console → Firestore → Rules and Publish:

service cloud.firestore {
match /databases/{database}/documents {
// Users: each user may manage their own profile document
match /users/{userId} {
allow create: if request.auth != null && request.auth.uid == userId;
allow read, update, delete: if request.auth != null && request.auth.uid == userId;
}

    // Doctors: admin-only write, authenticated read
    match /doctors/{docId} {
      allow create, update, delete: if request.auth != null && request.auth.token.admin == true;
      allow read: if request.auth != null;
    }

    // Hospitals: only admins can write; only admins or superadmins can read documents
    match /hospitals/{hId} {
      allow create, update, delete: if request.auth != null && request.auth.token.admin == true;
      allow read: if request.auth != null && (
        request.auth.token.admin == true ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin'
      );
    }

    // Documents uploaded by patients. Each document must include `patientUid` and may include `sharedWith` (array of doctor UIDs).
    match /documents/{docId} {
      // Patients can create documents for themselves
      allow create: if request.auth != null && request.auth.uid == request.resource.data.patientUid;

      // Reading allowed for the owning patient, any doctor explicitly shared with, admins, or superadmins
      allow get, list: if request.auth != null && (
        request.auth.uid == resource.data.patientUid ||
        request.auth.token.admin == true ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin' ||
        (resource.data.sharedWith != null && request.auth.uid in resource.data.sharedWith)
      );

      // Only the patient who uploaded may update or delete
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.patientUid;
    }

    // Deny everything else by default
    match /{document=**} {
      allow read, write: if false;
    }

}
}

Notes:

- These rules allow normal signups to write their own `/users/{uid}` document.
- Only users with the `admin` custom claim can create or modify `/doctors` and `/hospitals` documents.
- Hospital verification documents are readable by admins and users whose Firestore `users/{uid}` document has `role: "superadmin"`.
- Patient-uploaded documents must include `patientUid` and may include `sharedWith` (array of doctor UIDs). Only the patient, explicitly shared doctors, admins, and superadmins can read them.
- To set the `admin` custom claim, use the Admin SDK from a trusted environment (see README in `functions/`).
