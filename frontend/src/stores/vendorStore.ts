import { defineStore } from "pinia";
import { ref } from "vue";
import { VendorService } from "../services/VendorService";
import type { Vendor } from "../types/Vendor";

export const useVendorStore = defineStore("vendor", () => {
  const vendors = ref<Vendor[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchVendors() {
    loading.value = true;
    error.value = null;
    try {
      vendors.value = (await VendorService.getVendors()).reverse();
    } catch (err) {
      error.value = "Failed to load vendors. Please try again later.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function addVendor(vendor: Vendor) {
    loading.value = true;
    error.value = null;
    try {
      const createdVendor = await VendorService.createVendor(vendor);
      vendors.value.unshift(createdVendor);
    } catch (err: any) {
      const errorMessage =
        err?.message || "Failed to add vendor. Please try again later.";
      error.value = errorMessage;
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteVendor(id: string) {
    error.value = null;
    try {
      await VendorService.deleteVendor(id);
      await fetchVendors();
    } catch (err) {
      error.value = "Failed to delete vendor. Please try again later.";
      console.error(err);
      throw err;
    }
  }

  return {
    vendors,
    loading,
    error,
    fetchVendors,
    addVendor,
    deleteVendor,
  };
});
