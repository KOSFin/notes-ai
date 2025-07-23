// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary-hsl))',
        secondary: 'hsl(var(--secondary-hsl))',
        accent: 'hsl(var(--accent-h) var(--accent-s) var(--accent-l))',
        'accent-hover': 'hsl(var(--accent-h) var(--accent-s) calc(var(--accent-l) - 5%))',
        'text-primary': 'hsl(var(--text-primary-hsl))',
        'text-secondary': 'hsl(var(--text-secondary-hsl))',
        'border-color': 'hsl(var(--border-hsl))',
      },
    },
  },
  plugins: [],
};

export default config;
