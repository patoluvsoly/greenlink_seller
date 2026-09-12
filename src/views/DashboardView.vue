<script setup>
import { ref, onMounted } from 'vue'
import { useSellerStore } from '@/stores/seller'
import { formatKes } from '@/utils/currency'

const sellerStore = useSellerStore()

const showBusinessDialog = ref(false)
const businessName = ref('')
const businessDescription = ref('')
const businessCategoryId = ref(null)
const savingBusiness = ref(false)
const businessError = ref(null)

const statusColor = {
  pending: 'warning',
  verified: 'success',
  rejected: 'error',
}

onMounted(() => {
  sellerStore.fetchOverview()
  sellerStore.fetchCategories()
})

function openBusinessDialog() {
  businessError.value = null
  businessName.value = ''
  businessDescription.value = ''
  businessCategoryId.value = null
  showBusinessDialog.value = true
}

async function saveBusiness() {
  if (!businessName.value || !businessCategoryId.value) {
    businessError.value = 'Name and category are required.'
    return
  }
  savingBusiness.value = true
  businessError.value = null
  try {
    await sellerStore.createBusiness({
      name: businessName.value,
      description: businessDescription.value,
      categoryId: businessCategoryId.value,
    })
    showBusinessDialog.value = false
  } catch (err) {
    businessError.value = err.response?.data?.message || 'Could not create the business.'
  } finally {
    savingBusiness.value = false
  }
}
</script>

<template>
  <div class="gl-page">
    <p class="gl-eyebrow">Your dashboard</p>
    <h1 class="gl-page-title">Dashboard</h1>

    <v-progress-circular v-if="sellerStore.loading" indeterminate color="primary" />
    <v-alert v-else-if="sellerStore.loadError" type="error" variant="tonal" density="compact">
      {{ sellerStore.loadError }}
    </v-alert>

    <template v-else>
      <div class="gl-metrics-grid">
        <v-card elevation="0" class="gl-metric-card">
          <p class="gl-metric-label">Businesses</p>
          <p class="gl-metric-value">{{ sellerStore.metrics.business_count }}</p>
        </v-card>
        <v-card elevation="0" class="gl-metric-card">
          <p class="gl-metric-label">Products</p>
          <p class="gl-metric-value">{{ sellerStore.metrics.product_count }}</p>
        </v-card>
        <v-card elevation="0" class="gl-metric-card">
          <p class="gl-metric-label">Orders</p>
          <p class="gl-metric-value">{{ sellerStore.metrics.order_count }}</p>
        </v-card>
        <v-card elevation="0" class="gl-metric-card">
          <p class="gl-metric-label">Revenue</p>
          <p class="gl-metric-value">{{ formatKes(sellerStore.metrics.revenue) }}</p>
        </v-card>
      </div>

      <div class="gl-section-header">
        <h2 class="gl-section-title">Your businesses</h2>
        <v-btn color="primary" @click="openBusinessDialog">Add a business</v-btn>
      </div>

      <v-alert v-if="sellerStore.businesses.length === 0" type="info" variant="tonal" class="mb-4">
        You don't have a business on GreenLink yet. Create one to start listing products —
        every product needs to belong to a business.
      </v-alert>

      <v-card
        v-for="business in sellerStore.businesses"
        :key="business.id"
        elevation="0"
        class="gl-business-card"
      >
        <div>
          <p class="gl-business-name">{{ business.name }}</p>
          <p class="gl-business-meta">
            {{ business.category?.name }} · {{ business.products?.length || 0 }} product(s)
          </p>
        </div>
        <v-chip :color="statusColor[business.verification_status] || 'default'" variant="tonal" size="small">
          {{ business.verification_status }}
        </v-chip>
      </v-card>
    </template>

    <v-dialog v-model="showBusinessDialog" max-width="480">
      <v-card class="pa-6">
        <h2 class="gl-dialog-title">New business</h2>

        <v-alert v-if="businessError" type="warning" variant="tonal" density="compact" class="mb-3">
          {{ businessError }}
        </v-alert>

        <v-text-field v-model="businessName" label="Business name" class="mb-2" />
        <v-select
          v-model="businessCategoryId"
          :items="sellerStore.categories"
          item-title="name"
          item-value="id"
          label="Category"
          class="mb-2"
        />
        <v-textarea v-model="businessDescription" label="Description (optional)" rows="3" class="mb-2" />

        <div class="gl-dialog-actions">
          <v-btn variant="text" @click="showBusinessDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="savingBusiness" @click="saveBusiness">Create business</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.gl-page-title {
  margin: 6px 0 24px;
}
.gl-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 36px;
}
.gl-metric-card {
  padding: 18px 20px;
  border: 1px solid var(--gl-border);
  border-radius: var(--gl-radius-md);
}
.gl-metric-label {
  font-size: 0.78rem;
  color: var(--gl-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 6px;
}
.gl-metric-value {
  font-family: var(--gl-font-display);
  font-size: 1.7rem;
  font-weight: 600;
  margin: 0;
  color: var(--gl-forest-800);
}
.gl-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.gl-section-title {
  font-family: var(--gl-font-display);
  font-size: 1.2rem;
  margin: 0;
}
.gl-business-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border: 1px solid var(--gl-border);
  border-radius: var(--gl-radius-md);
  margin-bottom: 12px;
}
.gl-business-name {
  font-weight: 600;
  margin: 0 0 4px;
}
.gl-business-meta {
  color: var(--gl-text-muted);
  font-size: 0.85rem;
  margin: 0;
}
.gl-dialog-title {
  margin-bottom: 16px;
}
.gl-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
</style>