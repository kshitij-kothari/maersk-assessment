<script setup lang="ts">
import { ref, onMounted } from "vue";
import VendorForm from "./components/VendorForm.vue";
import VendorList from "./components/VendorList.vue";

const isDarkMode = ref(false);
onMounted(() => {
  if (typeof localStorage === "undefined" || typeof globalThis === "undefined")
    return;
  const storedPreference = localStorage.getItem("theme-chosen");
  const prefersDark = globalThis.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  isDarkMode.value =
    storedPreference === "dark" || (storedPreference === null && prefersDark);
  changeTheme();
});

const toggleThemeHandler = () => {
  isDarkMode.value = !isDarkMode.value;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("theme-chosen", isDarkMode.value ? "dark" : "light");
  }
  changeTheme();
};

const changeTheme = () => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (isDarkMode.value) {
    root.classList.add("dark-mode");
  } else {
    root.classList.remove("dark-mode");
  }
};
</script>
<template>
  <div class="app-wrapper">
    <header class="app-header">
      <div class="header-wrapper">
        <h1>🏢 Trusted Vendor Portal</h1>
        <button
          @click="toggleThemeHandler"
          class="theme-toggle-switch"
          :aria-label="
            isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
          "
          :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <span v-if="isDarkMode" class="theme-icon">☀️</span>
          <span v-else class="theme-icon">🌙</span>
        </button>
      </div>
    </header>
    <main class="main-app">
      <div class="content-wrapper">
        <aside class="form-wrapper">
          <VendorForm />
        </aside>
        <section class="list-wrapper">
          <VendorList />
        </section>
      </div>
    </main>
    <footer class="app-footer">
      <p>&copy; 2026 Trusted Vendor Portal. All rights reserved.</p>
    </footer>
  </div>
</template>
<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition:
    background-color var(--transition-base),
    color var(--transition-base);
}
.app-header {
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-lg) 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}
/* Extra small mobile devices */
@media (max-width: 374px) {
  .app-header {
    padding: var(--spacing-md) 0;
  }
}
.header-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-wrapper h1 {
  margin: 0;
  font-size: var(--font-size-2xl);
}
/* Extra small mobile devices */
@media (max-width: 374px) {
  .header-wrapper {
    padding: 0 var(--spacing-sm);
  }
  .header-wrapper h1 {
    font-size: var(--font-size-lg);
  }
}
.theme-toggle-switch {
  background-color: transparent;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-full);
  width: 44px;
  height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}
/* Extra small mobile devices */
@media (max-width: 374px) {
  .theme-toggle-switch {
    width: 40px;
    height: 40px;
    font-size: var(--font-size-base);
  }
}
.theme-toggle-switch:hover {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
  transform: scale(1.05);
}
.theme-toggle-switch:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
.theme-icon {
  display: block;
}
.main-app {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
}
/* Extra small mobile devices */
@media (max-width: 374px) {
  .main-app {
    padding: var(--spacing-md) var(--spacing-sm);
  }
}
/* Responsive Layout */
.content-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
}
/* Extra small mobile devices */
@media (max-width: 374px) {
  .content-wrapper {
    gap: var(--spacing-md);
  }
}
/* Tablet and Above */
@media (min-width: 768px) {
  .content-wrapper {
    grid-template-columns: 350px 1fr;
    align-items: start;
  }
  .form-wrapper {
    position: sticky;
    top: 100px;
  }
}
/* Desktop */
@media (min-width: 1024px) {
  .main-app {
    padding: var(--spacing-2xl) var(--spacing-xl);
  }
  .content-wrapper {
    gap: var(--spacing-2xl);
  }
}
.app-footer {
  margin-top: auto;
  padding: var(--spacing-lg) var(--spacing-md);
  text-align: center;
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
.app-footer p {
  margin: 0;
}
/* Extra small mobile devices */
@media (max-width: 374px) {
  .app-footer {
    padding: var(--spacing-md) var(--spacing-sm);
    font-size: var(--font-size-xs);
  }
}
</style>
