/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
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