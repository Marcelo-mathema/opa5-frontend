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
    localStorage.removeItem('opa5_token')
    localStorage.removeItem('opa5_user')
    set({ user: null, token: null })
  },
}))
