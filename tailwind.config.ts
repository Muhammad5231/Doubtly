import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1320px',
      },
    },
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#090A0F',
          base: '#090A0F',
          card: '#0D0F17',
          surface: '#121520',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.04)',
        },
        elevation: {
          1: 'rgba(255, 255, 255, 0.03)',
          2: 'rgba(255, 255, 255, 0.06)',
          3: 'rgba(255, 255, 255, 0.09)',
        },
        editorial: {
          amber: '#F59E0B',
          amberLight: '#FEF3C7',
          amberDark: '#B45309',
        },
        primary: {
          DEFAULT: '#6366F1',
          foreground: '#FFFFFF',
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#090A0F',
        },
        secondary: {
          DEFAULT: '#06B6D4',
          foreground: '#FFFFFF',
          50: '#ECFEFF',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
        },
        spark: {
          DEFAULT: '#F59E0B',
          foreground: '#111827',
          light: '#FDE68A',
          dark: '#D97706',
        },
        ink: '#090A0F',
        mutedText: '#94A3B8',
        surface: {
          light: '#FFFFFF',
          dark: '#090A0F',
          darkCard: '#0E111B',
          darkBorder: '#1E2333',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
      fontFamily: {
        heading: ['var(--font-jakarta)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'glow-amber': '0 0 20px -4px rgba(245, 158, 11, 0.3)',
        'glow-subtle': '0 0 30px -10px rgba(99, 102, 241, 0.15)',
        'tactile': '0 2px 8px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;

