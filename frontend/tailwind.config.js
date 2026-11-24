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
        sans: ['"Inter"', '"Plus Jakarta Sans"', '"Manrope"', '"Outfit"', 'sans-serif'],
        serif: ['"Lora"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        navy: {
          DEFAULT: '#0F225C',
          surface: '#1E293B',
          muted: '#64748B',
          border: '#E2E8F0',
        },
        brand: {
          DEFAULT: '#284BB3',
          dark: '#1A3884',
          cyan: '#18D5FF',
          green: '#38D996',
          dim: 'rgba(24, 213, 255, 0.1)',
          glow: 'rgba(24, 213, 255, 0.4)',
        },
        canvas: {
          DEFAULT: '#F8FAFC',
          surface: '#FFFFFF',
        },
        emerald: {
          DEFAULT: '#38D996',
          dim: 'rgba(56, 217, 150, 0.1)',
        },
        amber: {
          DEFAULT: '#F59E0B',
          dim: 'rgba(245, 158, 11, 0.1)',
        },
        coral: {
          DEFAULT: '#F87171',
          dim: 'rgba(248, 113, 113, 0.1)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'primary-gradient': 'linear-gradient(135deg, #0F225C 0%, #1A3884 100%)',
        'cta-gradient': 'linear-gradient(to right, #284BB3, #18D5FF)',
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(15, 34, 92, 0.15), 0 0 10px rgba(15, 34, 92, 0.05)',
        'premium-hover': '0 20px 40px -10px rgba(24, 213, 255, 0.25), 0 0 15px rgba(24, 213, 255, 0.15)',
        'glow': '0 0 20px rgba(24, 213, 255, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'ecg': 'ecg 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 3s',
        'rotate-slow': 'rotateSlow 20s linear infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ecg: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        rotateSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 10px 40px -10px rgba(24, 213, 255, 0.4)' },
          '50%': { transform: 'scale(1.02)', boxShadow: '0 15px 45px -5px rgba(24, 213, 255, 0.6)' },
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
