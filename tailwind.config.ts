import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-primary': 'var(--brand-primary)',
        'brand-secondary': 'var(--brand-secondary)',
        'text-heading': 'var(--text-heading)',
        'brand-red': 'var(--brand-red)',
        'brand-dark': 'var(--brand-dark)',
        'severity-high': 'var(--severity-high)',
        'severity-medium': 'var(--severity-medium)',
        'severity-low': 'var(--severity-low)',
        'status-pass': 'var(--status-pass)',
        'status-warning': 'var(--status-warning)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'bg-primary': 'var(--bg-primary)',
        'bg-card': 'var(--bg-card)',
        border: 'var(--border)',
        'brand-surface': 'var(--brand-surface)',
        'brand-surface-2': 'var(--brand-surface-2)',
        'brand-surface-3': 'var(--brand-surface-3)',
        'brand-border': 'var(--brand-border)',
      },
    },
  },
  plugins: [],
};

export default config;
