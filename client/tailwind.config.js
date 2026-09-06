/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary = green (main brand accent: hero gradients, focus rings, timeline dots)
        primary: {
          DEFAULT: 'var(--primary)',
          light: 'var(--primary-light)',
          dark: 'var(--primary-dark)',
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        // Button = blue (CTAs explicitly stay blue)
        button: {
          DEFAULT: 'var(--button)',
          light: 'var(--button-light)',
          dark: 'var(--button-dark)',
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