/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lava-black': '#0F0F0F',
        'lava-orange': '#FF4D00',
        'fiery-yellow': '#FFAA00',
        'charcoal': '#1A1A1A',
        'off-white': '#F0F0F0',
      },
      backgroundImage: {
        'lava-gradient': 'linear-gradient(to right, #FF4D00, #FFAA00)',
        'lava-gradient-reverse': 'linear-gradient(to right, #FFAA00, #FF4D00)',
        'magenta-orange': 'linear-gradient(to right, #FF00FF, #FF4D00)',
      },
      boxShadow: {
        'lava-glow': '0 0 15px #FF4D00',
        'lava-glow-intense': '0 0 25px #FF4D00',
        'magenta-glow': '0 0 10px #FF00FF',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px #FF4D00' },
          '50%': { boxShadow: '0 0 25px #FF4D00, 0 0 35px #FF4D00' },
        }
      }
    },
  },
  plugins: [],
}

