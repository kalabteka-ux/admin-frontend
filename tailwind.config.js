// ==============================================================
// FOLDER: admin-frontend
// FILE: tailwind.config.js
// ==============================================================
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eotcGreen: "#0F8A52",
        eotcGold: "#D49A1F",
        adminBg: "#090D0B",
        adminCard: "#111814",
        adminBorder: "#1E2B23"
      }
    },
  },
  plugins: [],
}