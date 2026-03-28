/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ffffff',
          dark: '#cccccc',
        },
        darkBg: '#000000',
        darkCard: '#111111',
        darkBorder: '#1e1e1e',
        darkInput: '#171717',
        selectedSidebar: '#1a1a1a'
      }
    },
  },
  plugins: [],
}
