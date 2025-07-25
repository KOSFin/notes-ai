
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
          'fade-out': 'fade-out 0.2s ease-out forwards',
          'pop-in': 'pop-in 0.3s ease-out forwards',
          'pop-out': 'pop-out 0.2s ease-out forwards',
          'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
          'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards',
          'slide-out-right': 'slide-out-right 0.3s cubic-bezier(0.5, 0, 0.75, 0) forwards',
          'slide-out-left': 'slide-out-left 0.3s ease-in forwards',
          'slide-in-left': 'slide-in-left 0.3s ease-out forwards',
          'fly-to-trash': 'fly-to-trash 1.5s ease-in-out forwards'
      },
      keyframes: {
          'fade-in': {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' },
          },
           'fade-out': {
              '0%': { opacity: '1' },
              '100%': { opacity: '0' },
          },
          'pop-in': {
              '0%': { opacity: '0', transform: 'scale(.95)' },
              '100%': { opacity: '1', transform: 'scale(1)' },
          },
           'pop-out': {
              '0%': { opacity: '1', transform: 'scale(1)' },
              '100%': { opacity: '0', transform: 'scale(0.95)' },
          },
          'fade-in-up': {
            '0%': { opacity: '0', transform: 'translateY(10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          'slide-in-right': {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(0)' },
          },
          'slide-out-right': {
            '0%': { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(100%)' },
          },
          'slide-in-left': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(0)' },
          },
          'slide-out-left': {
            '0%': { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(-100%)' },
          },
          'fly-to-trash': {
              '0%': { top: 'var(--start-y)', left: 'var(--start-x)', opacity: 1, transform: 'scale(1)' },
              '80%': { opacity: 1, transform: 'scale(0.8)' },
              '100%': { top: 'calc(100% - 100px)', left: '50%', opacity: 0, transform: 'scale(0.2) rotate(30deg)' }
          }
      },
    },
  },
  plugins: [],
};

export default config;
