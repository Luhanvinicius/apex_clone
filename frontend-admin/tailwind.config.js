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
        darkBg: '#212121',
        darkCard: '#222222',
        darkBorder: '#343434',
        darkInput: '#2a2a2a',
        selectedSidebar: '#2a2a2a',
        textPrimary: '#dddddd',
        textMuted: '#aaaaaa',
      }
    },
  },
  plugins: [],
}
