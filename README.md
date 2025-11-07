# DocEase - Healthcare Management Platform

A modern, responsive web application that improves interaction between doctors and patients through three powerful portals.

## 🎯 Features

- **Admin Portal** - Manage hospitals, add doctors, and oversee system operations
- **Doctor Portal** - Manage appointments, view patients, and upload prescriptions
- **Patient Portal** - Book appointments and upload medical files

## 🛠️ Tech Stack

- **React.js** with React Router v6
- **Tailwind CSS** for styling
- **Framer Motion** for smooth animations
- **Lucide React** for icons
- **Axios** (ready for API integration)
- **Vite** for fast development and building

## 🎨 Design

- Clean, futuristic healthcare vibe
- Custom color scheme:
  - Primary: #1E3A8A (deep blue)
  - Secondary: #0EA5E9 (sky blue)
  - Accent: #38BDF8 (light blue)
- Glassmorphism effects
- Dark mode support
- Fully responsive design

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📁 Project Structure

```
DocEase/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── HeroSection.jsx
│   │   └── RoleCard.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── dashboards/
│   │       ├── AdminDashboard.jsx
│   │       ├── DoctorDashboard.jsx
│   │       └── PatientDashboard.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🎯 Routes

- `/` - Home page
- `/about` - About page
- `/contact` - Contact page
- `/login` - Login page (with role selector)
- `/signup` - Signup page (with role selector)
- `/admin/dashboard` - Admin dashboard
- `/doctor/dashboard` - Doctor dashboard
- `/patient/dashboard` - Patient dashboard

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js` to customize colors:

```js
colors: {
  primary: { DEFAULT: '#1E3A8A' },
  secondary: { DEFAULT: '#0EA5E9' },
  accent: { DEFAULT: '#38BDF8' },
}
```

### Dark Mode

Dark mode is enabled by default. Toggle it using the moon/sun icon in the navbar. The preference is saved in localStorage.

## 📝 Notes

- This is a frontend-only implementation. Backend API integration is pending.
- All forms currently log to console. Connect to your backend API as needed.
- Authentication is placeholder-based. Implement proper authentication when connecting to backend.

## 🔮 Future Enhancements

- Backend API integration
- Real authentication system
- Database connectivity
- File upload functionality
- Real-time notifications
- Email notifications
- Advanced analytics

## 📄 License

This project is open source and available under the MIT License.

