import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'
import pathpilotLogo from './assets/Pathpilot.png'

// Only execute in browser environment (not during SSR)
if (typeof document !== 'undefined') {
  const iconLink = document.querySelector("link[rel*='icon']") || document.createElement('link')
  iconLink.type = 'image/png'
  iconLink.rel = 'icon'
  iconLink.href = pathpilotLogo
  document.head.appendChild(iconLink)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
