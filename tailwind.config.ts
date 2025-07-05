/** @format */

//import { archivo } from '@/styles/font';
import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      width: {
        custom: '1200px',
      },
      maxWidth: {
        '8xl': '90rem',     // 1440px
        '9xl': '96rem',     // 1536px
        '10xl': '104rem',   // 1664px
      },
      fontFamily: {
        display: ['Clash Display', 'sans-serif'],
        // archivo: archivo.style.fontFamily,
        // 'clash-display': ['Clash Display', 'sans-serif'],
      },
      // maxWidth: {
      //   'custom': '1200px',
      // },
    },
  },
  plugins: [],
} satisfies Config;
