/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}", "./public/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        'pacifico': ['Pacifico', 'sans-serif'],
        'nunito': ['Nunito', 'sans-serif'],
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-left': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(-100%)', opacity: '0' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-out-up': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'wobble': {
          '0%': { transform: 'translate(-50%, -100%) rotateZ(5deg)'},
          '100%': { transform: 'translate(-50%, -100%) rotateZ(25deg)'},
        },
        'inset': {
          '0%': { opacity: '.5', inset: '-4px'},
          '100%': { opacity: '1', inset: '4px'},
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s linear',
        'slide-out-right': 'slide-out-right 0.3s linear forwards',
        'slide-in-left': 'slide-in-left 0.3s linear',
        'slide-out-left': 'slide-out-left 0.3s linear forwards',
        'slide-in-up': 'slide-in-up 0.3s linear',
        'slide-out-up': 'slide-out-up 0.3s linear forwards',
        'wobble': 'wobble 1s ease-in-out infinite alternate',
        'inset': 'inset 1s linear infinite alternate',
      },
		},
	},
  plugins: []
}