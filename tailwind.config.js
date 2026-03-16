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
        'hc-bg': '#000000',
        'hc-text': '#FFFFFF',
        'hc-accent': '#FFD700',
        'hc-border': '#FFFFFF',
        'hc-card': '#1A1A1A',
        'hc-hover': '#FFD70033',
        'hc-danger': '#FF4444',
        'hc-success': '#00CC66',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

