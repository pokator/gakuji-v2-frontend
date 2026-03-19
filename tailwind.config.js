/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-rgb': 'var(--color-primary-rgb)',
        button: 'var(--color-button-bg)',
        'button-text': 'var(--color-button-text)',
        modal: 'var(--color-modal)',
        'modal-text': 'var(--color-modal-text)',
        'modal-rgb': 'var(--color-modal-rgb)',
        panel: 'var(--color-panel)',
        'panel-text': 'var(--color-panel-text)',
        'panel-rgb': 'var(--color-panel-rgb)',
        warning: 'var(--color-warning)',
        'warning-text': 'var(--color-warning-text)',
        'warning-rgb': 'var(--color-warning-rgb)',
        'warning-bg': 'var(--color-warning-bg)',
        'warning-border': 'var(--color-warning-border)',
        accent: 'var(--color-accent)',
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        muted: 'var(--color-muted)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
        border: 'var(--color-border)'
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
      }
    }
  },
  plugins: [],
};
