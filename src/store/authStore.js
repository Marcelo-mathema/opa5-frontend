// src/store/authStore.js
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('opa5_user') || 'null'),
  token: localStorage.getItem('opa5_token') || null,

  setAuth: (user, token) => {
    localStorage.setItem('opa5_token', token)
    localStorage.setItem('opa5_user', JSON.stringify(user))
    set({ user, token })
  },

  logout: () => {
    // Limpa todas as chaves do OPA e qualquer dado residual
    localStorage.removeItem('opa5_token')
    localStorage.removeItem('opa5_user')
    sessionStorage.clear()
    // Limpa cookies de sessão do navegador
    document.cookie.split(';').forEach(c => {
      document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/'
    })
    set({ user: null, token: null })
  },
}))
