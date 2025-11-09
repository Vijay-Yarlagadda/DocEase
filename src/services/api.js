import axios from 'axios'

// API client for frontend -> backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - is the backend server running?')
      error.message = 'Request timeout. Please make sure the backend server is running on port 5000.'
    } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('Network error - cannot connect to backend')
      error.message = 'Cannot connect to server. Please make sure the backend is running on http://localhost:5000'
    } else if (error.response) {
      // Server responded with error status
      console.error('Server error:', error.response.status, error.response.data)
    } else {
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

// attach token helper
export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete api.defaults.headers.common['Authorization']
}

export default api
