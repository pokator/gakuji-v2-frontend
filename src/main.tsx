import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/fonts.css'
// Fonts loaded via Google Fonts in `src/styles/fonts.css`
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
