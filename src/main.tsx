import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/onest'
import '@fontsource-variable/newsreader'
import '@fontsource-variable/newsreader/wght-italic.css'
import './styles/global.css'
import './styles/app.css'
import App from './App'
import { useApp } from './state/store'

// apply persisted theme before first paint
document.documentElement.setAttribute('data-theme', useApp.getState().theme)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
