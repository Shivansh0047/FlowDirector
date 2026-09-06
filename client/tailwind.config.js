/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          light: 'var(--primary-light)',
          dark: 'var(--primary-dark)',
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        'timeline-line': 'var(--timeline-line)',
        'timeline-dot-primary': 'var(--timeline-dot-primary)',
        'timeline-dot-secondary': 'var(--timeline-dot-secondary)',
        demo: {
          badge: '#3b82f6',
          warning: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
}