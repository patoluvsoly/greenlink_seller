import axios from 'axios'

// Single source of truth for talking to the backend. Every store should
// import THIS instead of raw 'axios', otherwise the auth token never gets
// attached and every protected endpoint will 401.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gl_seller_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Unlike the buyer view, nothing in this app is public — every screen
// requires a logged-in seller. So an expired/invalid token should bounce
// straight back to login rather than leaving a broken page on screen.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('gl_seller_token')
      localStorage.removeItem('gl_seller_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api