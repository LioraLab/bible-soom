import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular"],
        bible: ["var(--font-noto-serif-kr)", "serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // New Palette: Blue · Beige · Neutral
        primary: {
          50: '#f0f4f8',
          100: '#dce5ed',
          200: '#b8cedd',
          300: '#8baeca',
          400: '#588ab4',
          500: '#3a6e9a', // Main Blue
          600: '#2c5780',
          700: '#244668', // Deep Navy
          800: '#203c58',
          900: '#1e334a',
          950: '#132131',
        },
        paper: {
          50: '#fdfcf8', // Very light cream (Page Bg)
          100: '#fbf9f1',
          200: '#f6f1df',
          300: '#efe6c4',
          400: '#e6d6a0',
          500: '#dcc27d', // Sand
          600: '#c2a25f',
          700: '#9b7d48',
          800: '#7f653f',
          900: '#695337',
          950: '#3b2d1c',
        },
        stone: { // Warm Neutrals
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
