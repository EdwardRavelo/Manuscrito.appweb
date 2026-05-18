import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: '#f0ead6',
        panel: '#e6dfc8',
        surface: '#ddd6bc',
        hover: '#d4ccaa',
        active: '#c9c098',
        accent: '#5c6e2a',
        'accent-dim': '#48581e',
        'accent-amber': '#8a6a2a',
        'accent-red': '#8a3020',
        'accent-blue': '#2a5a6e',
        'text-main': '#252e12',
        'text-mid': '#4a5828',
        'text-muted': '#7a8a58',
      },
      boxShadow: {
        panel: '4px 0 24px rgba(80,90,40,0.12)',
        glow: '0 0 12px rgba(92,110,42,0.18)',
        'glow-lg': '0 0 32px rgba(92,110,42,0.22)',
      },
    },
  },
  plugins: [],
} satisfies Config
