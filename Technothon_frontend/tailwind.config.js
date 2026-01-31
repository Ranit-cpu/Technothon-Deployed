/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
      screens: {
        xs: "480px",
      },
      colors: {
        brand: {
          light: "#4F46E5",
          DEFAULT: "#4338CA",
          dark: "#3730A3",
        },
      },
    },
  },
  plugins: [],
};
