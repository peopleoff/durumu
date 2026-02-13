<template>
  <div class="landing">
    <AppHeader />

    <main class="landing-content">
      <div class="hero">
        <div class="hero-eye">👁</div>
        <h1 class="hero-title">Durumu the Forgotten</h1>
        <p class="hero-subtitle">Light Spectrum Phase Trainer</p>
        <p class="hero-desc">
          Practice the Colorblind Phase mechanics from Throne of Thunder.
          Get assigned a beam color and master the mechanics.
        </p>
      </div>

      <div class="beam-grid">
        <BeamCard beam="red" @select="selectAndPlay('red')" />
        <BeamCard beam="blue" @select="selectAndPlay('blue')" />
        <BeamCard beam="yellow" @select="selectAndPlay('yellow')" />
      </div>

      <div class="random-section">
        <button class="btn btn-primary btn-lg random-btn" @click="randomAndPlay">
          Random Assignment
        </button>
        <p class="random-hint">Just like the real fight!</p>
      </div>
    </main>

    <footer class="landing-footer">
      <p>Throne of Thunder &middot; Mists of Pandaria</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { BeamType } from '~/utils/types'

const gameState = useGameState()
const router = useRouter()

function selectAndPlay(beam: BeamType) {
  gameState.selectBeam(beam)
  gameState.startInstructions()
  router.push('/play')
}

function randomAndPlay() {
  gameState.assignRandomBeam()
  gameState.startInstructions()
  router.push('/play')
}
</script>

<style scoped>
.landing {
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.landing-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px 40px;
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
}

.hero {
  text-align: center;
  margin-bottom: 36px;
}

.hero-eye {
  font-size: 4rem;
  margin-bottom: 12px;
  filter: drop-shadow(0 0 20px rgba(136, 68, 204, 0.5));
}

.hero-title {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #aa66ee, #6622cc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}

.hero-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: 16px;
}

.hero-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
}

.beam-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
  margin-bottom: 32px;
}

@media (max-width: 500px) {
  .beam-grid {
    grid-template-columns: 1fr;
    max-width: 300px;
  }
}

.random-section {
  text-align: center;
}

.random-btn {
  min-width: 240px;
}

.random-hint {
  margin-top: 8px;
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
}

.landing-footer {
  text-align: center;
  padding: 20px;
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
