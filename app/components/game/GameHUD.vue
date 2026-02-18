<template>
  <div class="hud">
    <!-- Unified top panel -->
    <div class="hud-panel-top">
      <!-- Left: beam identity -->
      <div class="panel-section section-beam">
        <div class="beam-badge" :class="`beam-${beam}`">
          {{ beamInfo.name }}
        </div>
      </div>

      <!-- Center: timer -->
      <div class="panel-section section-timer">
        <div
          v-if="props.warmupRemaining > 0"
          class="timer-ring timer-warmup"
          :style="warmupRingStyle"
        >
          <span class="timer-text">{{ Math.ceil(props.warmupRemaining) }}</span>
        </div>
        <div
          v-else
          class="timer-ring"
          :class="timerClasses"
          :style="timerRingStyle"
        >
          <span class="timer-text">{{ formatTime(timeRemaining) }}</span>
        </div>
      </div>

      <!-- Right: score + grade -->
      <div class="panel-section section-score">
        <div class="score-block">
          <span class="score-label">SCORE</span>
          <span class="score-value" :class="`score-${beam}`">{{ displayPoints.toLocaleString() }}</span>
        </div>
        <div class="grade-block" :class="`grade-${projectedGrade}`">
          {{ projectedGrade }}
        </div>
      </div>
    </div>

    <!-- Event pop-ups (anchored below top panel) -->
    <div class="events-container">
      <TransitionGroup name="event-pop">
        <div
          v-for="event in events"
          :key="event.id"
          class="event-popup"
          :class="event.positive ? 'event-positive' : 'event-negative'"
        >
          {{ event.points > 0 ? '+' : '' }}{{ event.points.toLocaleString() }} {{ event.text }}
        </div>
      </TransitionGroup>
    </div>

    <!-- Spacer to push bottom panel down -->
    <div class="hud-spacer" />

    <!-- Bottom stats panel (beam-specific) -->
    <div class="hud-panel-bottom">
      <!-- Red beam -->
      <template v-if="beam === 'red'">
        <div class="stat-row">
          <span class="stat-label">Fogs</span>
          <div class="fog-indicators">
            <span
              v-for="i in 3"
              :key="i"
              class="fog-dot"
              :class="{ killed: fogsKilled >= i }"
            />
          </div>
          <span class="stat-detail">{{ fogsKilled }}/3</span>
        </div>
        <div v-if="crimsonBlooms > 0" class="stat-row stat-warning">
          <span class="stat-label">Blooms</span>
          <span class="stat-detail">{{ crimsonBlooms }}</span>
        </div>
      </template>

      <!-- Blue beam -->
      <template v-if="beam === 'blue'">
        <div class="stat-row">
          <span class="stat-label">Reveals</span>
          <span class="stat-detail" :class="{ 'stat-warning': azureReveals > 0 }">
            {{ azureReveals }}
          </span>
        </div>
      </template>

      <!-- Yellow beam -->
      <template v-if="beam === 'yellow'">
        <div class="stat-row">
          <span class="stat-label">Cone</span>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :class="playerInCone ? 'fill-good' : 'fill-bad'"
              :style="{ width: `${conePercentage}%` }"
            />
          </div>
          <span class="stat-detail">{{ Math.round(conePercentage) }}%</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Fogs</span>
          <div class="fog-indicators">
            <span
              v-for="i in 2"
              :key="i"
              class="fog-dot fog-dot-amber"
              :class="{ killed: (amberFogsKilled ?? 0) >= i }"
            />
          </div>
          <span class="stat-detail">{{ amberFogsKilled ?? 0 }} killed</span>
        </div>
        <div v-if="amberBursts > 0" class="stat-row stat-warning">
          <span class="stat-label">WIPE</span>
          <span class="stat-detail">Burst of Amber!</span>
        </div>
        <div class="stat-row" :class="playerInCone ? 'cone-status-good' : 'cone-status-bad'">
          {{ playerInCone ? 'Inside cone' : 'Outside cone!' }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BeamType } from '~/utils/types'
import { BEAM_COLORS, GAME_CONFIGS, TIMER_THRESHOLDS, WARMUP } from '~/utils/constants'
import { useLiveScore } from '~/composables/useLiveScore'

const props = withDefaults(defineProps<{
  beam: BeamType
  elapsed: number
  warmupRemaining?: number
  fogsKilled?: number
  crimsonBlooms?: number
  azureReveals?: number
  amberBursts?: number
  amberFogsKilled?: number
  playerInCone?: boolean
  timeInCone?: number
  timeOutOfCone?: number
}>(), {
  warmupRemaining: 0,
  fogsKilled: 0,
  crimsonBlooms: 0,
  azureReveals: 0,
  amberBursts: 0,
  amberFogsKilled: 0,
  playerInCone: false,
  timeInCone: 0,
  timeOutOfCone: 0,
})

const beamInfo = computed(() => BEAM_COLORS[props.beam])
const config = computed(() => GAME_CONFIGS[props.beam])

const timeRemaining = computed(() =>
  Math.max(0, config.value.phaseDuration - props.elapsed),
)

const timePercent = computed(() =>
  config.value.phaseDuration > 0
    ? timeRemaining.value / config.value.phaseDuration
    : 0,
)

const { points, projectedGrade, events } = useLiveScore(props)

const displayPoints = computed(() => points.value)

const warmupRingStyle = computed(() => {
  const filled = (props.warmupRemaining / WARMUP.DURATION) * 360
  return {
    background: `conic-gradient(#aa66ff ${filled}deg, rgba(255,255,255,0.06) ${filled}deg)`,
  }
})

