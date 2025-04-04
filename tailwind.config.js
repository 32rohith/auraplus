/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode - Warm sage/green tones for growth, safety and nurturing
        sage: {
          50: '#F2F7F2',  // Almost white sage
          100: '#E6F0E6',  // Very light sage
          200: '#D1E4D1',  // Light sage
          300: '#B4D0B4',  // Soft sage
          400: '#94BA94',  // Medium sage
          500: '#77A677',  // True sage
          600: '#5E8D5E',  // Deep sage
          700: '#4D774D',  // Forest sage
          800: '#3C603C',  // Dark sage
          900: '#2C482C',  // Very dark sage
        },
        // Dark mode - Serene blues for trust, reliability and calm
        serene: {
          50: '#F0F7FF',  // Lightest sky blue
          100: '#E0F0FF',  // Very light blue
          200: '#C2E0FF',  // Light blue
          300: '#99CCFF',  // Sky blue
          400: '#66A3FF',  // Clear blue
          500: '#3366FF',  // True blue
          600: '#0047CC',  // Strong blue
          700: '#003DB8',  // Deep blue
          800: '#00308F',  // Navy blue
          900: '#002266',  // Dark navy blue
        },
        // Warm accent colors for empathy and compassion
        terra: {
          50: '#FFF5F0',  // Lightest terracotta
          100: '#FFEAE0',  // Very light terracotta
          200: '#FFD0B8',  // Light terracotta
          300: '#FFB499',  // Soft terracotta
          400: '#FF967A',  // Medium terracotta
          500: '#FF7D5C',  // True terracotta
          600: '#E65C3B',  // Deep terracotta
          700: '#CC461F',  // Strong terracotta
          800: '#993010',  // Dark terracotta
          900: '#661F08',  // Very dark terracotta
        },
        // Soft lavender for wisdom and dignity
        lavender: {
          50: '#F7F4FF',  // Lightest lavender
          100: '#F0EAFF',  // Very light lavender
          200: '#E1D5FF',  // Light lavender
          300: '#C7B2FF',  // Soft lavender
          400: '#AC8FFF',  // Medium lavender
          500: '#8F66FF',  // True lavender
          600: '#7047E6',  // Deep lavender
          700: '#5C33CC',  // Strong lavender
          800: '#472699',  // Dark lavender
          900: '#331A66',  // Very dark lavender
        }
      },
      backgroundImage: {
        'gradient-light': 'linear-gradient(to bottom, #F2F7F2, #E6F0E6)',
        'gradient-dark': 'linear-gradient(to bottom, #0A1A2F, #001F40)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Quicksand', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-light': '0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'soft-dark': '0 4px 12px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [],
};
