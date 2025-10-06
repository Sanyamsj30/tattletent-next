/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5b6bf7',
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ... rest of primary colors
          950: '#082f49',
        },
        secondary: {
          // ... secondary colors
          950: '#020617',
        },
        accent: {
          // ... accent colors
          950: '#052e16',
        },
        gold: {
          // ... gold colors
          950: '#451a03',
        },
      },
      // 🌟 Corrected Location for animation/keyframes 🌟
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        //'marquee': 'marquee 40s linear infinite', // Keep this one
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
       
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
        'gradient-accent': 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
        'gradient-gold': 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -10px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}