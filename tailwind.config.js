/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./resources/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./resources/views/**/*.blade.php",
  ],
  theme: {
    extend: {
      colors: {
        arsiBlue: '#003A8F',
        arsiGold: '#F2B705',
        arsiLight: '#E6F0FF',
        arsiDark: '#1F2937',
      },
    },
  },
  plugins: [],
};