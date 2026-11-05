/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Earth-and-leaf palette: shamba green (actions) deepening to mlima green (brand)
        primary: {
          50:  '#eef6f0',
          100: '#d6eadb',
          200: '#afd5b9',
          300: '#7fba90',
          400: '#559f6b',
          500: '#3e8e5a',
          600: '#327549',
          700: '#285e3b',
          800: '#1f4d3a',
          900: '#163828',
        },
        mlima: '#1f4d3a',
        shamba: '#3e8e5a',
        maize: '#e3b23c',
        soil: { DEFAULT: '#4a3426', light: '#7a5a43', deep: '#2f2018' },
        mist: '#eef4ef',
        ink: '#1b2a22',
        earth: {
          brown: '#a0522d',
          cream: '#f5f0e8',
          sand:  '#d4a96a',
          clay:  '#8b4513',
        },
        health: {
          healthy:  '#16a34a',
          at_risk:  '#ca8a04',
          diseased: '#ea580c',
          critical: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', 'system-ui', 'sans-serif'],
        display: ['"Familjen Grotesk"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
