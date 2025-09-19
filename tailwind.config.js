/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'nightshade': {
          50: '#f8f7ff',
          100: '#f0edff',
          200: '#e4dcff',
          300: '#d1c0ff',
          400: '#b898ff',
          500: '#9d6dff',
          600: '#8b47f7',
          700: '#7b34e3',
          800: '#682cbf',
          900: '#56269c',
          950: '#350f6a',
        },
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          from: { textShadow: '0 0 20px #9d6dff' },
          to: { textShadow: '0 0 30px #9d6dff, 0 0 40px #9d6dff' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}