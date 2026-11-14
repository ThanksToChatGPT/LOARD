import type { Config } from 'tailwindcss';

// Tokens de design.md. Los valores viven en src/styles/tokens.css;
// aquí solo se les da nombre para usarlos como clases (bg-surface, text-error…).
const COLOR_TOKENS = [
  'primary', 'primary-hover', 'on-primary',
  'surface', 'on-surface', 'on-surface-muted',
  'surface-container', 'surface-container-low', 'surface-container-high',
  'outline', 'outline-variant', 'focus-ring',
  'success', 'success-subtle', 'success-border',
  'warning', 'warning-subtle', 'warning-border', 'on-warning',
  'error', 'error-subtle', 'error-border',
  'info', 'info-subtle', 'info-border',
  'inverse-surface', 'inverse-on-surface', 'inverse-primary',
  'scrim',
  'nav-surface', 'on-nav', 'on-nav-muted', 'nav-active', 'nav-indicator',
] as const;

const colors = Object.fromEntries(COLOR_TOKENS.map((t) => [t, `var(--${t})`]));

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Reemplaza sm/md/lg: retícula 4 (móvil) – 8 (tableta) – 12 (escritorio).
    screens: { tablet: '600px', desktop: '1024px' },
    colors: { transparent: 'transparent', current: 'currentColor', ...colors },
    fontFamily: {
      sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      'display-lg': ['36px', { lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '700' }],
      'display-lg-mobile': ['28px', { lineHeight: '36px', letterSpacing: '-0.01em', fontWeight: '700' }],
      'headline-lg': ['28px', { lineHeight: '36px', letterSpacing: '-0.01em', fontWeight: '600' }],
      'headline-lg-mobile': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
      'headline-md': ['22px', { lineHeight: '28px', fontWeight: '600' }],
      'headline-sm': ['18px', { lineHeight: '24px', fontWeight: '600' }],
      'title-lg': ['16px', { lineHeight: '22px', fontWeight: '600' }],
      'title-md': ['14px', { lineHeight: '20px', fontWeight: '600' }],
      'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
      'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
      'body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      'label-lg': ['14px', { lineHeight: '20px', fontWeight: '500' }],
      'label-md': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      'label-sm': ['11px', { lineHeight: '14px', letterSpacing: '0.04em', fontWeight: '500' }],
    },
    borderRadius: {
      none: '0',
      sm: '4px',
      DEFAULT: '6px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
    boxShadow: {
      none: 'none',
      1: 'var(--shadow-1)',
      2: 'var(--shadow-2)',
    },
    extend: {
      spacing: {
        'gutter-xs': '4px',
        'gutter-sm': '8px',
        'gutter-md': '16px',
        'gutter-lg': '24px',
        'gutter-xl': '32px',
        section: '40px',
        touch: '48px',
        'touch-field': '56px',
        sidebar: '256px',
        topbar: '64px',
      },
      transitionDuration: {
        state: '150ms',
        enter: '200ms',
        exit: '150ms',
      },
      transitionTimingFunction: {
        enter: 'cubic-bezier(0.16, 1, 0.3, 1)',
        exit: 'cubic-bezier(0.7, 0, 0.84, 0)',
      },
      keyframes: {
        'error-shake': {
          '0%': { transform: 'translateX(0)' },
          '33%': { transform: 'translateX(-4px)' },
          '66%': { transform: 'translateX(4px)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
        'pop-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-out-right': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } },
        'slide-in-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        'slide-out-left': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-100%)' } },
        indeterminate: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(250%)' },
        },
      },
      animation: {
        'error-shake': 'error-shake 150ms ease-out',
        'fade-in': 'fade-in 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-out': 'fade-out 150ms cubic-bezier(0.7, 0, 0.84, 0) both',
        'pop-in': 'pop-in 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slide-in-right 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-out-right': 'slide-out-right 150ms cubic-bezier(0.7, 0, 0.84, 0) both',
        'slide-in-left': 'slide-in-left 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-out-left': 'slide-out-left 150ms cubic-bezier(0.7, 0, 0.84, 0) both',
        indeterminate: 'indeterminate 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
