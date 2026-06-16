/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#4F46E5', // Indigo-600
        'primary-dark': '#3730A3', // Indigo-800
        secondary: '#0D9488', // Teal-600
        'secondary-dark': '#0F766E', // Teal-700
        accent: '#8B5CF6', // Violet-500
        'accent-dark': '#7C3AED', // Violet-600
        'background-light': '#FFFFFF',
        'background-dark': '#0B0F19', // Deeper, richer dark background
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(to right, #4f46e5, #8b5cf6, #0d9488)',
        'gradient-button': 'linear-gradient(to right, #4f46e5, #8b5cf6, #0d9488, #06b6d4)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(79, 70, 229, 0.15)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}

