/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/react-tailwindcss-datepicker/dist/index.esm.js',
    '/node_modules/tw-elements-react/dist/js/**/*.js'
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        customDarkBlue: '#293241',
        customBlue: '#3d5a80',
        customGray: '#D9D9D9',
        buttonPrimary: '#3d5a80',
        customBrown: '#B27C66'
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif']
      },
      backgroundImage: {
        loginBackdrop: "url('/backdrop.jpg')"
      }
    }
  },

  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: ['light', 'dark']
  },
  important: true
};
