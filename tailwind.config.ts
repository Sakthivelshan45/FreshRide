import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'green-primary':   '#1A4731',
        'green-secondary': '#4A7C59',
        'green-light':     '#8FB99A',
        'gold-accent':     '#C8A96E',
        'light-bg':        '#F5F7F4',
        'navy-dark':       '#17232D',
        'silver':          '#E8EEF0',
      },
      fontFamily: {
        sans:  ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'ui-serif', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-green': 'linear-gradient(135deg, #1A4731 0%, #4A7C59 100%)',
      },
      animation: {
        float:              'float 6s ease-in-out infinite',
        shimmer:            'shimmer 2.5s infinite',
        'pulse-ring':       'pulse-ring 1.5s ease-out infinite',
        'scroll-indicator': 'scroll-indicator 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':      { transform: 'translateY(-10px) rotate(1deg)' },
          '66%':      { transform: 'translateY(-5px) rotate(-1deg)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'scroll-indicator': {
          '0%':   { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(8px)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
