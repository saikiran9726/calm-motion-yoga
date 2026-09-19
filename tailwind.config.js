/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#123B35',
          hover: '#0E2E29',
          light: '#1B524A',
          subtle: '#E8EFEA',
        },
        sage: {
          DEFAULT: '#DDEBE4',
          dark: '#BACFC5',
          light: '#F2F7F4',
        },
        offwhite: '#F7F8F5',
        sand: {
          DEFAULT: '#E9DFCF',
          light: '#F5EFE6',
          dark: '#D8C7B0',
        },
        lavender: {
          DEFAULT: '#E7E3F3',
          light: '#F3F1FA',
          dark: '#CFC7E5',
        },
        coral: {
          DEFAULT: '#E9A99A',
          light: '#F8E6E2',
          dark: '#D68978',
        },
        primary: '#17201D',
        secondary: '#69736F',
        border: {
          subtle: '#E6E9E4',
          DEFAULT: '#D9DFD9',
        },
      },
      borderRadius: {
        'card': '24px',
        'card-sm': '20px',
        'input': '16px',
        'input-sm': '14px',
        'button': '16px',
        'pill': '9999px',
      },
      fontFamily: {
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'display': ['32px', { lineHeight: '38px', fontWeight: '700' }],
        'heading': ['24px', { lineHeight: '30px', fontWeight: '600' }],
        'title': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '22px', fontWeight: '400' }],
        'body-medium': ['16px', { lineHeight: '22px', fontWeight: '500' }],
        'caption': ['14px', { lineHeight: '18px', fontWeight: '400' }],
        'caption-medium': ['14px', { lineHeight: '18px', fontWeight: '500' }],
        'metadata': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(18, 59, 53, 0.04)',
        'card': '0 4px 20px rgba(18, 59, 53, 0.05)',
        'floating': '0 12px 32px rgba(18, 59, 53, 0.08)',
        'modal': '0 -4px 30px rgba(18, 59, 53, 0.08)',
      },
      transitionDuration: {
        'fast': '180ms',
        'calm': '280ms',
        'gentle': '480ms',
      },
      transitionTimingFunction: {
        'calm': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
      },
    },
  },
  plugins: [],
}
