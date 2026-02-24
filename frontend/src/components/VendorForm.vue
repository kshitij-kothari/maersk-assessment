<template>
  <div class="vendor-form-container">
    <h2>Add New Vendor</h2>
    <p class="form-description">Register a new vendor to your network</p>
    <form @submit.prevent="submitForm" class="vendor-form" novalidate>
      <div class="form-group">
        <label for="name" class="form-label"
          >Company Name <span class="required">*</span></label
        >
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="form-input"
          required
          placeholder="Enter company name"
          @blur="onNameChange"
          @input="onNameChange"
          :aria-invalid="errors.name ? 'true' : 'false'"
          :aria-describedby="errors.name ? 'name-error' : undefined"
        />
        <span v-if="errors.name" id="name-error" class="error-message">{{
          errors.name
        }}</span>
      </div>
      <div class="form-group">
        <label for="contactPerson" class="form-label"
          >Contact Person <span class="required">*</span></label
        >
        <input
          id="contactPerson"
          v-model="form.contact_person"
          type="text"
          class="form-input"
          required
          placeholder="Enter contact person name"
          @blur="onContactPersonChange"
          @input="onContactPersonChange"
          :aria-invalid="errors.contact_person ? 'true' : 'false'"
          :aria-describedby="
            errors.contact_person ? 'contact-error' : undefined
          "
        />
        <span
          v-if="errors.contact_person"
          id="contact-error"
          class="error-message"
          >{{ errors.contact_person }}</span
        >
      </div>
      <div class="form-group">
        <label for="email" class="form-label"
          >Email Address
          <span class="required" aria-label="required">*</span></label
        >
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-input"
          required
          placeholder="Enter email address"
          @blur="
            () => {
              onEmailChange();
              validateEmailUniqueness();
            }
          "
          @input="onEmailChange"
          :aria-invalid="errors.email ? 'true' : 'false'"
          :aria-describedby="errors.email ? 'email-error' : undefined"
        />
        <span v-if="errors.email" id="email-error" class="error-message">{{
          errors.email
        }}</span>
      </div>
      <div class="form-group">
        <label for="partnerType" class="form-label"
          >Partner Type <span class="required">*</span></label
        >
        <select
          id="partnerType"
          v-model="form.partner_type"
          class="form-input"
          required
          @blur="onPartnerTypeChange"
          @change="onPartnerTypeChange"
          :aria-invalid="errors.partner_type ? 'true' : 'false'"
        >
          <option value="">-- Select a type --</option>
          <option value="Supplier">Supplier</option>
          <option value="Partner">Partner</option>
        </select>
        <span v-if="errors.partner_type" class="error-message">{{
          errors.partner_type
        }}</span>
      </div>
      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="vendorStore.loading || isSubmitting || !isFormValid"
          :aria-busy="isSubmitting"
        >
          <span
            v-if="vendorStore.loading || isSubmitting"
            class="spinner"
          ></span>
          {{
            vendorStore.loading || isSubmitting ? "Submitting..." : "Add Vendor"
          }}
        </button>
      </div>
      <div v-if="vendorStore.error" class="alert alert-error" role="alert">
        <span class="alert-icon">⚠️</span>
        {{ vendorStore.error }}
      </div>
      <div v-if="success" class="alert alert-success" role="alert">
        <span class="alert-icon">✓</span>
        Vendor added successfully!
      </div>
    </form>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { useVendorStore } from "../stores/vendorStore";
import { VendorService } from "../services/VendorService";
import type { Vendor } from "../types/Vendor";

type VendorForm = Omit<Vendor, "id"> & { partner_type: string };

