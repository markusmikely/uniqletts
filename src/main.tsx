import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

// Keep the router in sync with Vite's base path, so the app works whether
// it's served from the domain root or a sub-directory (e.g. /new/).
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

createRoot(root).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>
)
