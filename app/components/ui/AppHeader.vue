<template>
  <header class="app-header">
    <NuxtLink to="/" class="header-brand">
      <img src="~/assets/images/boss.png" alt="Durumu" class="brand-icon" />
      <div class="brand-text">
        <span class="brand-title">Durumu</span>
        <span class="brand-subtitle">Peg's Mandatory Practice</span>
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
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 18, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid transparent;
  border-image: linear-gradient(90deg, transparent, var(--border-color), transparent) 1;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.brand-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 10px var(--purple-glow), 0 0 4px var(--purple-accent);
}

.brand-title {
  display: block;
  font-family: var(--font-display);
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
