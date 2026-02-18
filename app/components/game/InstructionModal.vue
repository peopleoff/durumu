<template>
  <div class="modal-overlay">
    <div class="modal" :class="`modal-${beam}`">
      <div class="modal-icon">{{ icon }}</div>
      <h2 class="modal-title">{{ beamInfo.name }}</h2>
      <p class="modal-subtitle">{{ beamInfo.description }}</p>

      <div class="instructions">
        <template v-if="beam === 'red'">
          <div class="controls-hint">Use <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrow keys to move around the arena.</div>
          <div class="controls-hint">Click on the fogs to attack them.</div>
          <div class="instruction-step">
            <span class="step-num">1</span>
            <p><strong>Sweep</strong> your beam around the arena to find 3 hidden <span class="highlight-red">Crimson Fogs</span>.</p>
          </div>
          <div class="instruction-step">
            <span class="step-num">2</span>
            <p>Once a fog is revealed, <strong>click/tap it</strong> to deal damage. It takes <strong>3 hits</strong> to kill each fog.</p>
          </div>
          <div class="instruction-step">
            <span class="step-num">3</span>
            <p><strong>Keep the beam on it</strong> while clicking — moving the beam off a revealed fog triggers <span class="highlight-red">Crimson Bloom</span> (raid wipe).</p>
          </div>
          <div class="instruction-step">
            <span class="step-num">4</span>
            <p>Kill all 3 fogs before time runs out.</p>
          </div>
        </template>

        <template v-if="beam === 'blue'">
          <div class="controls-hint">Use <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrow keys to move around the arena.</div>
          <div class="instruction-step">
            <span class="step-num">1</span>
            <p>You control the blue beam. A single <span class="highlight-blue">Azure Fog</span> is hidden on the platform.</p>
          </div>
          <div class="instruction-step">
            <span class="step-num">2</span>
            <p><strong>DO NOT</strong> shine your beam on it! Revealing it casts <span class="highlight-blue">Icy Grasp</span> on nearby players. If killed, <span class="highlight-blue">Flash Freeze</span> wipes the raid.</p>
          </div>
          <div class="instruction-step">
            <span class="step-num">3</span>
            <p>Watch for periodic <strong>flash hints</strong> that briefly show the fog's location.</p>
          </div>
          <div class="instruction-step">
            <span class="step-num">4</span>
            <p><strong>Stay relatively still</strong> once you find a safe spot. Minimize beam movement!</p>
          </div>
        </template>

        <template v-if="beam === 'yellow'">
          <div class="controls-hint">Use <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrow keys to move around the arena.</div>
          <div class="controls-hint">Click on the fogs to attack them.</div>
          <div class="instruction-step">
            <span class="step-num">1</span>
            <p>The <span class="highlight-yellow">yellow cone</span> moves on its own, rotating around the arena.</p>
          </div>
          <div class="instruction-step">
            <span class="step-num">2</span>
            <p><strong>Follow it!</strong> Keep your character <strong>inside the cone</strong> at all times.</p>
          </div>
          <div class="instruction-step">
            <span class="step-num">3</span>
            <p>The cone will change <strong>speed and direction</strong> periodically. Stay alert!</p>
          </div>
          <div class="instruction-step">
            <span class="step-num">4</span>
            <p><strong>Heroic:</strong> 2 hidden <span class="highlight-yellow">Amber Fogs</span> lurk in the arena. If the cone reveals one, <strong>click/tap it quickly</strong> to kill it before the cone passes — if a revealed fog leaves the cone alive, it triggers <span class="highlight-yellow">Burst of Amber</span> (raid wipe)!</p>
          </div>
        </template>
      </div>

      <button class="btn btn-lg start-btn" :class="`btn-${beam}`" @click="$emit('start')">
        Don't Disappoint Peg
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

.controls-hint {
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
  padding: 6px 12px;
  background: var(--bg-card);
  border-radius: 8px;
}

.controls-hint kbd {
  display: inline-block;
  padding: 2px 6px;
  margin: 0 2px;
  font-size: 0.8rem;
  font-family: inherit;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-weight: 600;
  color: var(--text-primary);
}

.start-btn {
  width: 100%;
  font-size: 1.1rem;
  padding: 14px;
}
</style>
