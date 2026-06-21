/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
        'road-rage': ['"Road Rage"', 'cursive'],
      },
      colors: {
        'accent-teal': '#4ADDDE',
      }
    },
  },
  plugins: [],
}

