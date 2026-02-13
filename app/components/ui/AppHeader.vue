<template>
  <header class="app-header">
    <NuxtLink to="/" class="header-brand">
      <span class="brand-icon">👁</span>
      <div class="brand-text">
        <span class="brand-title">Durumu</span>
        <span class="brand-subtitle">Light Spectrum Trainer</span>
      </div>
    </NuxtLink>
  </header>
</template>

<style scoped>
.app-header {
  width: 100%;
  padding: 16px 24px;
  display: flex;
  align-items: center;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.brand-icon {
  font-size: 1.5rem;
}

.brand-title {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.brand-subtitle {
  display: block;
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
</style>
