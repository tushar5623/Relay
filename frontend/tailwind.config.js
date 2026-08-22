/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0075de',
          active: '#005bab',
          light: '#e8f3fc',
        },
        secondary: {
          DEFAULT: '#213183',
          dark: '#16225a',
          light: '#3144a6',
        },
        canvas: {
          DEFAULT: '#ffffff',
          soft: '#f6f5f4',
          muted: '#edece9',
        },
        surface: '#ffffff',
        ink: {
          DEFAULT: '#111827',
          secondary: '#31302e',
          muted: '#615d59',
          faint: '#a39e98',
        },
        hairline: '#e6e6e6',
        sticker: {
          sky: '#62aef0',
          'sky-bg': '#eef6fd',
          purple: '#d6b6f6',
          'purple-deep': '#391c57',
          'purple-bg': '#f8f2fe',
          pink: '#ff64c8',
          'pink-bg': '#fdf0f9',
          orange: '#dd5b00',
          'orange-deep': '#793400',
          'orange-bg': '#fef3eb',
          teal: '#2a9d99',
          'teal-bg': '#edf8f8',
          green: '#1aae39',
          'green-bg': '#edf9f0',
          brown: '#523410',
          'brown-bg': '#f7f4f0',
          amber: '#f59e0b',
          'amber-bg': '#fef9ee',
          red: '#e5484d',
          'red-bg': '#fdf2f2',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'micro': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 6px 16px -4px rgba(0, 0, 0, 0.06), 0 2px 6px -2px rgba(0, 0, 0, 0.03)',
        'elevated': '0 12px 32px -8px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'modal': '0 24px 48px -12px rgba(0, 0, 0, 0.18), 0 12px 24px -8px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '5px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      }
    },
  },
  plugins: [],
}
