/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'outline': '#889487',
        'on-surface': '#dfe3e7',
        'surface-container-lowest': '#071530',
        'surface-container-low': '#152040',
        'on-primary': '#003918',
        'surface-container': '#1e3368',
        'secondary': '#71ff74',
        'tertiary-container': '#f36238',
        'background': '#0E2044',
        'surface-container-highest': '#2d5aa0',
        'primary-container': '#3fa35f',
        'surface': '#0E2044',
        'on-surface-variant': '#becabc',
        'primary': '#77db90',
        'surface-container-high': '#254E8F',
        'outline-variant': '#3f4a3f',
        'on-secondary': '#003909',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      fontFamily: {
        headline: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
