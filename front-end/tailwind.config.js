const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  prefix: '',
  purge: {
    content: [
      './src/**/*.{html,ts}',
    ]
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      'xs': '475px',
      ...defaultTheme.screens,
      'md2': '845px',
      '2xl': '1920px',
      '3xl': '2600px',
    },
    extend: {
      colors: {
        'black-1': '#212121',
        'black-2': '#212738',
        'black-3': '#1C1C1C',
        'gray-1': '#616368',
        'gray-2': '#899196',
        'gray-3': '#7f7679',
        'gray-4': '#535353',
        'gray-5': '#A1A1A1',
        'gray-6': '#969696',
        'gray-7': '#585757',
        'silver-1': '#C0C0C0',
        'blue-1': '#E1E7FF',
        'blue-2': '#2A4365',
        'blue-3': '#F5F7FF',
        'blue-4': '#242F51',
        'blue-5': '#375681',
        'blue-6': '#09142E',
        'blue-7': '#0085FF',
        'brown-1': '#CD7F32',
        'yellow-1': '#FEDC22',
        'red-1': '#E92C2C',
      },
      boxShadow: {
        'all': '0 0 20px rgba(115,115,115,0.20)',
        'b-sm': '0 3px 5px rgb(0 0 0 / 9%)',
      },
      height: {
        '420px': '420px',
        '460px': '460px',
        '500px': '500px',
        '600px': '600px',
        '700px': '700px',
        '720px': '720px',
        '800px': '800px',
        '1250px': '1250px',
        '1400px': '1400px',
        '2150px': '2150px',
        '2500px': '2500px',
        '2700px': '2700px',
        '2850px': '2850px',
        '3000px': '3000px',
        '3120px': '3120px',
        '3840px': '3840px',
        '7450px': '7450px',
      },
      minWidth: {
        '72': '288px',
      },
      width: {
        '150': '470px',
        '420px': '420px',
        '460px': '460px',
        '500px': '500px',
        '600px': '600px',
        '700px': '700px',
        '720px': '720px',
        '800px': '800px',
      },
      maxWidth: {
        '8xl': '1600px',
      },
      backgroundImage: {
        'services-background-shapes': "url('/assets/images/services-background-shapes.png')",
      },
      zIndex: {
        '60': '60'
      },
      inset: {
        '400px': '400px',
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/aspect-ratio'), require('@tailwindcss/forms'), require('@tailwindcss/line-clamp'), require('@tailwindcss/typography')],
};
