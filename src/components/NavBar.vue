<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LogoMark from '@/components/LogoMark.vue'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <v-app-bar flat color="surface" class="gl-navbar">
    <RouterLink to="/" class="gl-brand">
      <LogoMark :size="34" />
      <span>GreenLink</span>
      <span class="gl-brand-tag">Seller</span>
    </RouterLink>

    <v-spacer />

    <v-btn variant="text" :to="{ name: 'dashboard' }">Dashboard</v-btn>
    <v-btn variant="text" :to="{ name: 'products' }">Products</v-btn>
    <v-btn variant="text" :to="{ name: 'orders' }">Orders</v-btn>

    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn variant="text" v-bind="props">
          {{ authStore.user?.name || 'Account' }}
          <v-icon end>mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="handleLogout" title="Log out" />
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<style scoped>
.gl-navbar {
  border-bottom: 1px solid var(--gl-border);
  padding: 0 16px;
}
.gl-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--gl-font-display);
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--gl-forest-950);
  text-decoration: none;
}
.gl-brand-tag {
  font-family: var(--gl-font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--gl-gold-500);
  background: var(--gl-gold-100);
  padding: 3px 8px;
  border-radius: var(--gl-radius-sm);
}
</style>