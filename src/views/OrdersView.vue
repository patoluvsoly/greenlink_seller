<script setup>
import { ref, onMounted } from 'vue'
import { useSellerStore } from '@/stores/seller'
import { formatKes } from '@/utils/currency'

const sellerStore = useSellerStore()
const updatingId = ref(null)

const statusOptions = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled']

const statusColor = {
  pending: 'warning',
  confirmed: 'info',
  shipped: 'info',
  completed: 'success',
  cancelled: 'error',
}

onMounted(() => {
  sellerStore.fetchOverview()
})

async function changeStatus(order, status) {
  if (status === order.status) return
  updatingId.value = order.id
  try {
    await sellerStore.updateOrderStatus(order.id, status)
  } catch (err) {
    alert(err.response?.data?.message || 'Could not update order status.')
  } finally {
    updatingId.value = null
  }
}
</script>

<template>
  <div class="gl-page">
    <p class="gl-eyebrow">Order queue</p>
    <h1 class="gl-page-title">Orders</h1>

    <v-progress-circular v-if="sellerStore.loading" indeterminate color="primary" />
    <v-alert v-else-if="sellerStore.loadError" type="error" variant="tonal" density="compact">
      {{ sellerStore.loadError }}
    </v-alert>
    <v-alert v-else-if="sellerStore.orders.length === 0" type="info" variant="tonal">
      No orders yet.
    </v-alert>

    <v-card v-for="order in sellerStore.orders" :key="order.id" elevation="0" class="gl-order-card">
      <div class="gl-order-top">
        <div>
          <p class="gl-order-buyer">{{ order.buyer?.name }}</p>
          <p class="gl-order-meta">
            Order #{{ order.id }} · {{ new Date(order.created_at).toLocaleDateString() }}
          </p>
        </div>
        <p class="gl-order-total">{{ formatKes(order.total_amount) }}</p>
      </div>

      <ul class="gl-order-items">
        <li v-for="item in order.items" :key="item.id">
          {{ item.product?.name }} × {{ item.quantity }}
        </li>
      </ul>

      <div class="gl-order-bottom">
        <v-chip :color="statusColor[order.status] || 'default'" variant="tonal" size="small">
          {{ order.status }}
        </v-chip>
        <v-select
          :model-value="order.status"
          :items="statusOptions"
          label="Update status"
          density="compact"
          hide-details
          style="max-width: 200px"
          :loading="updatingId === order.id"
          @update:model-value="(status) => changeStatus(order, status)"
        />
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.gl-page-title {
  margin: 6px 0 24px;
}
.gl-order-card {
  padding: 18px 20px;
  border: 1px solid var(--gl-border);
  border-radius: var(--gl-radius-md);
  margin-bottom: 14px;
}
.gl-order-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.gl-order-buyer {
  font-weight: 600;
  margin: 0 0 2px;
}
.gl-order-meta {
  color: var(--gl-text-muted);
  font-size: 0.82rem;
  margin: 0;
}
.gl-order-total {
  font-weight: 700;
  color: var(--gl-forest-600);
}
.gl-order-items {
  color: var(--gl-text-muted);
  font-size: 0.88rem;
  margin: 0 0 14px;
  padding-left: 18px;
}
.gl-order-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
</style>