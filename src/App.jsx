// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { authAPI } from './services/api'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PlanoForm from './pages/PlanoForm'
import Admin from './pages/Admin'

import Precos from './pages/Precos'
import PagamentoSucesso from './pages/PagamentoSucesso'

function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    const token = localStorage.getItem('opa5_token')
    if (!token) return

    authAPI
      .me()
      .then((user) => {
        setAuth(user, token)
      })
      .catch(() => {
        logout()
      })
  }, [setAuth, logout])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
          },
          success: { iconTheme: { primary: 'var(--teal)', secondary: 'white' } },
        }}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/plano/:id" element={<PrivateRoute><PlanoForm /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/precos" element={<Precos />} />
        <Route path="/pagamento/sucesso" element={<PrivateRoute><PagamentoSucesso /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}