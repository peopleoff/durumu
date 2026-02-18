<template>
  <div class="results-overlay">
    <div class="results-card">
      <h2 class="results-title">Peg's Assessment</h2>

      <div class="grade-display" :class="`grade-${score.grade.toLowerCase()}`">
        {{ score.grade }}
      </div>
      <p class="grade-mood" :class="`mood-${score.grade.toLowerCase()}`">{{ pegMood }}</p>

      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">Beam</span>
          <span class="stat-value" :class="`text-${score.beam}`">
            {{ beamName }}
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Time</span>
          <span class="stat-value">{{ formatTime(score.totalTime) }}</span>
        </div>

        <template v-if="score.beam === 'red'">
          <div class="stat-item">
            <span class="stat-label">Fogs Killed</span>
            <span class="stat-value">{{ score.fogsKilled }}/3</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Crimson Blooms</span>
            <span class="stat-value" :class="{ 'text-danger': score.crimsonBlooms > 0 }">
              {{ score.crimsonBlooms }}
            </span>
          </div>
        </template>

        <template v-if="score.beam === 'blue'">
          <div class="stat-item">
            <span class="stat-label">Azure Reveals</span>
            <span class="stat-value" :class="{ 'text-danger': score.azureReveals > 0 }">
              {{ score.azureReveals }}
            </span>
          </div>
        </template>

        <template v-if="score.beam === 'yellow'">
          <div class="stat-item">
            <span class="stat-label">Cone Uptime</span>
            <span class="stat-value">{{ coneUptime }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Amber Fogs Killed</span>
            <span class="stat-value">{{ score.amberFogsKilled }}</span>
          </div>
          <div v-if="score.amberBursts > 0" class="stat-item">
            <span class="stat-label">Burst of Amber</span>
            <span class="stat-value text-danger">RAID WIPE</span>
          </div>
        </template>
      </div>

      <div class="feedback">
        <p v-for="(detail, i) in score.details" :key="i">{{ detail }}</p>
      </div>

      <div class="actions">
        <button class="btn btn-primary btn-lg" @click="$emit('retry')">
          Retry
        </button>
        <button class="btn" @click="$emit('menu')">
          Pick Another Beam
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameScore } from '~/utils/types'
import { BEAM_COLORS } from '~/utils/constants'

const props = defineProps<{
  score: GameScore
}>()

defineEmits<{
  retry: []
  menu: []
}>()

const beamName = computed(() => BEAM_COLORS[props.score.beam].name)

const pegMood = computed(() => {
  switch (props.score.grade) {
    case 'S': return '...Begrudgingly Impressed'
    case 'A': return 'Mildly Content'
    case 'B': return 'Visibly Sighing'
    case 'C': return 'Deeply Disappointed'
    case 'F': return 'Has Left Voice Chat'
  }
})

const coneUptime = computed(() => {
  const total = props.score.timeInCone + props.score.timeOutOfCone
  if (total === 0) return 0
  return Math.round((props.score.timeInCone / total) * 100)
})

function formatTime(seconds: number): string {
  return `${seconds.toFixed(1)}s`
}
</script>

<style scoped>
.results-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.results-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 32px;
  max-width: 440px;
  width: 100%;
  text-align: center;
  border: 1px solid var(--border-color);
}

.results-title {
  font-size: 1.2rem;
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.grade-display {
  font-size: 5rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 6px;
}

.grade-mood {
  font-size: 0.95rem;
  font-style: italic;
  margin-bottom: 24px;
}

.mood-s { color: var(--grade-s); }
.mood-a { color: var(--grade-a); }
.mood-b { color: var(--grade-b); }
.mood-c { color: var(--grade-c); }
.mood-f { color: var(--grade-f); }

.grade-s { color: var(--grade-s); text-shadow: 0 0 30px var(--grade-s); }
.grade-a { color: var(--grade-a); text-shadow: 0 0 30px var(--grade-a); }
.grade-b { color: var(--grade-b); text-shadow: 0 0 30px var(--grade-b); }
.grade-c { color: var(--grade-c); text-shadow: 0 0 20px var(--grade-c); }
.grade-f { color: var(--grade-f); text-shadow: 0 0 20px var(--grade-f); }

.stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--bg-card);
  border-radius: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.stat-label { color: var(--text-secondary); }
.stat-value { font-weight: 700; font-variant-numeric: tabular-nums; }

.text-red { color: var(--red-solid); }
.text-blue { color: var(--blue-solid); }
.text-yellow { color: var(--yellow-solid); }
.text-danger { color: #ff4444; }

.feedback {
  margin-bottom: 24px;
  padding: 12px 16px;
  background: rgba(136, 68, 204, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(136, 68, 204, 0.2);
}

.feedback p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.actions .btn {
  width: 100%;
}
</style>
