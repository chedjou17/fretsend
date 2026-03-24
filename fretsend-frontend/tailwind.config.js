/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        /* ── FretSend Brand Palette (exact logo colors) ─── */
        brand: {
          blue:    '#1C4AA6',   // Bleu marine principal
          cream:   '#F2C49B',   // Crème / saumon clair
          orange:  '#F26E22',   // Orange vif
          red:     '#F2561D',   // Orange-rouge
          white:   '#F2F2F2',   // Blanc cassé / fond
        },
        /* ── Semantic shades ───────────────────────────── */
        primary: {
          50:  '#EEF3FB',
          100: '#D4E0F5',
          200: '#A9C1EB',
          300: '#7EA2E1',
          400: '#5383D7',
          500: '#1C4AA6',  // brand blue
          600: '#163D8C',
          700: '#113072',
          800: '#0B2258',
          900: '#06153E',
        },
        accent: {
          50:  '#FEF4EC',
          100: '#FCDDB8',
          200: '#F9BB71',
          300: '#F7992A',   // orange vif
          400: '#F26E22',   // brand orange
          500: '#F2561D',   // brand red-orange
          600: '#D4460F',
          700: '#B03608',
        },
        surface: {
          DEFAULT: '#F2F2F2',
          card:    '#FFFFFF',
          border:  '#E5E7EB',
          muted:   '#F9FAFB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:   '0 1px 4px 0 rgba(28,74,166,.08), 0 1px 2px 0 rgba(0,0,0,.04)',
        hover:  '0 8px 24px 0 rgba(28,74,166,.15)',
        orange: '0 4px 16px 0 rgba(242,110,34,.35)',
      },
      animation: {
        'float':     'float 6s ease-in-out infinite',
        'ship':      'ship 8s ease-in-out infinite',
        'plane':     'plane 6s ease-in-out infinite',
        'wave':      'wave 3s ease-in-out infinite',
        'fade-up':   'fadeUp 0.6s ease-out',
        'slide-in':  'slideIn 0.4s ease-out',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        float:    { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-12px)' } },
        ship:     { '0%':{ transform:'translateX(-20px)' }, '100%':{ transform:'translateX(20px)' } },
        plane:    { '0%,100%':{ transform:'translate(0,0) rotate(-10deg)' }, '50%':{ transform:'translate(8px,-8px) rotate(-10deg)' } },
        wave:     { '0%,100%':{ transform:'scaleX(1)' }, '50%':{ transform:'scaleX(1.05)' } },
        fadeUp:   { from:{ opacity:'0', transform:'translateY(20px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        slideIn:  { from:{ opacity:'0', transform:'translateX(-16px)' }, to:{ opacity:'1', transform:'translateX(0)' } },
        pulseDot: { '0%,100%':{ opacity:'1', transform:'scale(1)' }, '50%':{ opacity:'.5', transform:'scale(.8)' } },
      },
    },
  },
  plugins: [],
}
