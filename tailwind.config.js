/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        epoxy: {
          bg: '#0a0a0a',
          surface: '#111111',
          border: '#1e1e1e',
          hover: '#1a1a1a',
          accent: '#f59e0b',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(to right, #facc15, #f97316, #ec4899)',
      },
    },
  },
  plugins: [],
};
