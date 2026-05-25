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

    // Hospitals (example): admin-only write, authenticated read
    match /hospitals/{hId} {
      allow create, update, delete: if request.auth != null && request.auth.token.admin == true;
      allow read: if request.auth != null;
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
- To set the `admin` custom claim, use the Admin SDK from a trusted environment (see README in `functions/`).
