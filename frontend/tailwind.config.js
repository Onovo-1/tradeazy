/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: {
          50:  "#fdf3f4",
          100: "#fbe8ea",
          200: "#f6c9cd",
          300: "#eea0a8",
          400: "#e06b78",
          500: "#c93e4e",
          600: "#a82a3a",
          700: "#8b1e2c",
          800: "#6b1622",
          900: "#4a0f18",
          950: "#2b080e",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};