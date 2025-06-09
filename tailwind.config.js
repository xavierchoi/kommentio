/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        light: {
          bg: '#ffffff',
          surface: '#f8fafc',
          border: '#e2e8f0',
          text: {
            primary: '#1e293b',
            secondary: '#64748b',
            tertiary: '#94a3b8',
          },
        },
        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          text: {
            primary: '#f8fafc',
            secondary: '#cbd5e1',
            tertiary: '#94a3b8',
          },
        },
      },
    },
  },
  plugins: [],
};