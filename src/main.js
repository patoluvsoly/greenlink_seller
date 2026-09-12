import './assets/tokens.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Material Design Icons
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)

const greenlinkTheme = {
  dark: false,
  colors: {
    background: '#f6f5ef',
    surface: '#ffffff',
    primary: '#35603f',
    'primary-darken-1': '#17301f',
    secondary: '#8fae86',
    accent: '#b98a2e',
    error: '#b3453e',
    info: '#3f6a8f',
    success: '#3f7a4e',
    warning: '#b98a2e',
  },
}

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'greenlink',
    themes: {
      greenlink: greenlinkTheme,
    },
  },
  defaults: {
    VCard: { rounded: 'lg' },
    VBtn: { rounded: 'lg', style: 'text-transform: none; font-weight: 600; letter-spacing: 0;' },
    VTextField: { rounded: 'lg' },
    VSelect: { rounded: 'lg' },
    VTextarea: { rounded: 'lg' },
  },
})

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.mount('#app')