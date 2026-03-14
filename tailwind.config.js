export default {
  content: ['./index.html', './src/**/*.js', './src/**/*.jsx'],
  theme: {
    extend: {
      colors: {
        ink: '#0b0b10',
        slate: '#1f2430',
        fog: '#a8b0c2',
        mint: '#7bf3c0',
        coral: '#ff7a6e',
        glow: '#f5f1ff'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif']
      },
      boxShadow: {
        soft: '0 10px 30px rgba(11, 11, 16, 0.18)'
      }
    }
  },
  plugins: []
};
