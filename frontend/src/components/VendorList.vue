<template>
  <div class="vendor-list-container">
    <div class="list-header">
      <h2>Vendor List</h2>
      <span v-if="vendorStore.vendors.length > 0" class="vendor-count">
        {{ vendorStore.vendors.length }} vendor{{
          vendorStore.vendors.length !== 1 ? "s" : ""
        }}
      </span>
    </div>
    <div
      v-if="vendorStore.loading"
      class="loading-state"
      aria-live="polite"
      role="alert"
    >
      <div class="spinner-large"></div>
      <p>Loading vendors...</p>
    </div>
    <div v-else-if="vendorStore.error" class="error-state" role="alert">
      <span class="error-icon">⚠️</span>
      <div>
        <p class="error-title">Unable to load vendors</p>
        <p class="error-message">{{ vendorStore.error }}</p>
      </div>
    </div>
    <div v-else-if="vendorStore.vendors.length === 0" class="empty-state">
      <span class="empty-icon">📋</span>
      <h3>No vendors yet</h3>
      <p>Get started by adding your first vendor using the form on the left.</p>
    </div>
    <div v-else class="table-wrapper">
      <table class="vendors-table" aria-label="List of registered vendors">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Contact</th>
            <th scope="col">Email</th>
            <th scope="col">Type</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(vendor, index) in vendorStore.vendors"
            :key="vendor.id"
            :class="{ 'zebra-odd': index % 2 === 0 }"
          >
            <td data-label="ID">{{ vendor.id }}</td>
            <td data-label="Name" class="name-cell">{{ vendor.name }}</td>
            <td data-label="Contact">{{ vendor.contact_person }}</td>
            <td data-label="Email" class="email-cell">
              <a
                :href="`mailto:${vendor.email}`"
                :title="`Send email to ${vendor.email}`"
              >
                {{ vendor.email }}
              </a>
            </td>
            <td data-label="Type">
              <span
                class="badge"
                :class="`badge-${vendor.partner_type.toLowerCase()}`"
              >
                {{ vendor.partner_type }}
              </span>
            </td>
            <td data-label="Actions" class="actions-cell">
              <button
                @click="openDeleteDialog(vendor)"
                class="btn-delete"
                aria-label="Delete vendor"
                :title="`Delete ${vendor.name}`"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Delete Confirmation Modal Dialog -->
    <div
      v-if="selectedVendor"
      class="dialog-overlay"
      @click="closeDeleteDialog"
    >
      <div
        class="dialog"
        @click.stop
        role="alertdialog"
        aria-labelledby="dialog-title"
      >
        <h3 id="dialog-title">Delete Vendor?</h3>
        <p>
          Are you sure you want to delete
          <strong>{{ selectedVendor.name }}</strong
          >? This action cannot be undone.
        </p>
        <div class="dialog-actions">
          <button @click="closeDeleteDialog" class="btn btn-secondary">
            Cancel
          </button>
          <button
            @click="confirmDelete"
            class="btn btn-delete"
            :disabled="isDeleting"
          >
            {{ isDeleting ? "Deleting..." : "Delete" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useVendorStore } from "../stores/vendorStore";
import type { Vendor } from "../types/Vendor";

const vendorStore = useVendorStore();
const selectedVendor = ref<Vendor | null>(null);
const isDeleting = ref(false);

onMounted(() => {
  vendorStore.fetchVendors();
});

const openDeleteDialog = (vendor: Vendor) => {
  selectedVendor.value = vendor;
};

const closeDeleteDialog = () => {
  selectedVendor.value = null;
};

const confirmDelete = async () => {
  if (!selectedVendor.value) return;
  isDeleting.value = true;
  try {
    await vendorStore.deleteVendor(String(selectedVendor.value.id));
    closeDeleteDialog();
  } catch (error) {
    console.error("Failed to delete vendor:", error);
  } finally {
    isDeleting.value = false;
  }
};
</script>
<style scoped>
.vendor-list-container {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
}
.list-header h2 {
  margin: 0;
}
.vendor-count {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) var(--spacing-xl);
  gap: var(--spacing-lg);
  color: var(--color-text-secondary);
}
.spinner-large {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.error-state {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background-color: var(--color-error-light);
  border-left: 4px solid var(--color-error);
  color: var(--color-error);
}
.error-icon {
  font-size: var(--font-size-2xl);
  flex-shrink: 0;
}
.error-title {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
}
.error-message {
  margin: 0;
  font-size: var(--font-size-sm);
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) var(--spacing-xl);
  text-align: center;
  color: var(--color-text-secondary);
}
.empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-lg);
  opacity: 0.8;
}
.empty-state h3 {
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}
.empty-state p {
  margin: 0;
  font-size: var(--font-size-sm);
  max-width: 300px;
}
.table-wrapper {
  overflow-x: auto;
}
.vendors-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}
.vendors-table thead {
  background-color: var(--color-bg-tertiary);
  border-bottom: 2px solid var(--color-border);
}
.vendors-table th {
  padding: var(--spacing-md);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}
.vendors-table tbody tr {
  border-bottom: 1px solid var(--color-border);
  transition: background-color var(--transition-fast);
}
.vendors-table tbody tr:hover {
  background-color: var(--color-bg-tertiary);
}
.vendors-table tbody tr.zebra-odd {
  background-color: var(--color-bg-primary);
}
.vendors-table tbody tr.zebra-odd:hover {
  background-color: var(--color-bg-tertiary);
}
.vendors-table td {
  padding: var(--spacing-md);
  color: var(--color-text-primary);
}
.vendors-table a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}
.vendors-table a:hover {
  text-decoration: underline;
}
.vendors-table a:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.email-cell a {
  word-break: break-all;
}
.badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}
.badge-supplier {
  background-color: var(--color-warning);
  color: white;
}
.badge-partner {
  background-color: var(--color-success);
  color: white;
}
.actions-cell {
  text-align: center;
}
.btn-delete {
  background: none;
  border: none;
  padding: var(--spacing-sm);
  cursor: pointer;
  font-size: var(--font-size-lg);
  transition: all var(--transition-fast);
  border-radius: var(--radius-md);
  opacity: 0.7;
}
.btn-delete:hover {
  opacity: 1;
  background-color: var(--color-error-light);
  transform: scale(1.1);
}
.btn-delete:focus {
  outline: 2px solid var(--color-error);
  outline-offset: 2px;
}
.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.dialog-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn var(--transition-base) ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.dialog {
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  max-width: 400px;
  box-shadow: var(--shadow-xl);
  animation: slideUp var(--transition-base) ease-out;
}
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.dialog h3 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text-primary);
}
.dialog p {
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-secondary);
}
.dialog-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}
.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.btn-secondary {
  background-color: var(--color-border);
  color: var(--color-text-primary);
}
.btn-secondary:hover {
  background-color: var(--color-border-light);
}
.dialog .btn-delete {
  background-color: var(--color-error);
  color: white;
}
.dialog .btn-delete:hover:not(:disabled) {
  background-color: var(--color-error);
  opacity: 0.9;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
@media (max-width: 640px) {
  .vendors-table {
    font-size: var(--font-size-xs);
  }
  .vendors-table th,
  .vendors-table td {
    padding: var(--spacing-sm);
  }
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
}
</style>
