/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        messpro: {
          bg: '#030814',
          surface: '#0b1220',
          panel: '#0f172a',
          accent: '#fb923c',
          muted: '#9a9fae'
        }
      },
      boxShadow: {
        'card-deep': '0 10px 30px rgba(2,6,23,0.6), inset 0 1px rgba(255,255,255,0.02)'
      }
    },
  },
  plugins: [],
}

