/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1200px', '2xl': '1320px' },
    },
    extend: {
      colors: {
        // Brand — vivid coral/orange (sunset feel)
        coral: {
          50: '#fff5f1',
          100: '#ffe6dc',
          200: '#ffc8b4',
          300: '#ffa083',
          400: '#ff7a52',
          500: '#ff5b2e',
          600: '#f04018',
          700: '#c82e10',
          800: '#9d2610',
          900: '#7c2010',
        },
        // Accent — electric lime (energy)
        lime: {
          50: '#f4ffe1',
          100: '#e6ffbf',
          200: '#cdff7d',
          300: '#b3ff3d',
          400: '#9cf200',
          500: '#7fd400',
          600: '#5faa00',
          700: '#477f00',
        },
        // Accent 2 — electric sky
        sky: {
          50: '#eefaff',
          100: '#daf2ff',
          200: '#bce7ff',
          300: '#8ed7ff',
          400: '#5cc2ff',
          500: '#33aaff',
          600: '#1b8df0',
          700: '#1770cc',
        },
        // Accent 3 — magenta accent
        magenta: {
          50: '#fff0fa',
          100: '#ffdcf1',
          300: '#ff8ed3',
          500: '#ff3da6',
          700: '#cc1c80',
        },
        ink: {
          50: '#f7f7f8',
          100: '#eeeef0',
          200: '#d9d9de',
          300: '#b8b8c0',
          400: '#8c8c98',
          500: '#646472',
          600: '#484853',
          700: '#34343c',
          800: '#1f1f25',
          900: '#0f0f13',
          950: '#070709',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        // Fluid display scale
        'display-2xl': ['clamp(3.25rem, 6vw + 1rem, 5.5rem)', { lineHeight: '1.02', letterSpacing: '-0.04em', fontWeight: '800' }],
        'display-xl': ['clamp(2.5rem, 4.5vw + 1rem, 4.25rem)', { lineHeight: '1.04', letterSpacing: '-0.035em', fontWeight: '800' }],
        'display-lg': ['clamp(2rem, 3vw + 1rem, 3.25rem)', { lineHeight: '1.08', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-md': ['clamp(1.5rem, 1.5vw + 1rem, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-sm': ['clamp(1.25rem, 0.5vw + 1rem, 1.5rem)', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        // Soft, layered shadows — Silicon Valley polish
        soft: '0 1px 2px rgba(15,15,19,0.04), 0 4px 12px rgba(15,15,19,0.06)',
        lift: '0 2px 4px rgba(15,15,19,0.05), 0 8px 24px rgba(15,15,19,0.08)',
        float: '0 4px 8px rgba(15,15,19,0.06), 0 16px 48px rgba(15,15,19,0.12)',
        glow: '0 0 0 1px rgba(255,91,46,0.15), 0 8px 32px rgba(255,91,46,0.25)',
        ring: '0 0 0 6px rgba(255,91,46,0.12)',
        'inner-soft': 'inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 2px rgba(15,15,19,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pop-in': 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'shimmer': 'shimmer 2.4s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'wiggle': 'wiggle 0.6s ease-in-out',
        'marquee': 'marquee 40s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '60%': { transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'snap': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};