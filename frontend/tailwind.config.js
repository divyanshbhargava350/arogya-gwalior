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
        saffron: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        deepteal: {
          500: '#0f766e',
          600: '#0d9488',
          700: '#115e59',
          800: '#134e4a',
          900: '#042f2e',
        },
        emergency: {
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'sans-serif'],
        display: ['Poppins', 'Yatra One', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        story: ['Kalam', 'cursive']
      }
    },
  },
  plugins: [],
}
