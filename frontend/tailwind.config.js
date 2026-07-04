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
        messpro: {
          // Sleek white/light theme colors
          lightBg: '#ffffff',
          lightSurface: '#f8fafc',
          // Metallic black theme colors
          bg: '#050505', // Deep metallic black
          surface: '#121212', // Slightly elevated metallic black
          panel: '#1a1a1a', // Panel metallic black
          accent: '#ffffff', // High contrast accent
          muted: '#888888', // Sleek gray
          border: '#2a2a2a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card-deep': '0 10px 30px rgba(0,0,0,0.8), inset 0 1px rgba(255,255,255,0.05)',
        'sleek': '0 4px 20px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0,0,0,0.02)',
        'sleek-dark': '0 4px 20px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0,0,0,0.2)'
      },
      backgroundImage: {
        'metallic-gradient': 'linear-gradient(145deg, #1a1a1a 0%, #050505 100%)',
        'metallic-light': 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)',
      }
    },
  },
  plugins: [],
}
