/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cafe: {
          bg: '#F9F6F0',
          surface: '#FFFFFF',
          'surface-alt': '#F3EFE6',
          border: '#E5E0D8',
          primary: '#E07A5F',
          'primary-hover': '#D0694E',
          secondary: '#8DA399',
          text: '#2C2A29',
          'text-muted': '#7D756D',
          success: '#6B8E6B',
          danger: '#D9534F',
        }
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['IBM Plex Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
