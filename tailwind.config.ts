import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': 'hsl(var(--primary-hsl))',
        'secondary': 'hsl(var(--secondary-hsl))',
        'accent': 'hsl(var(--accent-h) var(--accent-s) var(--accent-l))',
        'accent-hover': 'hsl(var(--accent-h) var(--accent-s) calc(var(--accent-l) - 5%))',
        'text-primary': 'hsl(var(--text-primary-hsl))',
        'text-secondary': 'hsl(var(--text-secondary-hsl))',
        'border-color': 'hsl(var(--border-hsl))',
      },
      animation: {
          'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'fade-in': 'fade-in 0.3s ease-out forwards',
          'pop-in': 'pop-in 0.3s ease-out forwards',
          'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
          'slide-in-right': 'slide-in-right 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards',
          'slide-out-left': 'slide-out-left 0.5s cubic-bezier(0.5, 0, 0.75, 0) forwards',
          'slide-in-left': 'slide-in-left 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards',
          'slide-out-right': 'slide-out-right 0.5s cubic-bezier(0.5, 0, 0.75, 0) forwards',
          'fly-to-trash': 'fly-to-trash 1.5s ease-in-out forwards'
      },
      keyframes: {
          'fade-in': {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' },
          },
          'pop-in': {
              '0%': { opacity: '0', transform: 'scale(.95)' },
              '100%': { opacity: '1', transform: 'scale(1)' },
          },
          'fade-in-up': {
              '0%': { opacity: '0', transform: 'translateY(1rem)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          'slide-in-right': {
              'from': { transform: 'translateX(100%)', opacity: 0 },
              'to': { transform: 'translateX(0)', opacity: 1 },
          },
          'slide-out-left': {
              'from': { transform: 'translateX(0)', opacity: 1 },
              'to': { transform: 'translateX(-100%)', opacity: 0 },
          },
          'slide-in-left': {
              'from': { transform: 'translateX(-100%)', opacity: 0 },
              'to': { transform: 'translateX(0)', opacity: 1 },
          },
          'slide-out-right': {
              'from': { transform: 'translateX(0)', opacity: 1 },
              'to': { transform: 'translateX(100%)', opacity: 0 },
          },
          'fly-to-trash': {
              '0%': { transform: 'translate(var(--start-x), var(--start-y)) scale(1)', opacity: 1 },
              '30%': { opacity: 1 },
              '100%': { transform: 'translate(0, 100vh) scale(0.2)', opacity: 0 },
          },
      }
    }
  },
  plugins: [],
};

export default config;
