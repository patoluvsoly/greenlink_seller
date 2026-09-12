import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('gl_seller_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('gl_seller_user') || 'null'))
  const error = ref(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const isSeller = computed(() => user.value?.role === 'seller')

  function persist() {
    if (token.value) {
      localStorage.setItem('gl_seller_token', token.value)
    } else {
      localStorage.removeItem('gl_seller_token')
    }
    if (user.value) {
      localStorage.setItem('gl_seller_user', JSON.stringify(user.value))
    } else {
      localStorage.removeItem('gl_seller_user')
    }
  }

  // role is deliberately NOT a form field — this app only ever registers
  // sellers. The backend still enforces this independently (register only
  // accepts buyer/seller, never admin), so this is a UX choice, not the
  // security boundary.
  async function register(name, email, password, passwordConfirmation) {
    error.value = null
    loading.value = true
    try {
      const response = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role: 'seller',
      })
      token.value = response.data.token
      user.value = response.data.user
      persist()
      return true
    } catch (err) {
      error.value = firstError(err) || 'Registration failed. Please try again.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function login(email, password) {
    error.value = null
    loading.value = true
    try {
      const response = await api.post('/login', { email, password })
      token.value = response.data.token
      user.value = response.data.user
      persist()
      return true
    } catch (err) {
      error.value = firstError(err) || 'Login failed. Please check your credentials.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch (err) {
      // Clear local state regardless — an already-expired token shouldn't
      // leave the seller stuck "logged in" on the UI with no way out.
    }
    token.value = null
    user.value = null
    persist()
  }

  async function fetchCurrentUser() {
    if (!token.value) return null
    try {
      const response = await api.get('/me')
      user.value = response.data
      persist()
      return user.value
    } catch (err) {
      token.value = null
      user.value = null
      persist()
      return null
    }
  }

  function updateUser(updatedUser) {
    user.value = updatedUser
    persist()
  }

  function firstError(err) {
    const data = err.response?.data
    if (!data) return null
    if (data.errors) {
      const firstKey = Object.keys(data.errors)[0]
      return data.errors[firstKey]?.[0]
    }
    return data.message
  }

  return {
    token,
    user,
    error,
    loading,
    isAuthenticated,
    isSeller,
    register,
    login,
    logout,
    fetchCurrentUser,
    updateUser,
  }
})