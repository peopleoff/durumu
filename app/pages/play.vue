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
        @start="startGame"
        @back="goToMenu"
      />

      <!-- Game area -->
      <div v-show="phase === 'playing'" class="game-area">
        <GameCanvas
          ref="gameCanvasRef"
          :key="gameKey"
          :beam="assignedBeam"
          @complete="onCanvasEvent"
        />
        <GameHUD
          v-if="canvasHudData"
          :beam="assignedBeam"
          :elapsed="canvasElapsed"
          :warmup-remaining="canvasWarmupRemaining"
          :fogs-killed="canvasHudData.fogsKilled"
          :crimson-blooms="canvasHudData.crimsonBlooms"
          :azure-reveals="canvasHudData.azureReveals"
          :amber-bursts="canvasHudData.amberBursts"
          :amber-fogs-killed="canvasHudData.amberFogsKilled"
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
interface HudData {
  fogsKilled: number
  crimsonBlooms: number
  azureReveals: number
  amberBursts: number
  amberFogsKilled?: number
  playerInCone: boolean
  timeInCone: number
  timeOutOfCone: number
}

const gameCanvasRef = ref<{ elapsed: number; hudData: HudData; warmupRemaining: number } | null>(null)

const canvasElapsed = computed(() => gameCanvasRef.value?.elapsed ?? 0)
const canvasHudData = computed(() => gameCanvasRef.value?.hudData ?? null)
const canvasWarmupRemaining = computed(() => gameCanvasRef.value?.warmupRemaining ?? 0)

// Redirect if no beam selected
onMounted(() => {
  if (!assignedBeam.value) {
    router.push('/')
  }
})

function startGame() {
  gameState.startPlaying()
}

function onCanvasEvent(data: Record<string, unknown>) {
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
  padding: 48px 16px;
  background: url('~/assets/images/background.png') center / cover no-repeat;
}

.game-area {
  position: relative;
  width: 100%;
  max-width: 900px;
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
