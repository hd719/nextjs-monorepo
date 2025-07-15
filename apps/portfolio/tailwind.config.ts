import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{html,js}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        white: "#FFFFFF",
        vanilla: "#fbf7e5",
        default: "#323232", // default font color
        // Add blue color that's used
        blue: {
          500: "#3b82f6", // for text-blue-500
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
