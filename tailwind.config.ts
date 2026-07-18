import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './types/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#06060e',
        deep: '#0c0c1d',
        surface: '#13132b',
        'surface-light': '#1c1c3a',
        neon: {
          magenta: '#ff2d7b',
          cyan: '#00e5ff',
          amber: '#ffb300',
          emerald: '#00e676',
          rose: '#ff4081',
        },
        glass: {
          DEFAULT: 'rgba(19, 19, 43, 0.55)',
          light: 'rgba(28, 28, 58, 0.45)',
          border: 'rgba(255, 255, 255, 0.07)',
        },
        cyber: {
          bg: '#06060e',
          card: '#13132b',
          border: 'rgba(255, 255, 255, 0.07)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 10px rgba(0, 229, 255, 0.3), 0 0 40px rgba(0, 229, 255, 0.1)',
        'neon-strong': '0 0 10px rgba(0, 229, 255, 0.5), 0 0 40px rgba(0, 229, 255, 0.2), 0 0 80px rgba(0, 229, 255, 0.1)',
        'neon-magenta': '0 0 12px rgba(255, 45, 123, 0.4), 0 0 40px rgba(255, 45, 123, 0.15)',
        'neon-cyan': '0 0 12px rgba(0, 229, 255, 0.4), 0 0 40px rgba(0, 229, 255, 0.15)',
        'neon-amber': '0 0 12px rgba(255, 179, 0, 0.4), 0 0 40px rgba(255, 179, 0, 0.15)',
        'neon-emerald': '0 0 12px rgba(0, 230, 118, 0.4), 0 0 40px rgba(0, 230, 118, 0.15)',
        'neon-rose': '0 0 12px rgba(255, 64, 129, 0.4), 0 0 40px rgba(255, 64, 129, 0.15)',
        glass: '0 4px 30px rgba(0, 0, 0, 0.3)',
        'glass-lg': '0 8px 40px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'aurora': 'radial-gradient(ellipse 120% 60% at 50% -10%, rgba(255,45,123,0.18) 0%, rgba(0,229,255,0.12) 40%, transparent 70%)',
        'aurora-subtle': 'radial-gradient(ellipse 100% 50% at 50% -10%, rgba(255,45,123,0.08) 0%, rgba(0,229,255,0.06) 40%, transparent 70%)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'aurora': 'aurora 12s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s linear infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 229, 255, 0.3), 0 0 40px rgba(0, 229, 255, 0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.5), 0 0 60px rgba(0, 229, 255, 0.2)' },
        },
        'glow': {
          '0%': { textShadow: '0 0 10px rgba(0, 229, 255, 0.5)' },
          '100%': { textShadow: '0 0 20px rgba(0, 229, 255, 0.8), 0 0 40px rgba(0, 229, 255, 0.4)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'aurora': {
          '0%': { opacity: '0.6', transform: 'scale(1) translateY(0)' },
          '100%': { opacity: '1', transform: 'scale(1.05) translateY(-8px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
