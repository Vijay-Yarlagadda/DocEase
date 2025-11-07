/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A',
        'primary-dark': '#1e40af',
        secondary: '#0EA5E9',
        'secondary-dark': '#0284c7',
        accent: '#38BDF8',
        'accent-dark': '#0ea5e9',
        'background-light': '#F9FAFB',
        'background-dark': '#0F172A',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(to right, #1e3a8a, #2563eb, #0ea5e9)',
        'gradient-button': 'linear-gradient(to right, #1e3a8a, #2563eb, #0ea5e9, #38bdf8)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
}

