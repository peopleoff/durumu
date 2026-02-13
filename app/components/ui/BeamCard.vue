<template>
  <button class="beam-card" :class="`beam-card-${beam}`" @click="$emit('select')">
    <div class="card-icon">{{ icon }}</div>
    <h3 class="card-title">{{ beamInfo.name }}</h3>
    <p class="card-desc">{{ beamInfo.description }}</p>
    <div class="card-role">{{ role }}</div>
  </button>
</template>

<script setup lang="ts">
import type { BeamType } from '~/utils/types'
import { BEAM_COLORS } from '~/utils/constants'

const props = defineProps<{
  beam: BeamType
}>()

defineEmits<{
  select: []
}>()

const beamInfo = computed(() => BEAM_COLORS[props.beam])

const icon = computed(() => {
  switch (props.beam) {
    case 'red': return '🔴'
    case 'blue': return '🔵'
    case 'yellow': return '🟡'
  }
})

const role = computed(() => {
  switch (props.beam) {
    case 'red': return 'Melee DPS'
    case 'blue': return 'Healers / Ranged'
    case 'yellow': return 'Tanks'
  }
})
</script>

<style scoped>
.beam-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.25s ease;
  cursor: pointer;
  text-align: center;
  width: 100%;
  color: var(--text-primary);
}

.beam-card:hover {
  transform: translateY(-4px);
  background: var(--bg-card-hover);
}

.beam-card-red:hover { border-color: rgba(255, 32, 32, 0.5); box-shadow: 0 8px 30px rgba(255, 32, 32, 0.15); }
.beam-card-blue:hover { border-color: rgba(32, 128, 255, 0.5); box-shadow: 0 8px 30px rgba(32, 128, 255, 0.15); }
.beam-card-yellow:hover { border-color: rgba(255, 204, 0, 0.5); box-shadow: 0 8px 30px rgba(255, 204, 0, 0.15); }

.card-icon { font-size: 2.5rem; }

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
}

.card-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.card-role {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-top: 4px;
}
</style>
