/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0b0f1a',
        secondary: '#1a1f2e',
        accent: '#3b82f6',
        danger: '#ef4444',
      },
    },
  },
  plugins: [],
}
