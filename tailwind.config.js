/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: '#7C6FCD',
        'primary-light': '#A89EE0',
        'primary-dark': '#5A4FB5',
        accent: '#FF6B6B',
        success: '#4ECDC4',
        warning: '#FFE66D',

        // Neutrals (Dark Mode-first)
        background: {
          DEFAULT: '#0F0F0F',
          card: '#1A1A1A',
          elevated: '#252525',
        },
        surface: {
          DEFAULT: '#1A1A1A',
          elevated: '#252525',
          border: '#2E2E2E',
        },
        text: {
          primary: '#F5F5F5',
          secondary: '#9A9A9A',
          muted: '#5A5A5A',
        },

        // Light Mode overrides (used with dark: prefix in NativeWind)
        light: {
          background: '#F8F8F8',
          card: '#FFFFFF',
          elevated: '#EFEFEF',
          text: '#0F0F0F',
          'text-secondary': '#6B6B6B',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