const timerRingColor = computed(() => {
  if (timePercent.value <= TIMER_THRESHOLDS.criticalPercent) return '#ff2020'
  if (timePercent.value <= TIMER_THRESHOLDS.warningPercent) return '#ff8800'
  return beamInfo.value.solid
})

const timerRingStyle = computed(() => {
  const filled = timePercent.value * 360
  return {
    background: `conic-gradient(${timerRingColor.value} ${filled}deg, rgba(255,255,255,0.06) ${filled}deg)`,
  }
})

const timerClasses = computed(() => ({
  'timer-pulse': timeRemaining.value <= TIMER_THRESHOLDS.pulseSeconds,
  'timer-shake': timeRemaining.value <= TIMER_THRESHOLDS.shakeSeconds,
}))

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
  left: 0;
  right: 0;
  top: -52px;
  bottom: -40px;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  padding: 0 4px;
  z-index: 10;
  gap: 6px;
}

/* ── Top panel (unified bar) ── */
.hud-panel-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 6px 10px;
  gap: 8px;
}

.panel-section {
  display: flex;
  align-items: center;
}

.section-beam {
  flex: 1;
  justify-content: flex-start;
}

.section-timer {
  flex: 0 0 auto;
}

.section-score {
  flex: 1;
  justify-content: flex-end;
  gap: 8px;
}

/* Beam badge */
.beam-badge {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.beam-red { background: rgba(255, 32, 32, 0.2); color: #ff7777; border: 1px solid rgba(255, 32, 32, 0.3); }
.beam-blue { background: rgba(32, 128, 255, 0.2); color: #77aaff; border: 1px solid rgba(32, 128, 255, 0.3); }
.beam-yellow { background: rgba(255, 204, 0, 0.2); color: #ffdd55; border: 1px solid rgba(255, 204, 0, 0.3); }

/* Timer ring */
.timer-ring {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.timer-ring::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: rgba(8, 8, 16, 0.95);
}

.timer-text {
  position: relative;
  z-index: 1;
  font-size: 0.8rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #eee;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.9);
}

.timer-warmup {
  animation: pulse 1.5s infinite;
}

.timer-pulse {
  animation: pulse 1s infinite;
}

.timer-shake {
  animation: shake 0.4s infinite, pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

/* Score + grade */
.score-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.1;
}

.score-label {
  font-size: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.35);
}

.score-value {
  font-size: 1.05rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.score-red { color: #ff7777; }
.score-blue { color: #77aaff; }
.score-yellow { color: #ffdd55; }

.grade-block {
  width: 26px;
  height: 26px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
  flex-shrink: 0;
}

.grade-S { background: rgba(255, 200, 0, 0.25); color: #ffd700; border: 1px solid rgba(255, 200, 0, 0.4); }
.grade-A { background: rgba(68, 204, 68, 0.25); color: #44cc44; border: 1px solid rgba(68, 204, 68, 0.4); }
.grade-B { background: rgba(32, 128, 255, 0.25); color: #66aaff; border: 1px solid rgba(32, 128, 255, 0.4); }
.grade-C { background: rgba(255, 136, 0, 0.25); color: #ff8800; border: 1px solid rgba(255, 136, 0, 0.4); }
.grade-F { background: rgba(255, 32, 32, 0.25); color: #ff4444; border: 1px solid rgba(255, 32, 32, 0.4); }

/* ── Events (below top panel) ── */
.events-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-height: 24px;
}

.event-popup {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
  background: rgba(0, 0, 0, 0.4);
}

.event-positive { color: #44ee44; }
.event-negative { color: #ff5555; }

.event-pop-enter-active {
  transition: all 0.25s ease-out;
}
.event-pop-leave-active {
  transition: all 0.6s ease-in;
}
.event-pop-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.9);
}
.event-pop-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* Spacer */
.hud-spacer {
  flex: 1;
}

/* ── Bottom stats panel ── */
.hud-panel-bottom {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 6px 10px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.6);
}

.stat-label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  min-width: 44px;
}

.stat-detail {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, 0.7);
  margin-left: auto;
}

.stat-warning { color: #ff6644; }
.stat-warning .stat-detail { color: #ff6644; }
.cone-status-good { color: #44cc44; font-weight: 600; font-size: 0.72rem; }
.cone-status-bad { color: #ff5555; font-weight: 600; font-size: 0.72rem; }

.fog-indicators {
  display: flex;
  gap: 5px;
}

.fog-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 68, 68, 0.15);
  border: 1.5px solid rgba(255, 68, 68, 0.4);
  transition: all 0.3s ease;
}

.fog-dot.killed {
  background: #44cc44;
  border-color: #44cc44;
}

.fog-dot-amber {
  background: rgba(255, 170, 0, 0.15);
  border-color: rgba(255, 170, 0, 0.4);
}

.progress-bar {
  flex: 1;
  height: 5px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.fill-good { background: #44cc44; }
.fill-bad { background: #ff5555; }

/* ── Mobile ── */
@media (max-width: 480px) {
  .hud { padding: 6px; }
  .hud-panel-top { padding: 4px 8px; gap: 6px; }
  .timer-ring { width: 40px; height: 40px; }
  .timer-text { font-size: 0.7rem; }
  .score-value { font-size: 0.9rem; }
  .beam-badge { font-size: 0.58rem; padding: 2px 7px; }
  .grade-block { width: 22px; height: 22px; font-size: 0.65rem; }
  .event-popup { font-size: 0.7rem; }
}
</style>
