/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#001529', // Fondo ultra oscuro
          800: '#002447', // Azul del escudo
          700: '#003666', // Azul más claro para hover
        },
        gold: {
          500: '#FDC010', // Dorado vibrante del escudo
          400: '#FFD700', // Brillo
          600: '#D9A40E', // Sombra
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1.5rem',
        '3xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
