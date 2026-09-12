<script setup>
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

async function handleSubmit() {
  const ok = await authStore.login(email.value, password.value)
  if (ok) {
    router.push(route.query.redirect || { name: 'dashboard' })
  }
}
</script>

<template>
  <div class="gl-auth-page">
    <v-card class="gl-auth-card" elevation="0">
      <h1 class="gl-auth-title">Seller sign in</h1>
      <p class="gl-auth-subtitle">Manage your businesses, products, and orders.</p>

      <v-alert v-if="authStore.error" type="error" variant="tonal" density="compact" class="mb-4">
        {{ authStore.error }}
      </v-alert>

      <v-form @submit.prevent="handleSubmit">
        <v-text-field v-model="email" label="Email" type="email" required autofocus />
        <v-text-field v-model="password" label="Password" type="password" required />
        <v-btn type="submit" color="primary" block size="large" :loading="authStore.loading">
          Log in
        </v-btn>
      </v-form>

      <p class="gl-auth-footer">
        New seller? <RouterLink to="/register">Create an account</RouterLink>
      </p>
    </v-card>
  </div>
</template>

<style scoped>
.gl-auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gl-bg);
  padding: 24px;
}
.gl-auth-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  border-radius: var(--gl-radius-lg);
  box-shadow: var(--gl-shadow-md);
}
.gl-auth-title {
  margin-bottom: 4px;
}
.gl-auth-subtitle {
  color: var(--gl-text-muted);
  margin-bottom: 24px;
}
.gl-auth-footer {
  margin-top: 20px;
  text-align: center;
  color: var(--gl-text-muted);
  font-size: 0.9rem;
}
</style>