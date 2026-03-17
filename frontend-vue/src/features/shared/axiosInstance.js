import axios from 'axios'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').trim()

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  let token = localStorage.getItem('token')

  // If token was saved as JSON string
  try {
    token = JSON.parse(token)
  } catch {
    // keep as-is
  }

  if (typeof token === 'string') {
    token = token.replace(/^"|"$/g, '')         // remove wrapped quotes
    token = token.replace(/^Bearer\s+/i, '')    // remove accidental Bearer prefix
  }

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api