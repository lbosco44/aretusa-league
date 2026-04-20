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
        'on-primary': 'rgb(var(--on-primary) / <alpha-value>)',
        'surface-container': '#1e3368',
        'secondary': 'rgb(var(--secondary) / <alpha-value>)',
        'tertiary-container': '#f36238',
        'background': '#0E2044',
        'surface-container-highest': '#2d5aa0',
        'primary-container': 'rgb(var(--primary-container) / <alpha-value>)',
        'surface': '#0E2044',
        'on-surface-variant': '#becabc',
        'primary': 'rgb(var(--primary) / <alpha-value>)',
        'surface-container-high': '#254E8F',
        'outline-variant': '#3f4a3f',
        'on-secondary': 'rgb(var(--on-secondary) / <alpha-value>)',
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
