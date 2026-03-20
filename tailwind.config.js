/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Background and text colors */
        bg: 'var(--color-bg)',
        'bg-text': 'var(--color-bg-text)',
        
        /* Surface colors (cards, panels, modals) */
        surface: 'var(--color-surface)',
        'surface-text': 'var(--color-surface-text)',
        
        /* Semantic colors */
        primary: 'var(--color-primary)',
        'primary-text': 'var(--color-primary-text)',
        secondary: 'var(--color-secondary)',
        'secondary-text': 'var(--color-secondary-text)',
        
        /* State colors */
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        muted: 'var(--color-muted)',
        'muted-text': 'var(--color-muted-text)',
        
        /* Borders */
        border: 'var(--color-border)',
        
        /* Warning color for Kanji cards */
        warning: 'var(--color-warning)',
        'warning-text': 'var(--color-warning-text)',
        'warning-bg': 'var(--color-warning)',
        'warning-border': 'var(--color-warning-border)',
        
        /* Button colors */
        'btn-primary': 'var(--btn-primary-bg)',
        'btn-primary-hover': 'var(--btn-primary-bg-hover)',
        'btn-secondary': 'var(--btn-secondary-bg)',
        'btn-secondary-hover': 'var(--btn-secondary-bg-hover)',
        'btn-danger': 'var(--btn-danger-bg)',
        'btn-danger-hover': 'var(--btn-danger-bg-hover)',
        'btn-accent': 'var(--btn-accent-bg)',
        'btn-accent-hover': 'var(--btn-accent-bg-hover)'
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