const vendorStore = useVendorStore();
const isSubmitting = ref(false);
const success = ref(false);
const emailCheckInProgress = ref(false);
const form = reactive<VendorForm>({
  name: "",
  contact_person: "",
  email: "",
  partner_type: "Supplier",
});
const errors = reactive<Record<string, string>>({
  name: "",
  contact_person: "",
  email: "",
  partner_type: "",
});
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateFieldValue = (fieldName: string, value: string): string => {
  switch (fieldName) {
    case "name":
      return value.trim().length > 0 ? "" : "Company name is required";
    case "contact_person":
      return value.trim().length > 0 ? "" : "Contact person is required";
    case "email":
      if (value.length === 0) return "Email is required";
      if (!isValidEmail(value)) return "Invalid email format";
      return "";
    case "partner_type":
      return value.length > 0 ? "" : "Partner type is required";
    default:
      return "";
  }
};

const onNameChange = () => {
  errors.name = validateFieldValue("name", form.name);
};
const onContactPersonChange = () => {
  errors.contact_person = validateFieldValue(
    "contact_person",
    form.contact_person,
  );
};
const onPartnerTypeChange = () => {
  errors.partner_type = validateFieldValue("partner_type", form.partner_type);
};
const onEmailChange = () => {
  const fieldError = validateFieldValue("email", form.email);
  if (!errors.email?.includes("already exists")) {
    errors.email = fieldError;
  }
};
const validateEmailUniqueness = async () => {
  if (!form.email || !isValidEmail(form.email)) {
    return;
  }
  emailCheckInProgress.value = true;
  try {
    const exists = await VendorService.checkEmailExists(form.email);
    if (exists) {
      errors.email =
        "A vendor with this email already exists. Please use a different email address.";
    } else if (errors.email && errors.email.includes("already exists")) {
      errors.email = "";
    }
  } catch (err) {
    console.error("Error checking email uniqueness:", err);
  } finally {
    emailCheckInProgress.value = false;
  }
};
const isFormValid = computed(() => {
  const hasAllFields =
    form.name.trim().length > 0 &&
    form.contact_person.trim().length > 0 &&
    form.email.length > 0 &&
    form.partner_type.length > 0;
  const noErrors = Object.values(errors).every((error) => error === "");

  return hasAllFields && noErrors;
});
const resetForm = () => {
  form.name = "";
  form.contact_person = "";
  form.email = "";
  form.partner_type = "Supplier";
  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });
};
const submitForm = async () => {
  errors.name = validateFieldValue("name", form.name);
  errors.contact_person = validateFieldValue(
    "contact_person",
    form.contact_person,
  );
  errors.email = validateFieldValue("email", form.email);
  errors.partner_type = validateFieldValue("partner_type", form.partner_type);
  // Prevent multiple submissions
  if (isSubmitting.value || vendorStore.loading) {
    return;
  }
  if (!isFormValid.value) {
    return;
  }
  success.value = false;
  isSubmitting.value = true;
  try {
    await vendorStore.addVendor({ ...form });
    success.value = true;
    setTimeout(() => {
      resetForm();
      success.value = false;
    }, 2000);
  } catch (err: any) {
    if (err.message && err.message.includes("email")) {
      errors.email = err.message;
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>
<style scoped>
.vendor-form-container {
  background-color: var(--color-bg-secondary);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.vendor-form-container:hover {
  box-shadow: var(--shadow-lg);
}

.vendor-form-container h2 {
  margin-top: 0;
  color: var(--color-text-primary);
}

.form-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-lg);
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.required {
  color: var(--color-error);
  font-weight: var(--font-weight-bold);
}

.form-input {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.form-input:hover {
  border-color: var(--color-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background-color: var(--color-bg-secondary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-input[aria-invalid="true"] {
  border-color: var(--color-error);
  background-color: var(--color-error-light);
}

.error-message {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}

.alert {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-md);
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  font-size: var(--font-size-sm);
  animation: slideIn var(--transition-base) ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-error {
  background-color: var(--color-error-light);
  color: var(--color-error);
  border: 1px solid var(--color-error);
}

.alert-success {
  background-color: var(--color-success-light);
  color: var(--color-success);
  border: 1px solid var(--color-success);
}

.alert-icon {
  flex-shrink: 0;
}

.form-actions {
  margin-top: var(--spacing-xl);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  justify-content: center;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
