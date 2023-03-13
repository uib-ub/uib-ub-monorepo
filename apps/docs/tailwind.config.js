/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx,md}',
    './components/**/*.{js,ts,jsx,tsx}',
    './theme.config.tsx'
  ],
  theme: {
    extend: {
    }
  },
  plugins: [],
  darkMode: 'class'
}