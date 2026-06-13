import type { Config } from 'tailwindcss';

// Design tokens — SPEC §5.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        shell: '#16151D', // app background (deep ink)
        'shell-2': '#1E1D27', // raised surfaces / cards
        paper: '#FFFDF8', // reading surface
        ink: '#23222B', // text on paper
        muted: '#6B6A75', // secondary text
        line: '#2A2935', // borders on dark
        'line-paper': '#E7E2D6', // borders on paper
        accent: '#FF6B5A', // primary action
        'accent-ink': '#241007', // text on accent
        mark: '#FFE39A', // active-sentence highlight
        done: '#8C8678', // already-read text on paper
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        reading: ['Newsreader', 'serif'],
        ui: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '13px',
      },
    },
  },
  plugins: [],
} satisfies Config;
