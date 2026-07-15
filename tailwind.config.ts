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
        cyber: {
          bg: '#0a0e1a',
          card: '#111827',
          border: '#1e293b',
        },
      },
      boxShadow: {
        neon: '0 0 10px rgba(34, 211, 238, 0.3), 0 0 40px rgba(34, 211, 238, 0.1)',
        'neon-strong': '0 0 10px rgba(34, 211, 238, 0.5), 0 0 40px rgba(34, 211, 238, 0.2), 0 0 80px rgba(34, 211, 238, 0.1)',
        'neon-emerald': '0 0 10px rgba(52, 211, 153, 0.3), 0 0 40px rgba(52, 211, 153, 0.1)',
        'neon-rose': '0 0 10px rgba(244, 63, 94, 0.3), 0 0 40px rgba(244, 63, 94, 0.1)',
        'neon-amber': '0 0 10px rgba(251, 191, 36, 0.3), 0 0 40px rgba(251, 191, 36, 0.1)',
        'neon-purple': '0 0 10px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.1)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(34, 211, 238, 0.3), 0 0 40px rgba(34, 211, 238, 0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(34, 211, 238, 0.5), 0 0 60px rgba(34, 211, 238, 0.2)' },
        },
        'glow': {
          '0%': { textShadow: '0 0 10px rgba(34, 211, 238, 0.5)' },
          '100%': { textShadow: '0 0 20px rgba(34, 211, 238, 0.8), 0 0 40px rgba(34, 211, 238, 0.4)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
