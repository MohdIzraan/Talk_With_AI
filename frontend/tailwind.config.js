/**  @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // toggled via a "dark Mode"  controlled by ThemeContext
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
      animation: {
        "bounce-slow": "bounce 1.4s infinite",
      },
    },
  },
  plugins: [],
};
