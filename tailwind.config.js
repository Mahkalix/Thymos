module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",  // Inclut les fichiers .jsx
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // Inclut les fichiers .jsx
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // Inclut les fichiers .jsx
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
