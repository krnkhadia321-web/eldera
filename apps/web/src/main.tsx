import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'
import api from './lib/api'
import { useAuthStore } from './store/authStore'

async function init() {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const res = await api.get('/auth/me')
      useAuthStore.getState().setAuth(res.data.data, token)
    } catch {
      localStorage.removeItem('token')
    }
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
}

init()