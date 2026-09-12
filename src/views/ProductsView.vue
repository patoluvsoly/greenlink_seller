<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useSellerStore } from '@/stores/seller'
import { formatKes } from '@/utils/currency'

const sellerStore = useSellerStore()

onMounted(() => {
  sellerStore.fetchOverview()
  sellerStore.fetchCategories()
})

const allProducts = computed(() =>
  sellerStore.businesses.flatMap((business) =>
    (business.products || []).map((product) => ({ ...product, businessName: business.name })),
  ),
)

function monogram(name) {
  return name?.charAt(0)?.toUpperCase() || '?'
}

// --- Add product ---
const showAddDialog = ref(false)
const addForm = reactive({
  businessId: null,
  categoryId: null,
  name: '',
  description: '',
  price: '',
  stockQuantity: '',
})
const addImageFile = ref(null)
const addError = ref(null)
const adding = ref(false)

function openAddDialog() {
  addError.value = null
  addForm.businessId = sellerStore.businesses[0]?.id || null
  addForm.categoryId = null
  addForm.name = ''
  addForm.description = ''
  addForm.price = ''
  addForm.stockQuantity = ''
  addImageFile.value = null
  showAddDialog.value = true
}

function onAddImageChange(event) {
  addImageFile.value = event.target.files?.[0] || null
}

async function submitAddProduct() {
  addError.value = null

  if (!addForm.businessId || !addForm.categoryId || !addForm.name || !addForm.price) {
    addError.value = 'Business, category, name, and price are required.'
    return
  }
  if (!addImageFile.value) {
    addError.value = 'A product photo is required — GreenLink products cannot be saved without one.'
    return
  }

  const formData = new FormData()
  formData.append('business_id', addForm.businessId)
  formData.append('category_id', addForm.categoryId)
  formData.append('name', addForm.name)
  formData.append('description', addForm.description)
  formData.append('price', addForm.price)
  if (addForm.stockQuantity !== '') {
    formData.append('stock_quantity', addForm.stockQuantity)
  }
  formData.append('image', addImageFile.value)

  adding.value = true
  try {
    await sellerStore.createProduct(formData)
    showAddDialog.value = false
  } catch (err) {
    const errors = err.response?.data?.errors
    addError.value = errors
      ? Object.values(errors)[0]?.[0]
      : err.response?.data?.message || 'Could not create the product.'
  } finally {
    adding.value = false
  }
}

// --- Edit product ---
const showEditDialog = ref(false)
const editForm = reactive({
  id: null,
  categoryId: null,
  name: '',
  description: '',
  price: '',
  stockQuantity: '',
})
const editError = ref(null)
const editing = ref(false)

function openEditDialog(product) {
  editError.value = null
  editForm.id = product.id
  editForm.categoryId = product.category_id
  editForm.name = product.name
  editForm.description = product.description || ''
  editForm.price = product.price
  editForm.stockQuantity = product.stock_quantity ?? ''
  showEditDialog.value = true
}

async function submitEditProduct() {
  editError.value = null
  editing.value = true
  try {
    await sellerStore.updateProduct(editForm.id, {
      category_id: editForm.categoryId,
      name: editForm.name,
      description: editForm.description,
      price: editForm.price,
      stock_quantity: editForm.stockQuantity === '' ? null : editForm.stockQuantity,
    })
    showEditDialog.value = false
  } catch (err) {
    const errors = err.response?.data?.errors
    editError.value = errors
      ? Object.values(errors)[0]?.[0]
      : err.response?.data?.message || 'Could not update the product.'
  } finally {
    editing.value = false
  }
}

// --- Delete product ---
const deletingId = ref(null)

async function handleDeleteProduct(product) {
  if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return
  deletingId.value = product.id
  try {
    await sellerStore.deleteProduct(product.id)
  } catch (err) {
    alert(err.response?.data?.message || 'Could not delete the product.')
  } finally {
    deletingId.value = null
  }
}

// --- Manage photos (inline expand per product) ---
const expandedProductId = ref(null)
const uploadingPhotosFor = ref(null)
const deletingImageId = ref(null)

