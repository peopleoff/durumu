<template>
  <div ref="wrapperRef" class="game-canvas-wrapper">
    <canvas
      ref="canvasRef"
      @touchmove.prevent="input.onTouchMove"
      @touchstart.prevent="input.onTouchStart"
      @click="input.onClick"
    />
  </div>
</template>

<script setup lang="ts">
import type { BeamType, ArenaDimensions } from '~/utils/types'
import { GAME_CONFIGS, WARMUP } from '~/utils/constants'
import { cartesianToPolar } from '~/utils/geometry'
import backgroundImg from '~/assets/images/background.png'
import bossImg from '~/assets/images/boss.png'
import redLightImg from '~/assets/images/red-light.png'
import blueLightImg from '~/assets/images/blue-light.png'
import yellowLightImg from '~/assets/images/yellow-light.png'
import skullImg from '~/assets/images/skull.png'

const props = defineProps<{
  beam: BeamType
}>()

const emit = defineEmits<{
  complete: [scoreData: Record<string, unknown>]
}>()

const wrapperRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const gameState = useGameState()
const renderer = useCanvasRenderer(canvasRef)
const input = useInputHandler(canvasRef)
const engine = useGameEngine()

const redBeam = useRedBeam()
const blueBeam = useBlueBeam()
const yellowBeam = useYellowBeam()

const warmupRemaining = ref(WARMUP.DURATION)
let warmupTimer = 0
let inWarmup = true

const config = computed(() => GAME_CONFIGS[props.beam])

function initializeBeam() {
  switch (props.beam) {
    case 'red': redBeam.initialize(); break
    case 'blue': blueBeam.initialize(); break
    case 'yellow': {
      // Beam spawns at player's position — compute angle after initPosition
      const dims = renderer.getArenaDimensions()
      const pos = input.playerPosition.value
      const playerAngle = Math.atan2(pos.y - dims.center.y, pos.x - dims.center.x)
      yellowBeam.initialize(playerAngle)
      break
    }
  }
}

