import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
})

// Request interceptor to attach JWT token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling 401s
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
       localStorage.removeItem('token')
       window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client
