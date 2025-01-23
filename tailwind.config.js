// @ts-check
import { createPreset } from 'fumadocs-ui/tailwind-plugin';
const defaultTheme = require('tailwindcss/defaultTheme')
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
    './mdx-components.{ts,tsx}',
    './node_modules/fumadocs-ui/dist/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Fira Code VF', ...defaultTheme.fontFamily.mono],
      }
    }
  },
  presets: [createPreset()],
};
