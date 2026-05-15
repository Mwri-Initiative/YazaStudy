import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E8B57',
          dark: '#1a5c3a',
          light: '#3fa872',
        },
        secondary: {
          DEFAULT: '#FFC107',
          dark: '#e6a800',
          light: '#ffca28',
        },
        accent: {
          DEFAULT: '#2196F3',
          dark: '#1976D2',
          light: '#42a5f5',
        },
        background: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
        },
        surface: {
          DEFAULT: '#334155',
          light: '#475569',
          dark: '#1e293b',
        },
        text: {
          DEFAULT: '#F8FAFC',
          secondary: '#CBD5E1',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
