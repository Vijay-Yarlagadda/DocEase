Deploy Cloud Function:

1. Install Firebase CLI and login:
   npm install -g firebase-tools
   firebase login

2. From the project root or functions folder, deploy:
   cd functions
   npm install
   firebase deploy --only functions

The callable function `createDoctor` expects the caller to have a custom claim `admin: true`.
You can set custom claims from a trusted environment using the Admin SDK:

admin.auth().setCustomUserClaims(uid, { admin: true })

After deploy, the client app can call the function using Firebase Functions client SDK.
