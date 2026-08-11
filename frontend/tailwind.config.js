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
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          foreground: "var(--surface-foreground)",
        },
        "code-highlight": "var(--code-highlight)",
        "code-number": "var(--code-number)",
        selection: {
          DEFAULT: "var(--selection)",
          foreground: "var(--selection-foreground)",
        },
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
