<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import NavBar from './components/NavBar.vue'

const route = useRoute()
const isAuthPage = computed(() => route.name === 'login' || route.name === 'register')
</script>

<template>
  <v-app>
    <template v-if="isAuthPage">
      <RouterView />
    </template>
    <template v-else>
      <NavBar />
      <v-main class="app-background">
        <RouterView />
      </v-main>
    </template>
  </v-app>
</template>

<style scoped>
.app-background {
  background: var(--gl-bg);
}
</style>