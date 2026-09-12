import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'

export const useSellerStore = defineStore('seller', () => {
  const businesses = ref([])
  const orders = ref([])
  const metrics = ref({ business_count: 0, product_count: 0, order_count: 0, revenue: 0 })
  const categories = ref([])
  const loading = ref(true)
  const loadError = ref(null)

  // The overview endpoint is the single source of truth for this whole
  // app — businesses (with nested products+images) and orders, in one
  // call. Every mutation below re-fetches this afterward rather than
  // trying to patch local state by hand, since the response shapes
  // (e.g. a product's nested images) are non-trivial to keep in sync
  // manually and correctness matters more than shaving one round trip.
  async function fetchOverview() {
    loading.value = true
    loadError.value = null
    try {
      const response = await api.get('/seller/overview')
      businesses.value = response.data.businesses
      orders.value = response.data.orders
      metrics.value = response.data.metrics
    } catch (err) {
      loadError.value = 'Could not load your dashboard.'
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    try {
      const response = await api.get('/get-categories')
      categories.value = response.data
    } catch (err) {
      // Non-fatal — forms that need this will just show an empty dropdown
      // and the person can retry; it shouldn't block the rest of the app.
    }
  }

  async function createBusiness({ name, description, categoryId }) {
    const response = await api.post('/save-business', {
      name,
      description: description || null,
      category_id: categoryId,
    })
    await fetchOverview()
    return response.data.business
  }

  async function createProduct(formData) {
    const response = await api.post('/save-product', formData)
    await fetchOverview()
    return response.data.product
  }

  async function updateProduct(productId, payload) {
    const response = await api.post(`/update-product/${productId}`, payload)
    await fetchOverview()
    return response.data.product
  }

  async function deleteProduct(productId) {
    await api.delete(`/delete-product/${productId}`)
    await fetchOverview()
  }

  async function uploadProductImages(productId, files) {
    const formData = new FormData()
    for (const file of files) {
      formData.append('images[]', file)
    }
    const response = await api.post(`/products/${productId}/images`, formData)
    await fetchOverview()
    return response.data.product
  }

  async function deleteProductImage(productId, imageId) {
    const response = await api.delete(`/products/${productId}/images/${imageId}`)
    await fetchOverview()
    return response.data.product
  }

  async function updateOrderStatus(orderId, status) {
    const response = await api.post(`/update-order/${orderId}`, { status })
    await fetchOverview()
    return response.data.order
  }

  return {
    businesses,
    orders,
    metrics,
    categories,
    loading,
    loadError,
    fetchOverview,
    fetchCategories,
    createBusiness,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImages,
    deleteProductImage,
    updateOrderStatus,
  }
})