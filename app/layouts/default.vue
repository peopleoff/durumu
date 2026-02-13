<template>
  <div class="app-wrapper">
    <slot />
  </div>
</template>

<style scoped>
.app-wrapper {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
</style>
