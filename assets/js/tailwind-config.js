/* Paleta UABC + modo oscuro en Tailwind */
    const UABC_GREEN = '#0b6b3a';
    const UABC_GOLD  = '#c9a227';
    const UABC_DARK  = '#083321';

    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            display: ['Inter', 'sans-serif']
          },
          colors: {
            primary: {
              50:'#ecf7f1',100:'#d6efe2',200:'#a7dfc2',300:'#77cfa3',400:'#47bf83',
              500: UABC_GREEN, 600:'#0a5f35',700:'#094f2c',800:'#0a4226',900: UABC_DARK
            },
            accent: {
              50:'#fff8e6',100:'#ffefc2',200:'#ffe28a',300:'#ffd452',400:'#ffca2e',
              500: UABC_GOLD, 600:'#b88a1e',700:'#8f6b18',800:'#6b5012',900:'#513d0e'
            },
            slateDeep: '#0f172a'
          },
          boxShadow: {
            soft: '0 10px 25px -10px rgba(2,6,23,0.25)',
            glow: '0 0 15px rgba(201, 162, 39, 0.3)'
          },
          animation: {
            'fade-in': 'fadeIn 0.3s ease-in',
            float: 'float 6s ease-in-out infinite'
          },
          keyframes: {
            fadeIn: { '0%':{opacity:'0',transform:'translateY(10px)'}, '100%':{opacity:'1',transform:'translateY(0)'} },
            float:   { '0%,100%':{transform:'translateY(0)'}, '50%':{transform:'translateY(-10px)'} }
          }
        }
      }
    }
