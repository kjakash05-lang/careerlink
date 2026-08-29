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
        pro: {
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#c7dcff',
          300: '#9ec4ff',
          400: '#6ba0ff',
          500: '#3b78f6',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554',
          950: '#0f172a'
        },
        slate: {
          850: '#151f32',
          900: '#0f172a',
          950: '#080d1a'
        },
        tealAccent: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 0 0 1px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
        'card-hover': '0 0 0 1px rgba(59,130,246,0.25), 0 8px 24px -4px rgba(59,130,246,0.12)',
        'glow': '0 0 20px -5px rgba(59, 130, 246, 0.4)',
      }
    },
  },
  plugins: [],
}
