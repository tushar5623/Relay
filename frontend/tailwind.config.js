/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ops: {
          base: '#0B1220',
          panel: '#121B2E',
          border: '#223047',
          text: '#E8EDF4',
          muted: '#8592A6',
          amber: '#F0A93B',
          teal: '#33C7B0',
          red: '#E5484D',
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
