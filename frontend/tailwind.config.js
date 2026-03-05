/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        teal: {
          primary: "#0D4F4F",
          light: "#14706F",
          dark: "#093A3A",
        },
        amber: {
          accent: "#F59E0B",
        },
        cream: "#F8F6F0",
        charcoal: "#1A1A2E",
      },
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
