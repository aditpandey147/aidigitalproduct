// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};  // Keep this if you want to see errors
  console.debug = () => {};
  console.info = () => {};
}