function togglePhotos(productId) {
  expandedProductId.value = expandedProductId.value === productId ? null : productId
}

async function onAddPhotos(product, event) {
  const files = Array.from(event.target.files || [])
  if (files.length === 0) return
  uploadingPhotosFor.value = product.id
  try {
    await sellerStore.uploadProductImages(product.id, files)
  } catch (err) {
    alert(err.response?.data?.message || 'Could not upload photos.')
  } finally {
    uploadingPhotosFor.value = null
    event.target.value = ''
  }
}

async function removePhoto(product, image) {
  if (!confirm('Remove this photo?')) return
  deletingImageId.value = image.id
  try {
    await sellerStore.deleteProductImage(product.id, image.id)
  } catch (err) {
    alert(err.response?.data?.message || 'Could not remove the photo.')
  } finally {
    deletingImageId.value = null
  }
}
</script>

<template>
  <div class="gl-page">
    <p class="gl-eyebrow">Inventory</p>
    <div class="gl-section-header">
      <h1 class="gl-page-title">Products</h1>
      <v-btn
        color="primary"
        :disabled="sellerStore.businesses.length === 0"
        @click="openAddDialog"
      >
        Add product
      </v-btn>
    </div>

    <v-progress-circular v-if="sellerStore.loading" indeterminate color="primary" />

    <v-alert v-else-if="sellerStore.loadError" type="error" variant="tonal" density="compact">
      {{ sellerStore.loadError }}
    </v-alert>

    <v-alert v-else-if="sellerStore.businesses.length === 0" type="info" variant="tonal">
      You need a business before you can add products. Create one from the Dashboard first.
    </v-alert>

    <v-alert v-else-if="allProducts.length === 0" type="info" variant="tonal">
      No products yet — click "Add product" to list your first one.
    </v-alert>

    <template v-else>
      <v-card v-for="product in allProducts" :key="product.id" elevation="0" class="gl-product-row">
        <div class="gl-product-row-main">
          <div class="gl-product-thumb">
            <img v-if="product.image_url" :src="product.image_url" :alt="product.name" />
            <span v-else class="gl-product-monogram">{{ monogram(product.name) }}</span>
          </div>

          <div class="gl-product-info">
            <p class="gl-product-name">{{ product.name }}</p>
            <p class="gl-product-meta">
              {{ product.businessName }} · {{ formatKes(product.price) }} ·
              {{ product.stock_quantity ?? 0 }} in stock
            </p>
          </div>

          <div class="gl-product-actions">
            <v-btn variant="text" size="small" @click="togglePhotos(product.id)">
              Photos ({{ product.images?.length || 0 }})
            </v-btn>
            <v-btn variant="text" size="small" @click="openEditDialog(product)">Edit</v-btn>
            <v-btn
              variant="text"
              size="small"
              color="error"
              :loading="deletingId === product.id"
              @click="handleDeleteProduct(product)"
            >
              Delete
            </v-btn>
          </div>
        </div>

        <div v-if="expandedProductId === product.id" class="gl-photos-panel">
          <div class="gl-photos-grid">
            <div v-for="image in product.images" :key="image.id" class="gl-photo-tile">
              <img :src="image.url" :alt="product.name" />
              <button
                type="button"
                class="gl-photo-remove"
                :disabled="deletingImageId === image.id"
                @click="removePhoto(product, image)"
              >
                <v-icon size="14">mdi-close</v-icon>
              </button>
            </div>

            <label class="gl-photo-add">
              <v-icon>mdi-plus</v-icon>
              <span>Add</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                class="gl-photo-input"
                :disabled="uploadingPhotosFor === product.id"
                @change="(e) => onAddPhotos(product, e)"
              />
            </label>
          </div>
        </div>
      </v-card>
    </template>

    <!-- Add product dialog -->
    <v-dialog v-model="showAddDialog" max-width="520">
      <v-card class="pa-6">
        <h2 class="gl-dialog-title">New product</h2>

        <v-alert v-if="addError" type="warning" variant="tonal" density="compact" class="mb-3">
          {{ addError }}
        </v-alert>

        <v-select
          v-model="addForm.businessId"
          :items="sellerStore.businesses"
          item-title="name"
          item-value="id"
          label="Business"
          class="mb-2"
        />
        <v-select
          v-model="addForm.categoryId"
          :items="sellerStore.categories"
          item-title="name"
          item-value="id"
          label="Category"
          class="mb-2"
        />
        <v-text-field v-model="addForm.name" label="Product name" class="mb-2" />
        <v-textarea v-model="addForm.description" label="Description" rows="3" class="mb-2" />
        <div class="gl-form-row">
          <v-text-field v-model="addForm.price" label="Price (KSh)" type="number" min="0" />
          <v-text-field v-model="addForm.stockQuantity" label="Stock quantity" type="number" min="0" />
        </div>

        <label class="gl-file-field">
          <span class="gl-file-label">Product photo (required)</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" @change="onAddImageChange" />
        </label>

        <div class="gl-dialog-actions">
          <v-btn variant="text" @click="showAddDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="adding" @click="submitAddProduct">Create product</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Edit product dialog -->
    <v-dialog v-model="showEditDialog" max-width="520">
      <v-card class="pa-6">
        <h2 class="gl-dialog-title">Edit product</h2>

        <v-alert v-if="editError" type="warning" variant="tonal" density="compact" class="mb-3">
          {{ editError }}
        </v-alert>

        <v-select
          v-model="editForm.categoryId"
          :items="sellerStore.categories"
          item-title="name"
          item-value="id"
          label="Category"
          class="mb-2"
        />
        <v-text-field v-model="editForm.name" label="Product name" class="mb-2" />
        <v-textarea v-model="editForm.description" label="Description" rows="3" class="mb-2" />
        <div class="gl-form-row">
          <v-text-field v-model="editForm.price" label="Price (KSh)" type="number" min="0" />
          <v-text-field v-model="editForm.stockQuantity" label="Stock quantity" type="number" min="0" />
        </div>

        <p class="gl-note">
          To change the photo, close this and use "Photos" on the product instead.
        </p>

        <div class="gl-dialog-actions">
          <v-btn variant="text" @click="showEditDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="editing" @click="submitEditProduct">Save changes</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.gl-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 6px 0 24px;
}
.gl-page-title {
  margin: 0;
}
.gl-product-row {
  border: 1px solid var(--gl-border);
  border-radius: var(--gl-radius-md);
  margin-bottom: 12px;
  padding: 14px 16px;
}
.gl-product-row-main {
  display: flex;
  align-items: center;
  gap: 16px;
}
.gl-product-thumb {
  width: 56px;
  height: 56px;
  border-radius: var(--gl-radius-sm);
  background: var(--gl-moss-200);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.gl-product-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.gl-product-monogram {
  font-family: var(--gl-font-display);
  font-size: 1.3rem;
  color: var(--gl-forest-600);
  opacity: 0.55;
}
.gl-product-info {
  flex: 1;
}
.gl-product-name {
  font-weight: 600;
  margin: 0 0 4px;
}
.gl-product-meta {
  color: var(--gl-text-muted);
  font-size: 0.85rem;
  margin: 0;
}
.gl-product-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.gl-photos-panel {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--gl-border);
}
.gl-photos-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.gl-photo-tile {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: var(--gl-radius-sm);
  overflow: hidden;
}
.gl-photo-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.gl-photo-remove {
  all: unset;
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(14, 31, 22, 0.75);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.gl-photo-add {
  width: 64px;
  height: 64px;
  border-radius: var(--gl-radius-sm);
  border: 1.5px dashed var(--gl-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  color: var(--gl-text-muted);
  font-size: 10px;
  position: relative;
}
.gl-photo-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.gl-dialog-title {
  margin-bottom: 16px;
}
.gl-form-row {
  display: flex;
  gap: 12px;
}
.gl-file-field {
  display: block;
  margin: 8px 0 4px;
}
.gl-file-label {
  display: block;
  font-size: 0.85rem;
  color: var(--gl-text-muted);
  margin-bottom: 6px;
}
.gl-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
.gl-note {
  color: var(--gl-text-muted);
  font-size: 0.78rem;
  margin-top: 4px;
}
</style>