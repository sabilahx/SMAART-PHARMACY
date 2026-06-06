/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Lora"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Deep dark backgrounds
        canvas: {
          DEFAULT: '#0a0d14',
          surface: '#0f1420',
          elevated: '#141929',
          border: '#1e2640',
          muted: '#1a2035',
        },
        // Brand accent — electric teal/cyan
        brand: {
          50:  '#e6fffe',
          100: '#b3fffe',
          200: '#6bfdff',
          300: '#00f5ff',
          400: '#00e1f0',
          500: '#00c2cc',
          600: '#0099a8',
          700: '#007882',
          800: '#005a63',
          900: '#003d43',
        },
        // Emerald for positive
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        // Amber for warning
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        // Red for danger
        red: {
          400: '#f87171',
          500: '#ef4444',
        },
        // Purple for adjustment
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'brand-glow': 'radial-gradient(ellipse at top, rgba(0, 194, 204, 0.08) 0%, transparent 60%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%)',
      },
      boxShadow: {
        'glass': '0 4px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glow-sm': '0 0 20px rgba(0, 194, 204, 0.15)',
        'glow': '0 0 40px rgba(0, 194, 204, 0.2)',
        'card': '0 2px 16px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
