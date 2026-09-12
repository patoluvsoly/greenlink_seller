<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const authStore = useAuthStore()
const router = useRouter()

async function handleSubmit() {
  const ok = await authStore.register(name.value, email.value, password.value, passwordConfirmation.value)
  if (ok) {
    router.push({ name: 'dashboard' })
  }
}
</script>

<template>
  <div class="gl-auth-page">
    <v-card class="gl-auth-card" elevation="0">
      <h1 class="gl-auth-title">Become a seller</h1>
      <p class="gl-auth-subtitle">List your sustainable products on GreenLink.</p>

      <v-alert v-if="authStore.error" type="error" variant="tonal" density="compact" class="mb-4">
        {{ authStore.error }}
      </v-alert>

      <v-form @submit.prevent="handleSubmit">
        <v-text-field v-model="name" label="Full name" required autofocus />
        <v-text-field v-model="email" label="Email" type="email" required />
        <v-text-field v-model="password" label="Password" type="password" required hint="At least 8 characters" />
        <v-text-field
          v-model="passwordConfirmation"
          label="Confirm password"
          type="password"
          required
        />
        <v-btn type="submit" color="primary" block size="large" :loading="authStore.loading">
          Create seller account
        </v-btn>
      </v-form>

      <p class="gl-auth-footer">
        Already have an account? <RouterLink to="/login">Log in</RouterLink>
      </p>

      <p class="gl-auth-fineprint">
        Looking to buy instead? That's a separate GreenLink account on the marketplace site.
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
.gl-auth-fineprint {
  margin-top: 12px;
  text-align: center;
  color: var(--gl-text-muted);
  font-size: 0.78rem;
}
</style>