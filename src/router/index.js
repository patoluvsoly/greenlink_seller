import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ProductsView from '@/views/ProductsView.vue'
import OrdersView from '@/views/OrdersView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { public: true },
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
    },
    {
      path: '/orders',
      name: 'orders',
      component: OrdersView,
    },
  ],
})

// This entire app is the seller console — every route except /login and
// /register requires a logged-in seller. Anything else (no token, or a
// valid but non-seller token — e.g. a buyer or admin account) gets bounced
// to /login, the same strict pattern the admin panel uses for its own role.
router.beforeEach(async (to) => {
  if (to.meta.public) {
    return true
  }

  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (!authStore.user) {
    const user = await authStore.fetchCurrentUser()
    if (!user) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  }

  if (!authStore.isSeller) {
    await authStore.logout()
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  return true
})

export default router