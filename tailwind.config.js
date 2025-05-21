/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heebo: ['Heebo', 'sans-serif'],
      },
      colors: {
        primary: '#e3a92b',
        'primary-dark': '#c48c1c',
        secondary: '#3b82f6',
        'secondary-dark': '#2563eb',
        success: '#22c55e',
        warning: '#f97316',
        danger: '#ef4444',
        background: '#f8fafc',
        text: '#1e293b',
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};