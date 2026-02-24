import type { Vendor } from "../types/Vendor";
const useNodeBackend = true; // Set to true if using Node backend, false for Java backend

// Use environment variables or default to localhost for development
const API_URL_JAVA =
  import.meta.env.VITE_API_URL_JAVA || "http://localhost:3001/api";
const API_URL_NODE =
  import.meta.env.VITE_API_URL_NODE || "http://localhost:3000/api";

const API_URL = useNodeBackend ? API_URL_NODE : API_URL_JAVA;
export const VendorService = {
  async getVendors(): Promise<Vendor[]> {
    try {
      const response = await fetch(`${API_URL}/vendors`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching vendors:", error);
      throw error;
    }
  },

  async createVendor(vendor: Vendor): Promise<Vendor> {
    try {
      const response = await fetch(`${API_URL}/vendors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vendor),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      return await response.json();
    } catch (error: any) {
      console.error("Error creating vendor:", error);
      throw error;
    }
  },

  async deleteVendor(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/vendors/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }
    } catch (error) {
      console.error("Error deleting vendor:", error);
      throw error;
    }
  },

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const url = `${API_URL}/vendors/check-email?email=${encodeURIComponent(email)}`;
      const response = await fetch(url);
      if (!response.ok) {
        console.warn("Email check returned non-OK status:", response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  },
};