function update(dt: number) {
  const dims = renderer.getArenaDimensions()

  // Move player based on held keys
  input.update(dt, dims)

  const playerPos = input.playerPosition.value
  const playerPolar = cartesianToPolar(playerPos, dims.center, dims.radius)
  const coneAngle = Math.atan2(playerPos.y - dims.center.y, playerPos.x - dims.center.x)

  // Warmup phase: player can move but beam logic doesn't run
  if (inWarmup) {
    warmupTimer += dt
    warmupRemaining.value = Math.max(0, WARMUP.DURATION - warmupTimer)

    if (warmupTimer >= WARMUP.DURATION) {
      inWarmup = false
      warmupRemaining.value = 0
      engine.elapsedTime.value = 0
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
      redBeam.handleClicks(input.consumeClicks(), dims)
      if (redBeam.allFogsKilled.value) {
        finishGame()
      }
      break
    case 'blue':
      blueBeam.update(dt, coneAngle, engine.elapsedTime.value)
      break
    case 'yellow':
      yellowBeam.update(dt, playerPolar, engine.elapsedTime.value)
      yellowBeam.handleClicks(input.consumeClicks(), dims)
      if (yellowBeam.raidWipe.value) {
        finishGame()
      }
      break
  }
}

function getCurrentConeAngle(): number {
  switch (props.beam) {
    case 'red': return redBeam.cone.value.angle
    case 'blue': return blueBeam.cone.value.angle
    case 'yellow': return yellowBeam.cone.value.angle
  }
}

function render() {
  const dims = renderer.getArenaDimensions()
  const playerPos = input.playerPosition.value
  const elapsed = engine.elapsedTime.value

  renderer.clear()
  renderer.drawArena(dims)

  // Warmup phase: draw arena, eye, player cursor, skulls, and warmup timer
  if (inWarmup) {
    renderer.drawEye(dims.center, playerPos, elapsed)
    renderer.drawPlayerCursor(playerPos, props.beam)

    // Warmup countdown text on canvas
    renderer.drawWarmupTimer(dims.center, warmupRemaining.value)

    // Show skull markers in last SKULL_APPEAR_TIME seconds
    if (warmupTimer >= WARMUP.DURATION - WARMUP.SKULL_APPEAR_TIME) {
      const fogs = props.beam === 'red'
        ? redBeam.fogs.value
        : props.beam === 'blue'
          ? blueBeam.fogs.value
          : yellowBeam.fogs.value

      for (const fog of fogs) {
        renderer.drawSkullMarker(dims, fog.position, warmupTimer)
      }
    }
    return
  }

  const coneAngle = getCurrentConeAngle()

  // Draw beam-specific content
  switch (props.beam) {
    case 'red':
      renderer.drawBeamCone(dims, redBeam.cone.value)
      for (const fog of redBeam.fogs.value) {
        renderer.drawFog(dims, fog, 'red', elapsed)
      }
      renderer.drawPlayerCursor(playerPos, 'red')
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
      renderer.drawPlayerCursor(playerPos, 'blue')
      renderer.drawDamageVignette(blueBeam.damageFlash.value)
      break

    case 'yellow':
      renderer.drawBeamCone(dims, yellowBeam.cone.value)
      for (const fog of yellowBeam.fogs.value) {
        renderer.drawAmberFog(dims, fog, elapsed, yellowBeam.cone.value)
      }
      renderer.drawYellowPlayerIndicator(dims, playerPos, yellowBeam.playerInCone.value)
      if (yellowBeam.raidWipe.value) {
        renderer.drawAmberWipeFlash(elapsed)
      }
      renderer.drawDamageVignette(yellowBeam.damageFlash.value)
      break
  }

  renderer.drawEye(dims.center, playerPos, elapsed, coneAngle, props.beam)
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
        amberBursts: 0,
        playerInCone: false,
        timeInCone: 0,
        timeOutOfCone: 0,
      }
    case 'blue':
      return {
        fogsKilled: 0,
        crimsonBlooms: 0,
        azureReveals: blueBeam.azureReveals.value,
        amberBursts: 0,
        playerInCone: false,
        timeInCone: 0,
        timeOutOfCone: 0,
      }
    case 'yellow':
      return {
        fogsKilled: yellowBeam.amberFogsKilled.value,
        crimsonBlooms: 0,
        azureReveals: 0,
        amberBursts: yellowBeam.amberBursts.value,
        amberFogsKilled: yellowBeam.amberFogsKilled.value,
        playerInCone: yellowBeam.playerInCone.value,
        timeInCone: yellowBeam.timeInCone.value,
        timeOutOfCone: yellowBeam.timeOutOfCone.value,
      }
  }
})

defineExpose({
  elapsed: engine.elapsedTime,
  hudData,
  warmupRemaining,
})

function setupCanvas() {
  if (!wrapperRef.value || !canvasRef.value) return
  renderer.resizeCanvas(wrapperRef.value)
  renderer.init()
}

onMounted(() => {
  setupCanvas()
  renderer.loadImages({ backgroundImg, bossImg, redLightImg, blueLightImg, yellowLightImg, skullImg })
  if (gameState.selectedAvatar.value) {
    renderer.loadPlayerAvatar(gameState.selectedAvatar.value)
  }
  initializeBeam()
  input.attach()
  input.initPosition(renderer.getArenaDimensions())

  const resizeObserver = new ResizeObserver(() => {
    setupCanvas()
  })

  if (wrapperRef.value) {
    resizeObserver.observe(wrapperRef.value)
  }

  // Start game loop
  warmupTimer = 0
  inWarmup = true
  warmupRemaining.value = WARMUP.DURATION
  engine.start(update, render)

  onUnmounted(() => {
    resizeObserver.disconnect()
    engine.stop()
    input.detach()
  })
})
</script>

<style scoped>
.game-canvas-wrapper {
  width: 100%;
  max-width: 900px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

canvas {
  display: block;
  cursor: default;
}
</style>
