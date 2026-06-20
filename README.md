# 🏥 DocEase - Secure Healthcare Document Management Platform

[![React](https://img.shields.io/badge/React-18.2-blue?logo=react)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange?logo=firebase)](https://firebase.google.com)
[![Node.js](https://img.shields.io/badge/Node.js-18-green?logo=node.js)](https://nodejs.org)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple?logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

A comprehensive, secure healthcare management platform that streamlines document management, appointment scheduling, and provider-patient interactions. DocEase enables hospitals, doctors, and patients to collaborate efficiently with enterprise-grade security powered by Firebase and cloud storage.

---

## ✨ Features

### 🏨 **Hospital/Admin Portal**

- 📊 Comprehensive dashboard with analytics and key metrics
- 👨‍⚕️ Doctor management (create, edit, deactivate, password reset)
- 👥 Patient directory with searchable profiles
- 📅 Appointment management and scheduling oversight
- 🏥 Hospital profile management with verification status
- 📈 Analytics with appointment trends and patient registration statistics
- 📋 Manage hospital settings and configurations
- 🔔 Real-time notifications system

### 👨‍⚕️ **Doctor Portal**

- 📋 View all scheduled appointments and patient details
- ✅ Appointment status management (pending, confirmed, completed, cancelled)
- 📄 Upload and manage patient prescriptions
- 👤 View patient medical history and documents
- 📊 Personal performance analytics and appointment statistics
- 🔐 Secure password management and change password functionality
- 📎 Download and manage medical documents
- 🔔 Appointment notifications and reminders

### 👤 **Patient Portal**

- 🔍 Search and browse available doctors by specialty
- 📅 Book appointments with real-time availability
- 📋 View appointment history and upcoming appointments
- ✅ Appointment status tracking
- 📄 Upload medical documents and test reports
- 👁️ View uploaded documents with preview functionality
- 📧 Receive appointment confirmations and notifications
- 👤 Complete and manage patient profile
- 🔐 Secure account management

### 🔐 **Security & Authentication**

- Firebase Authentication with email/password
- Role-based access control (RBAC)
- Secure Firestore database with rules-based access
- Protected routes with automatic redirects
- Session management and token handling
- Password encryption and change management

### 📱 **User Interface**

- Fully responsive design (mobile, tablet, desktop)
- Dark/Light mode support
- Smooth animations with Framer Motion
- Intuitive navigation and user experience
- Toast notifications for user feedback
- Loading states and skeleton loaders
- Professional glassmorphism design

---

## 🛠️ Tech Stack

### **Frontend**

- **React.js** 18.2 - UI library with Hooks
- **React Router v6** - Client-side routing
- **Vite** 5.0 - Next-generation build tool
- **Tailwind CSS** 3.3 - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API calls

### **Backend**

- **Node.js** 18+ - Server runtime
- **Express.js** - Web framework
- **Firebase Cloud Functions** - Serverless computing
- **Firebase Admin SDK** - Backend Firebase services

### **Database & Storage**

- **Firebase Firestore** - NoSQL real-time database
- **Firebase Authentication** - User authentication service
- **Cloudinary** - Cloud image and document storage
- **Firebase Storage** - Cloud file storage

### **Email & Notifications**

- **Nodemailer** - SMTP email delivery engine
- **Google SMTP** - Secure email transmission integration

### **Deployment**

- **Vercel** - Frontend deployment
- **Firebase** - Backend, database, and functions hosting
- **Cloud Functions** - Serverless backend

### **Development Tools**

- **Vite** - Lightning-fast modern frontend build tool
- **PostCSS** - Advanced CSS transformation engine used by Tailwind
- **ESLint** - Automated code quality and syntax checker
- **Concurrently** - Development utility to run frontend and backend simultaneously

---

## 📦 Project Structure

```
DocEase/
├── 📁 src/
│   ├── 📁 components/
│   │   ├── 📁 admin/              # Admin dashboard components
│   │   ├── 📁 auth/               # Authentication components
│   │   ├── 📁 dashboard/          # Shared dashboard components
│   │   ├── 📁 superadmin/         # Super admin components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Toast.jsx              # Toast notification system
│   │   ├── ProtectedRoute.jsx     # Route protection
│   │   └── ErrorBoundary.jsx      # Error handling
│   ├── 📁 pages/
│   │   ├── Home.jsx               # Landing page
│   │   ├── Login.jsx              # Multi-role login
│   │   ├── Signup.jsx             # Registration
│   │   ├── 📁 admin/              # Admin pages
│   │   ├── 📁 dashboards/         # Dashboard pages
│   │   ├── 📁 doctor/             # Doctor pages
│   │   ├── 📁 patient/            # Patient pages
│   │   └── 📁 super-admin/        # Super admin pages
│   ├── 📁 services/
│   │   ├── api.js                 # Axios API client
│   │   ├── authService.js         # Firebase auth logic
│   │   ├── firebase.js            # Firebase config
│   │   ├── adminService.js        # Admin operations
│   │   ├── appointmentService.js  # Appointment management
│   │   ├── documentService.js     # Document operations
│   │   ├── doctorService.js       # Doctor operations
│   │   ├── patientService.js      # Patient operations
│   │   ├── cloudinaryService.js   # Image upload service
│   │   └── leaveService.js        # Leave management
│   ├── 📁 context/
│   │   └── AuthContext.jsx        # Auth global state
│   ├── 📁 hooks/
│   │   └── useCloudinaryUpload.js # File upload hook
│   ├── 📁 layouts/
│   │   ├── DashboardLayout.jsx
│   │   └── SuperAdminLayout.jsx
│   ├── 📁 utils/
│   │   ├── hospitalHelpers.js
│   │   └── userProfile.js
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── 📁 functions/
│   ├── index.js                   # Cloud Functions
│   └── package.json
├── 📁 server/
│   ├── index.js                   # Express server
│   ├── 📁 services/
│   │   └── emailService.js        # Email service
│   └── package.json
├── firebase.json                  # Firebase config
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS config
├── postcss.config.js              # PostCSS config
├── package.json                   # Project dependencies
└── README.md                       # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **Firebase Project** (create one at [firebase.google.com](https://firebase.google.com))
- **Cloudinary Account** (sign up at [cloudinary.com](https://cloudinary.com))
- **Gmail Account** (with App Passwords enabled for Nodemailer)

### Installation

#### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/docease.git
cd DocEase
```

#### Step 2: Setup Frontend

```bash
# Install dependencies
npm install

# Create .env.local file in root directory
echo "VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset" > .env.local
```

#### Step 3: Setup Backend Server

```bash
cd server

# Install dependencies
npm install

# Create .env file
echo "PORT=5000
SMTP_USER=your_gmail_address
SMTP_PASS=your_gmail_app_password
NODE_ENV=development" > .env

# Start the server
npm start
```

#### Step 4: Setup Firebase Functions

```bash
cd functions

# Install dependencies
npm install

# Deploy to Firebase
firebase deploy --only functions
```

#### Step 5: Start Development

```bash
# From root directory, in a new terminal
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📖 Usage

### Admin Login

1. Go to `http://localhost:5173/login`
2. Select **Admin** role
3. Enter admin email and password
4. Access admin dashboard at `/admin/dashboard`

### Doctor Operations

- **Create Doctor**: Admin can create doctor accounts with temporary passwords
- **Manage Appointments**: View and update appointment statuses
- **Upload Prescriptions**: Add prescription documents for patients
- **View Analytics**: Monitor personal appointment statistics

### Patient Operations

- **Register**: Sign up as a patient with email and password
- **Book Appointment**: Search doctors and book available time slots
- **Upload Documents**: Share medical files and test reports
- **Track Appointments**: Monitor appointment history and status

### Super Admin

- Access `/super-admin/dashboard`
- Manage hospitals and system-wide settings
- View comprehensive analytics
- Manage all users and administrators

---

## 🔐 Key Operations

### Authentication

```javascript
// Admin signup
await adminSignup(email, password, name);

// Patient signup
await patientSignup(email, password, name);

// Login (role-based)
await loginUser(email, password, role);

// Doctor login (special flow)
await doctorLogin(email, password);
```

### Appointment Management

```javascript
// Book appointment
await bookAppointment({
  patientId,
  patientName,
  doctorId,
  doctorName,
  hospitalId,
  hospitalName,
  appointmentDate,
  appointmentTime,
});

// Get doctor appointments
await getDoctorAppointments(doctorId);

// Update appointment status
await updateAppointmentStatus(appointmentId, newStatus);
```

### Document Management

```javascript
// Create patient document
await createPatientDocument({
  appointmentId,
  patientUid,
  patientName,
  patientEmail,
  doctorId,
  hospitalId,
  fileName,
  fileUrl,
  mimeType,
});

// Get patient documents
await getPatientDocuments(patientUid);

// Get documents for appointment
await getDocumentsForAppointment(appointmentId);
```

### Admin Operations

```javascript
// Create doctor
await adminCreateDoctor(email, name, speciality, hospitalId);

// Get dashboard stats
await getAdminDashboardStats(hospitalId);

// Get appointment analytics
await getDoctorAppointmentStats(hospitalId);

// Get monthly trends
await getMonthlyAppointmentTrends(rangeMonths, hospitalId);
```

---

## 📊 Screenshots

### Landing Page

[Add landing page screenshot]

### Login & Signup

[Add auth pages screenshots]

### Admin Dashboard

[Add admin dashboard screenshot]

### Doctor Dashboard

[Add doctor dashboard screenshot]

### Patient Portal

[Add patient portal screenshot]

### Appointment Management

[Add appointment management screenshot]

### Document Management

[Add document upload/view screenshot]

---

## 🔗 API Routes

### Authentication Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Appointment Endpoints

- `POST /api/appointments/book` - Book appointment
- `GET /api/appointments/user/:userId` - Get user appointments
- `PUT /api/appointments/:id/status` - Update appointment status
- `DELETE /api/appointments/:id` - Delete appointment

### Doctor Endpoints

- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor details
- `PUT /api/doctors/:id` - Update doctor profile
- `POST /api/doctors/:id/appointments` - Get doctor appointments

### Patient Endpoints

- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient profile
- `GET /api/patients/:id/documents` - Get patient documents

### Document Endpoints

- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:userId` - Get user documents
- `DELETE /api/documents/:id` - Delete document

### Admin Endpoints

- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/hospitals` - Get all hospitals
- `POST /api/admin/doctors` - Create doctor
- `PUT /api/admin/doctors/:id` - Update doctor
- `GET /api/admin/analytics` - Get analytics data

---

## 🌐 Deployment

### Frontend - Vercel

1. Push your code to GitHub
2. Connect your GitHub repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy with one click

```bash
# Or deploy via CLI
npm i -g vercel
vercel
```

### Backend - Firebase

1. Initialize Firebase:

```bash
firebase init
```

2. Deploy functions:

```bash
firebase deploy --only functions
```

3. Set environment variables:

```bash
# Add SMTP_USER and SMTP_PASS to your hosting provider's environment variables
```

### Database - Firestore

Firestore is hosted by Firebase - no additional deployment needed.

### Live Demo

- **Frontend**: [https://docease-live.vercel.app](https://docease-live.vercel.app)
- **Backend**: Firebase Cloud Functions

---

## 🔮 Future Enhancements

- [ ] **Video Consultations** - Integrate Zoom/Google Meet for virtual appointments
- [ ] **SMS Notifications** - Send SMS reminders and updates to patients
- [ ] **Payment Integration** - Integrate Stripe/Razorpay for consultation fees
- [ ] **Prescription Analytics** - AI-powered prescription recommendations
- [ ] **Medical Records OCR** - Automatic document scanning and extraction
- [ ] **Telemedicine Queue System** - Waiting list and real-time queue management
- [ ] **Mobile App** - React Native mobile application
- [ ] **AI Chatbot** - AI-powered health information chatbot
- [ ] **Analytics Dashboard** - Advanced analytics for hospitals
- [ ] **Integration with Electronic Health Records (EHR)**
- [ ] **Multi-language Support** - Support for multiple languages
- [ ] **HIPAA Compliance** - Full HIPAA compliance for healthcare data
- [ ] **Advanced Search** - Full-text search with filters
- [ ] **Feedback & Ratings** - Patient ratings and reviews for doctors
- [ ] **Prescription Management** - Digital prescription pad and refills

---

## 📧 Email Service

DocEase uses **Nodemailer** with Google SMTP for reliable, automated email delivery:

- **Appointment Confirmations** - Automatic status updates sent to patients
- **Doctor Notifications** - Alerts for doctors about new appointment requests
- **Prescription Delivery** - Alerts patients when their prescriptions are ready
- **Leave Management** - Notifies admins when doctors schedule time off
- **Hospital Verification** - Updates for hospital approval/rejection statuses

---

## 🧪 Testing

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run backend in development
npm run backend

# Run frontend in development
npm run frontend

# Run both concurrently
npm start
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Firebase not connecting

- Solution: Check Firebase configuration in `src/services/firebase.js`
- Ensure all environment variables are set correctly

**Issue**: Cloudinary upload failing

- Solution: Verify Cloudinary credentials
- Check upload preset is configured

**Issue**: Backend server not connecting

- Solution: Ensure backend is running on port 5000
- Check `VITE_API_URL` environment variable

**Issue**: Email not sending

- Solution: Verify your Gmail App Password is correct in `SMTP_PASS`
- Check that your Gmail account has 2-Step Verification enabled

For detailed troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📄 Documentation

- [Firebase Auth Implementation](FIREBASE_AUTH_IMPLEMENTATION.md)
- [Firestore Rules](FIRESTORE_RULES.md)
- [Quick Start Guide](QUICK_START.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**DocEase Development Team**

- **Email**: support@docease.com
- **GitHub**: [yourgithubusername](https://github.com/yourgithubusername)
- **Website**: [docease.vercel.app](https://docease.vercel.app)

---

## 🙏 Acknowledgments

- React.js and Vite communities
- Firebase for backend infrastructure
- Cloudinary for image management
- Resend for email services
- Tailwind CSS for styling utilities
- All contributors and supporters

---

## 📞 Support

For support, email us at support@docease.com or open an issue on [GitHub Issues](https://github.com/yourusername/docease/issues).

---

**Made with ❤️ by the DocEase Team**


