/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          50:  '#eef2ff',
          100: '#dde6ff',
          200: '#c0cfff',
          300: '#93aef8',
          400: '#6080f0',
          500: '#3b5ce8',
          600: '#2146d4',
          700: '#1a3a9c',
          800: '#112670',
          900: '#0a1840',
        },
        sky: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 16px 0 rgba(10,24,64,0.08)',
        'card-hover': '0 8px 32px 0 rgba(10,24,64,0.18)',
        'blue': '0 4px 24px 0 rgba(26,58,156,0.28)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 40%, #dbeafe 100%)',
        'section-gradient': 'linear-gradient(180deg, #eff6ff 0%, #FFFFFF 100%)',
        'cta-gradient': 'linear-gradient(135deg, #1a3a9c 0%, #0a1840 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out both',
        'fade-in': 'fadeIn 0.5s ease-out both',
        'slide-right': 'slideRight 0.5s ease-out both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
