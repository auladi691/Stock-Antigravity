/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mira: {
          canvas: '#FAF7F2',
          subtle: '#F3EDE2',
          card: '#FFFFFF',
          'card-muted': '#F9F6F0',
          dark: '#1E1E1C',
          muted: '#6E675F',
          border: '#E5DDD0',
          sand: '#D6C5AC',
          caramel: '#B36528',
          'caramel-hover': '#99521E',
          'caramel-light': '#F7E8D8',
          olive: '#5B6647',
          'olive-light': '#EBEFE3',
          brick: '#A33B32',
          'brick-light': '#FBE9E7',
          amber: '#C47227',
          'amber-light': '#FDF3E7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'tactile': '0 1px 3px rgba(30, 30, 28, 0.05), 0 1px 2px rgba(30, 30, 28, 0.03)',
        'elevated': '0 4px 12px rgba(30, 30, 28, 0.07)',
      }
    },
  },
  plugins: [],
}
