// tailwind.config.js
module.exports = {
  content: [
    "./index.html",                 // Vite
    "./public/index.html",          // CRA
    "./src/**/*.{js,jsx,ts,tsx}",   // <-- your components/pages
  ],
  theme: { extend: {} },
  plugins: [],
};
