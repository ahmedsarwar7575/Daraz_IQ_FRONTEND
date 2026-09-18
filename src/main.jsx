import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const app = (
  <StrictMode>
    <App />
  </StrictMode>
)
const root = document.getElementById('root')
let hasSession = false
try {
  hasSession = Boolean(localStorage.getItem('daraz_console_session'))
} catch {
  /* Storage can be disabled by the browser. */
}
if (root.dataset.prerendered && !hasSession) hydrateRoot(root, app)
else createRoot(root).render(app)
