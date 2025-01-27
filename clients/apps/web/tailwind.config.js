/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')
const plugin = require('tailwindcss/plugin')

const toRgba = (hexCode, opacity = 50) => {
  let hex = hexCode.replace('#', '')

  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
  }

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return `rgba(${r},${g},${b},${opacity / 100})`
}

const flattenColorPalette = (obj, sep = '-') =>
  Object.assign(
    {},
    ...(function _flatten(o, p = '') {
      return [].concat(
        ...Object.keys(o).map((k) =>
          typeof o[k] === 'object'
            ? _flatten(o[k], k + sep)
            : { [p + k]: o[k] },
        ),
      )
    })(obj),
  )

module.exports = {
  mode: 'jit',
  content: [
    './src/**/*.{ts,tsx}',
    'node_modules/polarkit/src/**/*.{ts,tsx}',
    '.storybook/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      display: '350',
    },
    extend: {
      backgroundImage: {
        'grid-pattern':
          'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABSSURBVHgB7dihEYBAEATBf/JPEksEOCgEAYw70W3OTp3cvYY5r/v57rGGElYJq4RVwiphlbBKWCWsElYJq4RVwiphlbBKWCWsElbtf/OcZuzHXh9bB88+HN8BAAAAAElFTkSuQmCC")',
        'grid-pattern-dark':
          'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABTSURBVHgB7dihEYBAEATBf9LCEQj5ZwGFIIBxJ7rN2amTu9cw53U/3z3WUMIqYZWwSlglrBJWCauEVcIqYZWwSlglrBJWCauEVcKq/W+e04z92AukgAP/IH2i4wAAAABJRU5ErkJggg==")',
      },
      borderColor: {
        DEFAULT: 'rgb(0 0 0 / 0.07)',
      },
      boxShadow: {
        DEFAULT: `0 0px 15px rgba(0 0 0 / 0.04), 0 0px 2px rgba(0 0 0 / 0.06)`,
        lg: '0 0px 20px rgba(0 0 0 / 0.04), 0 0px 5px rgba(0 0 0 / 0.06)',
        xl: '0 0px 30px rgba(0 0 0 / 0.04), 0 0px 10px rgba(0 0 0 / 0.06)',
        hidden: '0 1px 8px rgb(0 0 0 / 0), 0 0.5px 2.5px rgb(0 0 0 / 0)',
        up: '-2px -2px 22px 0px rgba(61, 84, 171, 0.15)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        blue: {
          DEFAULT: '#0062FF',
          50: '#E5EFFF',
          100: '#CCE0FF',
          200: '#99C0FF',
          300: '#66A1FF',
          400: '#3381FF',
          500: '#0062FF',
          600: '#0054DB',
          700: '#0047B8',
          800: '#003994',
          900: '#002B70',
          950: '#00245E'
        },
        gray: {
          50: '#FDFDFF',
          75: '#F8F9FB',
          100: '#F3F4F7',
          200: '#E3E7ED',
          300: '#D0D7E1',
          400: '#A2AEC3',
          500: '#78859B',
          600: '#5F6C81',
          700: '#4A5363',
          800: '#343B46',
          900: '#1E2229',
          950: '#13161A'
        },
        green: {
          50: '#f0faf0',
          100: '#e2f6e3',
          200: '#c5edc6',
          300: '#97de9a',
          400: '#62c667',
          500: '#3fab44',
          600: '#2d8c31',
          700: '#266f29',
          800: '#235826',
          900: '#1e4921',
          950: '#0e2f11',
        },
        red: {
          50: '#fdf3f3',
          100: '#fde3e3',
          200: '#fbcdcd',
          300: '#f8a9a9',
          400: '#f17878',
          500: '#e64d4d',
          600: '#d32f2f',
          700: '#b12424',
          800: '#922222',
          900: '#6f1f1f',
          950: '#420d0d',
        },
        polar: {
          50: '#D2D4DF',
          100: '#C2C4D3',
          200: '#A1A5BB',
          300: '#8186A4',
          400: '#636989',
          500: '#4C5069',
          600: '#343748',
          700: '#1D1E27',
          800: '#16171F',
          900: '#101116',
          950: '#0C0D11'
        },

        // chadcn/ui start
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // chadcn/ui end
      },

      // chadcn/ui start
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      // chadcn/ui end
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-radix')(),
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    plugin(function ({ addUtilities }) {
      const utilityStyles = {
        '.text-4xl': {
          fontWeight: '400',
          fontFamily: ['var(--font-inter)', defaultTheme.fontFamily.sans].toString(),
        },
      }
      utilityStyles['.text-5xl'] = utilityStyles['.text-4xl']
      utilityStyles['.text-6xl'] = utilityStyles['.text-4xl']
      utilityStyles['.text-7xl'] = utilityStyles['.text-4xl']
      utilityStyles['.text-8xl'] = utilityStyles['.text-4xl']
      utilityStyles['.text-9xl'] = utilityStyles['.text-4xl']

      utilityStyles['.bg-grid-pattern'] = {
        backgroundSize: '19px 19px',
      }

      addUtilities(utilityStyles)
    }),

    // Striped backgrounds
    function ({ addUtilities, theme }) {
      const utilities = {
        '.bg-stripes': {
          backgroundImage:
            'linear-gradient(45deg, var(--stripes-color) 12.50%, transparent 12.50%, transparent 50%, var(--stripes-color) 50%, var(--stripes-color) 62.50%, transparent 62.50%, transparent 100%)',
          // backgroundSize: '5.66px 5.66px',
          backgroundSize: '20px 20px',
        },
      }

      const addColor = (name, color) =>
        (utilities[`.bg-stripes-${name}`] = { '--stripes-color': color })

      const colors = flattenColorPalette(theme('backgroundColor'))
      for (let name in colors) {
        try {
          const [r, g, b, a] = toRgba(colors[name])
          if (a !== undefined) {
            addColor(name, colors[name])
          } else {
            addColor(name, `rgba(${r}, ${g}, ${b}, 0.4)`)
          }
        } catch (_) {
          addColor(name, colors[name])
        }
      }

      addUtilities(utilities)
    },
  ],
}
