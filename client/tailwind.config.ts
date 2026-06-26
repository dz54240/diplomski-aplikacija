import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0B0B0F',
          muted: '#5B6271',
          soft: '#8B92A1',
        },
        line: {
          DEFAULT: '#E5E7EB',
          soft: '#EEF0F3',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          sunken: '#F7F8FA',
          tint: '#F2F4F8',
        },
      },
      boxShadow: {
        pop: '0 1px 2px rgba(11,11,15,0.04), 0 8px 24px rgba(11,11,15,0.08)',
        modal: '0 1px 2px rgba(11,11,15,0.04), 0 24px 64px rgba(11,11,15,0.18)',
        card: '0 1px 0 rgba(11,11,15,0.02)',
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '7px',
        lg: '8px',
        xl: '12px',
      },
    },
  },
  plugins: [typography],
} satisfies Config;
