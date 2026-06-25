/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        phonepe: {
          primary: '#5f259f',
          secondary: '#7e35b7',
          light: '#f1ebf7',
          dark: '#1e0a3c',
        }
      }
    },
  },
  plugins: [],
}
