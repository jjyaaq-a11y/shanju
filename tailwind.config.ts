import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // DeepChinaTrip palette: 川西自然风光 + 藏文化 + 高端入境游
        primary: "#3A5F7A",   // highland teal
        accent: "#A0522D",    // terracotta
        secondary: "#CC7722", // warm ochre
        neutral: "#EDE4D9",   // warm beige
        ink: "#333333",       // text
        cream: "#F8F8F8",     // snow white (bg)
        // Semantic aliases for existing component classes
        rock: "#EDE4D9",      // neutral warm beige
        plateau: "#3A5F7A",   // primary highland teal
        wheat: "#A0522D",     // accent terracotta
        ochre: "#CC7722",     // secondary warm ochre
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "Source Han Serif CN", "Songti SC", "serif"],
        sans: ["var(--font-sans-sc)", "var(--font-sans)", "Inter", "Noto Sans SC", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
