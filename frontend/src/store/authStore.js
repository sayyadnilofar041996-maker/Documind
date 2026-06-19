import { create } from 'zustand'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password })
      const { access_token, user } = response.data
      
      localStorage.setItem('token', access_token)
      set({ 
        token: access_token, 
        user, 
        isAuthenticated: true, 
        loading: false 
      })
      return true
    } catch (error) {
      let message = 'Login failed'
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail
        if (Array.isArray(detail)) {
          message = detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ')
        } else if (typeof detail === 'string') {
          message = detail
        } else if (typeof detail === 'object') {
          message = detail.detail || JSON.stringify(detail)
        }
      }
      set({ error: message, loading: false })
      return false
    }
  },

  register: async (email, username, password) => {
    set({ loading: true, error: null })
    try {
      await axios.post(`${API_URL}/auth/register`, { email, username, password })
      set({ loading: false })
      return true
    } catch (error) {
      let message = 'Registration failed'
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail
        if (Array.isArray(detail)) {
          message = detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ')
        } else if (typeof detail === 'string') {
          message = detail
        } else if (typeof detail === 'object') {
          message = detail.detail || JSON.stringify(detail)
        }
      }
      set({ error: message, loading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false, error: null })
  },

  loadUser: async () => {
    const { token } = get()
    if (!token) return

    set({ loading: true })
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      set({ user: response.data, isAuthenticated: true, loading: false })
    } catch (error) {
      localStorage.removeItem('token')
      set({ user: null, token: null, isAuthenticated: false, loading: false })
    }
  }
}))

export default useAuthStore
