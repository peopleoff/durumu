<template>
  <div class="hud">
    <div class="hud-top">
      <div class="beam-badge" :class="`beam-${beam}`">
        {{ beamInfo.name }}
      </div>
      <div class="timer" :class="{ 'timer-warning': timeRemaining <= 10 }">
        {{ formatTime(timeRemaining) }}
      </div>
    </div>

    <div class="hud-bottom">
      <!-- Red beam: fog status -->
      <template v-if="beam === 'red'">
        <div class="stat-row">
          <span class="stat-label">Crimson Fogs</span>
          <div class="fog-indicators">
            <span
              v-for="i in 3"
              :key="i"
              class="fog-dot"
              :class="{ killed: fogsKilled >= i }"
            />
          </div>
        </div>
        <div v-if="crimsonBlooms > 0" class="stat-row warning">
          <span class="stat-label">Crimson Blooms</span>
          <span class="stat-value">{{ crimsonBlooms }}</span>
        </div>
      </template>

      <!-- Blue beam: reveal counter -->
      <template v-if="beam === 'blue'">
        <div class="stat-row">
          <span class="stat-label">Azure Reveals</span>
          <span class="stat-value" :class="{ warning: azureReveals > 0 }">
            {{ azureReveals }}
          </span>
        </div>
        <div class="stat-row hint">
          Keep the beam away from the fog locations!
        </div>
      </template>

      <!-- Yellow beam: cone tracking -->
      <template v-if="beam === 'yellow'">
        <div class="stat-row">
          <span class="stat-label">In Cone</span>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :class="playerInCone ? 'fill-good' : 'fill-bad'"
              :style="{ width: `${conePercentage}%` }"
            />
          </div>
          <span class="stat-value">{{ Math.round(conePercentage) }}%</span>
        </div>
        <div class="stat-row" :class="playerInCone ? 'status-good' : 'status-bad'">
          {{ playerInCone ? 'Soaking damage!' : 'Get inside the cone!' }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BeamType } from '~/utils/types'
import { BEAM_COLORS, GAME_CONFIGS } from '~/utils/constants'

const props = defineProps<{
  beam: BeamType
  elapsed: number
  fogsKilled?: number
  crimsonBlooms?: number
  azureReveals?: number
  playerInCone?: boolean
  timeInCone?: number
  timeOutOfCone?: number
}>()

const beamInfo = computed(() => BEAM_COLORS[props.beam])
const config = computed(() => GAME_CONFIGS[props.beam])

const timeRemaining = computed(() =>
  Math.max(0, config.value.phaseDuration - props.elapsed),
)

const conePercentage = computed(() => {
  const total = (props.timeInCone ?? 0) + (props.timeOutOfCone ?? 0)
  if (total === 0) return 100
  return ((props.timeInCone ?? 0) / total) * 100
})

function formatTime(seconds: number): string {
  const s = Math.ceil(seconds)
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}:${rem.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
  z-index: 10;
}

.hud-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.beam-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.beam-red { background: rgba(255, 32, 32, 0.25); color: #ff6666; border: 1px solid rgba(255, 32, 32, 0.4); }
.beam-blue { background: rgba(32, 128, 255, 0.25); color: #66aaff; border: 1px solid rgba(32, 128, 255, 0.4); }
.beam-yellow { background: rgba(255, 204, 0, 0.25); color: #ffdd44; border: 1px solid rgba(255, 204, 0, 0.4); }

.timer {
  font-size: 1.4rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
}

.timer-warning {
  color: #ff4444;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.hud-bottom {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 8px 12px;
  backdrop-filter: blur(4px);
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.stat-label {
  font-weight: 600;
  color: var(--text-primary);
}

.stat-value {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.warning { color: #ff6644; }
.hint { font-style: italic; font-size: 0.75rem; color: var(--text-muted); }
.status-good { color: #44cc44; font-weight: 600; }
.status-bad { color: #ff4444; font-weight: 600; }

.fog-indicators {
  display: flex;
  gap: 6px;
}

.fog-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 68, 68, 0.2);
  border: 2px solid rgba(255, 68, 68, 0.5);
}

.fog-dot.killed {
  background: #44cc44;
  border-color: #44cc44;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.fill-good { background: #44cc44; }
.fill-bad { background: #ff4444; }
</style>
