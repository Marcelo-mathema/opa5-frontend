// src/services/api.js
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('opa5_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('opa5_token')
      localStorage.removeItem('opa5_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: async (username, password) => {
    const form = new FormData()
    form.append('username', username)
    form.append('password', password)
    const res = await api.post('/api/auth/token', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return res.data
  },
  register: (data) => api.post('/api/auth/register', data).then(r => r.data),
  me: () => api.get('/api/auth/me').then(r => r.data),
}

export const planosAPI = {
  list:   ()         => api.get('/api/planos/').then(r => r.data),
  get:    (id)       => api.get(`/api/planos/${id}`).then(r => r.data),
  create: (data)     => api.post('/api/planos/', data).then(r => r.data),
  update: (id, data) => api.put(`/api/planos/${id}`, data).then(r => r.data),
  delete: (id)       => api.delete(`/api/planos/${id}`),
  gerarIA:  (data)   => api.post('/api/planos/ia/gerar', data).then(r => r.data),
  gerarSAA: (data)   => api.post('/api/planos/ia/saa', data).then(r => r.data),

  downloadPDF: async (payload) => {
    const res = await api.post('/api/planos/pdf/download', payload, { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.download = res.headers['content-disposition']
      ?.split('filename=')[1]?.replace(/"/g, '') || 'plano.pdf'
    a.click()
    URL.revokeObjectURL(url)
  },
}
