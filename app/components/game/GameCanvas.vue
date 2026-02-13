<template>
  <div ref="wrapperRef" class="game-canvas-wrapper">
    <canvas
      ref="canvasRef"
      @mousemove="input.onMouseMove"
      @touchmove.prevent="input.onTouchMove"
      @touchstart.prevent="input.onTouchStart"
    />
  </div>
</template>

<script setup lang="ts">
import type { BeamType, ArenaDimensions } from '~/utils/types'
import { GAME_CONFIGS } from '~/utils/constants'
import { cartesianToPolar } from '~/utils/geometry'

const props = defineProps<{
  beam: BeamType
  phase: 'countdown' | 'playing'
}>()

const emit = defineEmits<{
  complete: [scoreData: Record<string, unknown>]
}>()

const wrapperRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const renderer = useCanvasRenderer(canvasRef)
const input = useInputHandler(canvasRef)
const engine = useGameEngine()

const redBeam = useRedBeam()
const blueBeam = useBlueBeam()
const yellowBeam = useYellowBeam()

const countdownValue = ref(3)
let countdownTimer = 0
let gameStarted = false

const config = computed(() => GAME_CONFIGS[props.beam])

function initializeBeam() {
  switch (props.beam) {
    case 'red': redBeam.initialize(); break
    case 'blue': blueBeam.initialize(); break
    case 'yellow': yellowBeam.initialize(); break
  }
}

function update(dt: number) {
  const dims = renderer.getArenaDimensions()
  const mousePos = input.mousePosition.value
  const playerPolar = cartesianToPolar(mousePos, dims.center, dims.radius)
  const coneAngle = Math.atan2(mousePos.y - dims.center.y, mousePos.x - dims.center.x)

  if (props.phase === 'countdown') {
    countdownTimer += dt
    countdownValue.value = Math.max(0, 3 - Math.floor(countdownTimer))
    if (countdownTimer >= 3.5) {
      gameStarted = true
      emit('complete', { action: 'countdown-done' })
    }
    return
  }

  // Check time limit
  if (engine.elapsedTime.value >= config.value.phaseDuration) {
    finishGame()
    return
  }

  switch (props.beam) {
    case 'red':
      redBeam.update(dt, coneAngle, engine.elapsedTime.value)
      if (redBeam.allFogsKilled.value) {
        finishGame()
      }
      break
    case 'blue':
      blueBeam.update(dt, coneAngle, engine.elapsedTime.value)
      break
    case 'yellow':
      yellowBeam.update(dt, playerPolar)
      break
  }
}

function render() {
  const dims = renderer.getArenaDimensions()
  const mousePos = input.mousePosition.value
  const elapsed = engine.elapsedTime.value

  renderer.clear()
  renderer.drawArena(dims)

  if (props.phase === 'countdown') {
    renderer.drawEye(dims.center, mousePos, elapsed)
    renderer.drawCountdown(dims.center, countdownValue.value)
    return
  }

  // Draw beam-specific content
  switch (props.beam) {
    case 'red':
      renderer.drawBeamCone(dims, redBeam.cone.value)
      for (const fog of redBeam.fogs.value) {
        renderer.drawFog(dims, fog, 'red', elapsed)
      }
      renderer.drawPlayerCursor(mousePos, 'red')
      renderer.drawDamageVignette(redBeam.damageFlash.value)
      break

    case 'blue':
      renderer.drawBeamCone(dims, blueBeam.cone.value)
      // Draw hints when active
      if (blueBeam.showingHints.value) {
        for (const fog of blueBeam.fogs.value) {
          if (!fog.revealed) {
            renderer.drawFogHint(dims, fog.position, elapsed)
          }
        }
      }
      for (const fog of blueBeam.fogs.value) {
        renderer.drawFog(dims, fog, 'blue', elapsed)
      }
      renderer.drawPlayerCursor(mousePos, 'blue')
      renderer.drawDamageVignette(blueBeam.damageFlash.value)
      break

    case 'yellow':
      renderer.drawBeamCone(dims, yellowBeam.cone.value)
      renderer.drawYellowPlayerIndicator(dims, mousePos, yellowBeam.playerInCone.value)
      renderer.drawDamageVignette(yellowBeam.damageFlash.value)
      break
  }

  renderer.drawEye(dims.center, mousePos, elapsed)
}

function finishGame() {
  engine.stop()
  const elapsed = engine.elapsedTime.value

  let scoreData: Record<string, unknown>
  switch (props.beam) {
    case 'red':
      scoreData = redBeam.getScoreData(elapsed)
      break
    case 'blue':
      scoreData = blueBeam.getScoreData(elapsed)
      break
    case 'yellow':
      scoreData = yellowBeam.getScoreData(elapsed)
      break
  }

  emit('complete', { action: 'game-done', ...scoreData })
}

// Expose reactive data for HUD
const hudData = computed(() => {
  switch (props.beam) {
    case 'red':
      return {
        fogsKilled: redBeam.fogs.value.filter(f => f.killed).length,
        crimsonBlooms: redBeam.crimsonBlooms.value,
        azureReveals: 0,
        playerInCone: false,
        timeInCone: 0,
        timeOutOfCone: 0,
      }
    case 'blue':
      return {
        fogsKilled: 0,
        crimsonBlooms: 0,
        azureReveals: blueBeam.azureReveals.value,
        playerInCone: false,
        timeInCone: 0,
        timeOutOfCone: 0,
      }
    case 'yellow':
      return {
        fogsKilled: 0,
        crimsonBlooms: 0,
        azureReveals: 0,
        playerInCone: yellowBeam.playerInCone.value,
        timeInCone: yellowBeam.timeInCone.value,
        timeOutOfCone: yellowBeam.timeOutOfCone.value,
      }
  }
})

defineExpose({
  elapsed: engine.elapsedTime,
  hudData,
})

function setupCanvas() {
  if (!wrapperRef.value || !canvasRef.value) return
  renderer.resizeCanvas(wrapperRef.value)
  renderer.init()
}

onMounted(() => {
  setupCanvas()
  renderer.loadImages()
  initializeBeam()

  const resizeObserver = new ResizeObserver(() => {
    setupCanvas()
  })

  if (wrapperRef.value) {
    resizeObserver.observe(wrapperRef.value)
  }

  // Start game loop
  countdownTimer = 0
  countdownValue.value = 3
  gameStarted = false
  engine.start(update, render)

  onUnmounted(() => {
    resizeObserver.disconnect()
    engine.stop()
  })
})
</script>

<style scoped>
.game-canvas-wrapper {
  width: 100%;
  max-width: 700px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

canvas {
  display: block;
  cursor: none;
  border-radius: 8px;
}
</style>
