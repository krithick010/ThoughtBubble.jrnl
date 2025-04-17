module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        float1: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        float2: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-15px) translateX(10px)' },
        },
        float3: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '33%': { transform: 'translateY(-10px) translateX(-15px)' },
          '66%': { transform: 'translateY(5px) translateX(10px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.25', transform: 'scale(0.8)' },
          '50%': { opacity: '0.9', transform: 'scale(1)' },
        },
        'shooting-star': {
          '0%': { 
            opacity: '0',
            transform: 'translateX(0) translateY(0) rotate(-15deg) scale(0.5)'
          },
          '1%': { 
            opacity: '1',
            transform: 'translateX(0) translateY(0) rotate(-15deg) scale(1)'
          },
          '5%': { 
            opacity: '0.8', 
            transform: 'translateX(100px) translateY(20px) rotate(-15deg) scale(1)'
          },
          '6%': { 
            opacity: '0', 
            transform: 'translateX(150px) translateY(30px) rotate(-15deg) scale(0.5)'
          },
          '100%': { 
            opacity: '0', 
            transform: 'translateX(150px) translateY(30px) rotate(-15deg) scale(0.5)'
          }
        },
        'bubble-float': {
          '0%': { transform: 'translateY(100vh) scale(1)' },
          '100%': { transform: 'translateY(-100vh) scale(0.5)' }
        }
      },
      animation: {
        'float-1': 'float1 8s ease-in-out infinite',
        'float-2': 'float2 12s ease-in-out infinite',
        'float-3': 'float3 10s ease-in-out infinite',
        'twinkle': 'twinkle 5s ease-in-out infinite',
        'shooting-star': 'shooting-star 10s linear infinite',
        'bubble-float': 'bubble-float 25s linear infinite'
      },
      backgroundImage: {
      }
    },
  },
  plugins: [],
};