function range(start, end, increment = 1) {
  const count = Math.floor((end - start + increment) / increment)
  return Array(count)
    .fill(0)
    .map((_, idx) => start + idx * increment)
}

const minFontSize = 2
const maxFontSize = 140

const minFlexSize = 1
const maxFlexSize = 12

const minSpacingPixel = 0
const maxSpacingPixel = 1200
const spacingPixelIncrement = 2

const vhs = ['10vh', '20vh', '30vh', '40vh', '50vh', '60vh', '70vh', '80vh', '90vh', '100vh']

const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/views/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {},
      fontFamily: {},
      width: {},
      container: {
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '6rem',
        },
      },
      screens: {
        xs: '480px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      keyframes: {
        spinning: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
      },
      animation: {
        spinning: 'spinning 3s linear infinite',
      },
      flex: {
        ...range(minFlexSize, maxFlexSize).reduce((merged, f) => ({ ...merged, [f]: `${f} ${f} 0%` }), {}),
        none: 'none',
      },
      fontSize: {
        ...range(minFontSize, maxFontSize).reduce((merged, f) => ({ ...merged, [f]: `${f}px` }), {}),
      },
      spacing: {
        ...range(minSpacingPixel, maxSpacingPixel, spacingPixelIncrement).reduce(
          (merged, f) => ({ ...merged, [f]: `${f}px` }),
          {},
        ),
      },
      lineHeight: {
        ...range(minSpacingPixel, maxSpacingPixel, spacingPixelIncrement).reduce(
          (merged, f) => ({ ...merged, [f]: `${f}px` }),
          {},
        ),
      },
      maxWidth: {
        ...range(minSpacingPixel, maxSpacingPixel, spacingPixelIncrement).reduce(
          (merged, f) => ({ ...merged, [f]: `${f}px` }),
          {},
        ),
      },
      minWidth: {
        ...range(minSpacingPixel, maxSpacingPixel, spacingPixelIncrement).reduce(
          (merged, f) => ({ ...merged, [f]: `${f}px` }),
          {},
        ),
      },
      maxHeight: {
        ...range(minSpacingPixel, maxSpacingPixel, spacingPixelIncrement).reduce(
          (merged, f) => ({ ...merged, [f]: `${f}px` }),
          {},
        ),
        ...vhs.reduce((merged, vh) => ({ ...merged, [vh]: vh }), {}),
      },
      minHeight: {
        ...range(minSpacingPixel, maxSpacingPixel, spacingPixelIncrement).reduce(
          (merged, f) => ({ ...merged, [f]: `${f}px` }),
          {},
        ),
        ...vhs.reduce((merged, vh) => ({ ...merged, [vh]: vh }), {}),
      },
    },
  },
}

export default config
