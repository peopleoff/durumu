<template>
  <button class="beam-card" :class="`beam-card-${beam}`" @click="$emit('select')">
    <div class="card-icon-wrap">
      <img :src="beamImage" :alt="beamInfo.name" class="card-icon-img" />
    </div>
    <h3 class="card-title">{{ beamInfo.name }}</h3>
    <p class="card-desc">{{ beamInfo.description }}</p>
    <div class="card-best" :class="{ 'has-score': bestScore }">
      <span class="best-label">Best</span>
      <div class="best-content">
        <template v-if="bestScore">
          <span class="best-grade" :class="`grade-${bestScore.grade.toLowerCase()}`">{{ bestScore.grade }}</span>
          <span class="best-detail">{{ bestDetail }}</span>
        </template>
        <span v-else class="best-empty">No attempts yet</span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { BeamType } from '~/utils/types'
import type { BestScore } from '~/composables/useLocalScores'
import { BEAM_COLORS } from '~/utils/constants'
import redLightImg from '~/assets/images/red-light.png'
import blueLightImg from '~/assets/images/blue-light.png'
import yellowLightImg from '~/assets/images/yellow-light.png'

const props = defineProps<{
  beam: BeamType
  bestScore?: BestScore
}>()

defineEmits<{
  select: []
}>()

const beamInfo = computed(() => BEAM_COLORS[props.beam])

const beamImage = computed(() => {
  switch (props.beam) {
    case 'red': return redLightImg
    case 'blue': return blueLightImg
    case 'yellow': return yellowLightImg
  }
})

const bestDetail = computed(() => {
  const s = props.bestScore
  if (!s) return ''
  switch (props.beam) {
    case 'red': return `${s.fogsKilled ?? 0}/3 fogs · ${s.totalTime.toFixed(1)}s`
    case 'blue': return `${s.azureReveals ?? 0} reveals`
    case 'yellow': return `${s.coneUptime ?? 0}% uptime`
  }
})
</script>

<style scoped>
.beam-card {
  position: relative;
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
  overflow: hidden;
  z-index: 0;
}

.beam-card::before {
  content: '';
  position: absolute;
  inset: -2px;
  z-index: -1;
  border-radius: 14px;
  opacity: 0;
  transition: opacity 0.3s ease;
  animation: rotate-border 4s linear infinite;
}

.beam-card-red::before {
  background: conic-gradient(from 0deg, var(--red-solid), transparent 40%, var(--red-solid));
}
.beam-card-blue::before {
  background: conic-gradient(from 0deg, var(--blue-solid), transparent 40%, var(--blue-solid));
}
.beam-card-yellow::before {
  background: conic-gradient(from 0deg, var(--yellow-solid), transparent 40%, var(--yellow-solid));
}

.beam-card::after {
  content: '';
  position: absolute;
  inset: 1px;
  background: var(--bg-card);
  border-radius: 11px;
  z-index: -1;
  transition: background 0.25s ease;
}

.beam-card:hover {
  transform: translateY(-6px);
}

.beam-card:hover::before {
  opacity: 1;
  animation-duration: 2s;
}

.beam-card:hover::after {
  background: var(--bg-card-hover);
}

.beam-card-red:hover { box-shadow: 0 12px 40px rgba(255, 32, 32, 0.2); }
.beam-card-blue:hover { box-shadow: 0 12px 40px rgba(32, 128, 255, 0.2); }
.beam-card-yellow:hover { box-shadow: 0 12px 40px rgba(255, 204, 0, 0.2); }

.card-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.beam-card-red .card-icon-wrap { box-shadow: 0 0 16px var(--red-glow); }
.beam-card-blue .card-icon-wrap { box-shadow: 0 0 16px var(--blue-glow); }
.beam-card-yellow .card-icon-wrap { box-shadow: 0 0 16px var(--yellow-glow); }

.card-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.card-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
}

.card-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.card-best {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  padding: 10px 12px;
  width: calc(100% + 40px);
  margin-bottom: -24px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0 0 12px 12px;
}

.best-label {
  font-family: var(--font-display);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--text-muted);
}

.best-content {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
}

.best-grade {
  font-weight: 800;
  font-size: 1.1rem;
  line-height: 1;
}

.best-detail {
  color: var(--text-secondary);
  font-size: 0.78rem;
}

.best-empty {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-style: italic;
}

.grade-s { color: var(--grade-s); }
.grade-a { color: var(--grade-a); }
.grade-b { color: var(--grade-b); }
.grade-c { color: var(--grade-c); }
.grade-f { color: var(--grade-f); }
</style>
