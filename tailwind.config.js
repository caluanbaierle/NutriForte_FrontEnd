/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1B5E45',
          dark: '#134536',
          light: '#2A7A5C',
        },
        sage: {
          DEFAULT: '#7A9E8A',
          muted: '#C5D6CC',
        },
        cream: {
          DEFAULT: '#F7F5F1',
          dark: '#EBE7DF',
        },
        charcoal: {
          DEFAULT: '#1F2A24',
          muted: '#5A6B62',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 24px rgba(27, 94, 69, 0.08)',
      },
    },
  },
  plugins: [],
}
