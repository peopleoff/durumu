<template>
  <div class="modal-overlay">
    <div class="modal" :class="`modal-${beam}`">
      <div class="modal-icon">{{ icon }}</div>
      <h2 class="modal-title">{{ beamInfo.name }}</h2>
      <p class="modal-subtitle">{{ beamInfo.description }}</p>

      <div class="instructions">
        <template v-if="beam === 'red'">
          <div class="instruction-step">
            <span class="step-num">1</span>
            <p><strong>Sweep</strong> your beam around the arena to find 3 hidden <span class="highlight-red">Crimson Fogs</span>.</p>
          </div>
          <div class="instruction-step">
            <span class="step-num">2</span>
            <p>Once a fog is revealed, <strong>hold the beam steady</strong> on it until its health reaches zero.</p>
          </div>
          <div class="instruction-step">
            <span class="step-num">3</span>
            <p><strong>Do NOT</strong> move the beam off a revealed fog! This triggers <span class="highlight-red">Crimson Bloom</span> (raid wipe).</p>
          </div>
          <div class="instruction-step">
            <span class="step-num">4</span>
            <p>Kill all 3 fogs before time runs out.</p>
          </div>
        </template>

        <template v-if="beam === 'blue'">
          <div class="instruction-step">
            <span class="step-num">1</span>
            <p>You control the blue beam. <span class="highlight-blue">Azure Fogs</span> are hidden on the platform.</p>
          </div>
          <div class="instruction-step">
            <span class="step-num">2</span>
            <p><strong>AVOID</strong> shining your beam on them! Revealing an Azure Fog causes increasing raid damage.</p>
          </div>
          <div class="instruction-step">
            <span class="step-num">3</span>
            <p>Watch for periodic <strong>flash hints</strong> that briefly show fog locations.</p>
          </div>
          <div class="instruction-step">
            <span class="step-num">4</span>
            <p>Position your beam in a safe spot and <strong>stay relatively still</strong>. Survive the timer!</p>
          </div>
        </template>

        <template v-if="beam === 'yellow'">
          <div class="instruction-step">
            <span class="step-num">1</span>
            <p>The <span class="highlight-yellow">yellow cone</span> moves on its own, rotating around the arena.</p>
          </div>
          <div class="instruction-step">
            <span class="step-num">2</span>
            <p><strong>Follow it!</strong> Keep your cursor/finger <strong>inside the cone</strong> at all times.</p>
          </div>
          <div class="instruction-step">
            <span class="step-num">3</span>
            <p>The cone will change <strong>speed and direction</strong> periodically. Stay alert!</p>
          </div>
          <div class="instruction-step">
            <span class="step-num">4</span>
            <p>Maximize your time inside the cone to soak the damage for your raid.</p>
          </div>
        </template>
      </div>

      <button class="btn btn-lg start-btn" :class="`btn-${beam}`" @click="$emit('start')">
        Ready!
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BeamType } from '~/utils/types'
import { BEAM_COLORS } from '~/utils/constants'

const props = defineProps<{
  beam: BeamType
}>()

defineEmits<{
  start: []
}>()

const beamInfo = computed(() => BEAM_COLORS[props.beam])

const icon = computed(() => {
  switch (props.beam) {
    case 'red': return '🔴'
    case 'blue': return '🔵'
    case 'yellow': return '🟡'
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 32px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  border: 1px solid var(--border-color);
}

.modal-red { border-color: rgba(255, 32, 32, 0.3); }
.modal-blue { border-color: rgba(32, 128, 255, 0.3); }
.modal-yellow { border-color: rgba(255, 204, 0, 0.3); }

.modal-icon {
  font-size: 3rem;
  margin-bottom: 8px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.modal-subtitle {
  color: var(--text-secondary);
  margin-bottom: 24px;
  font-size: 0.95rem;
}

.instructions {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 28px;
}

.instruction-step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.step-num {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.instruction-step p {
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-secondary);
}

.instruction-step strong {
  color: var(--text-primary);
}

.highlight-red { color: var(--red-solid); font-weight: 600; }
.highlight-blue { color: var(--blue-solid); font-weight: 600; }
.highlight-yellow { color: var(--yellow-solid); font-weight: 600; }

.start-btn {
  width: 100%;
  font-size: 1.1rem;
  padding: 14px;
}
</style>
