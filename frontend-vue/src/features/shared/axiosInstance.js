import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000', // set to your backend URL
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