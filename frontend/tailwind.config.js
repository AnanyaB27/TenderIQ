/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        surface: {
          950: '#070B14', // Deepest background
          900: '#0D1527', // Main card background
          850: '#111B33', // Elevated surface
          800: '#162342', // Card border / inner container
          750: '#1C2C52', // Interactive hover surface
          700: '#233664', // Active state
          600: '#324B84',
        },
        accent: {
          cyan: '#06B6D4',
          'cyan-glow': 'rgba(6, 182, 212, 0.15)',
          blue: '#3B82F6',
          indigo: '#6366F1',
          violet: '#8B5CF6',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.25)',
        'glow-indigo': '0 0 25px -5px rgba(99, 102, 241, 0.25)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'card-dark': '0 4px 20px -2px rgba(2, 6, 23, 0.5), 0 0 0 1px rgba(30, 41, 59, 0.6)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}