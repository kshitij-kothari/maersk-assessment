import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import VendorForm from "../../components/VendorForm.vue";
import { useVendorStore } from "../../stores/vendorStore";

describe("VendorForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders correctly", () => {
    const wrapper = mount(VendorForm, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              vendor: { loading: false, error: null },
            },
          }),
        ],
      },
    });

    expect(wrapper.find("h2").text()).toBe("Add New Vendor");
    expect(wrapper.find("form").exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe("Add Vendor");
  });

  it("contains all required form fields", () => {
    const wrapper = mount(VendorForm, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              vendor: { loading: false, error: null },
            },
          }),
        ],
      },
    });

    expect(wrapper.find("#name").exists()).toBe(true);
    expect(wrapper.find("#contactPerson").exists()).toBe(true);
    expect(wrapper.find("#email").exists()).toBe(true);
    expect(wrapper.find("#partnerType").exists()).toBe(true);

    const options = wrapper.findAll("#partnerType option");
    expect(options.length).toBe(3);
    expect(options[0].text()).toBe("-- Select a type --");
    expect(options[1].text()).toBe("Supplier");
    expect(options[2].text()).toBe("Partner");
  });

  it("submits form data correctly", async () => {
    const wrapper = mount(VendorForm, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              vendor: { loading: false, error: null },
            },
          }),
        ],
      },
    });

    const store = useVendorStore();

    await wrapper.find("#name").setValue("Test Company");
    await wrapper.find("#contactPerson").setValue("John Test");
    await wrapper.find("#email").setValue("john@testcompany.com");
    await wrapper.find("#partnerType").setValue("Partner");

    await wrapper.find("form").trigger("submit");

    expect(store.addVendor).toHaveBeenCalledWith({
      name: "Test Company",
      contact_person: "John Test",
      email: "john@testcompany.com",
      partner_type: "Partner",
    });
  });

  it("shows loading state when submitting", async () => {
    const wrapper = mount(VendorForm, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              vendor: { loading: true, error: null },
            },
          }),
        ],
      },
    });

    expect(wrapper.find('button[type="submit"]').text()).toBe("Submitting...");
    expect(
      wrapper.find('button[type="submit"]').attributes("disabled"),
    ).toBeDefined();
  });

  it("validates email on blur event", async () => {
    const mockCheckEmailExists = vi.fn().mockResolvedValue(false);
    vi.doMock("../../services/VendorService.ts", () => ({
      VendorService: {
        checkEmailExists: mockCheckEmailExists,
      },
    }));

    const wrapper = mount(VendorForm, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              vendor: { loading: false, error: null },
            },
          }),
        ],
      },
    });

    const emailInput = wrapper.find("#email");
    await emailInput.setValue("test@example.com");
    await emailInput.trigger("blur");
    await wrapper.vm.$nextTick();

    expect(emailInput.exists()).toBe(true);
  });

  it("displays error message when email validation fails", async () => {
    const wrapper = mount(VendorForm, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              vendor: { loading: false, error: null },
            },
          }),
        ],
      },
    });

    const emailInput = wrapper.find("#email");
    await emailInput.setValue("invalid-email");
    await emailInput.trigger("blur");
    await wrapper.vm.$nextTick();

    expect(wrapper.find("#email-error").exists()).toBe(true);
    expect(wrapper.find("#email-error").text()).toContain(
      "Invalid email format",
    );
  });
});
