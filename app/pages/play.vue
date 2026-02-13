<template>
  <div class="play-page">
    <template v-if="!assignedBeam">
      <div class="no-beam">
        <p>No beam assigned.</p>
        <NuxtLink to="/" class="btn btn-primary">Back to Menu</NuxtLink>
      </div>
    </template>

    <template v-else>
      <!-- Instructions overlay -->
      <InstructionModal
        v-if="phase === 'instructions'"
        :beam="assignedBeam"
        @start="startCountdown"
      />

      <!-- Game area -->
      <div v-show="phase === 'countdown' || phase === 'playing'" class="game-area">
        <GameCanvas
          ref="gameCanvasRef"
          :key="gameKey"
          :beam="assignedBeam"
          :phase="gameCanvasPhase"
          @complete="onCanvasEvent"
        />
        <GameHUD
          v-if="phase === 'playing' && canvasHudData"
          :beam="assignedBeam"
          :elapsed="canvasElapsed"
          :fogs-killed="canvasHudData.fogsKilled"
          :crimson-blooms="canvasHudData.crimsonBlooms"
          :azure-reveals="canvasHudData.azureReveals"
          :player-in-cone="canvasHudData.playerInCone"
          :time-in-cone="canvasHudData.timeInCone"
          :time-out-of-cone="canvasHudData.timeOutOfCone"
        />
      </div>

      <!-- Results overlay -->
      <ResultsScreen
        v-if="phase === 'results' && score"
        :score="score"
        @retry="retry"
        @menu="goToMenu"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
const gameState = useGameState()
const scoring = useScoring()
const router = useRouter()

const { phase, assignedBeam, score } = gameState

const gameKey = ref(0)
const gameCanvasRef = ref<{ elapsed: Ref<number>; hudData: ComputedRef<Record<string, unknown>> } | null>(null)

const canvasElapsed = computed(() => gameCanvasRef.value?.elapsed?.value ?? 0)
const canvasHudData = computed(() => gameCanvasRef.value?.hudData?.value ?? null)

const gameCanvasPhase = computed(() => {
  if (phase.value === 'countdown') return 'countdown' as const
  return 'playing' as const
})

// Redirect if no beam selected
onMounted(() => {
  if (!assignedBeam.value) {
    router.push('/')
  }
})

function startCountdown() {
  gameState.startCountdown()
}

function onCanvasEvent(data: Record<string, unknown>) {
  if (data.action === 'countdown-done') {
    gameState.startPlaying()
    return
  }

  if (data.action === 'game-done') {
    const gameScore = scoring.calculateScore(data as Parameters<typeof scoring.calculateScore>[0])
    gameState.showResults(gameScore)
  }
}

function retry() {
  gameState.startInstructions()
  gameKey.value++
}

function goToMenu() {
  gameState.returnToMenu()
  router.push('/')
}
</script>

<style scoped>
.play-page {
  width: 100%;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.game-area {
  position: relative;
  width: 100%;
  max-width: 700px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-beam {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  color: var(--text-secondary);
}
</style>
