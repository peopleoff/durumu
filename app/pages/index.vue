<template>
  <div class="landing">
    <AppHeader />

    <main class="landing-content">
      <div class="hero">
        <div class="hero-eye">👁</div>
        <h1 class="hero-title">Durumu the Forgotten</h1>
        <p class="hero-subtitle">Peg's Mandatory Practice Session</p>
        <p class="hero-desc">
          Peg is tired of us wiping on Colorblind. This practice is not optional.
          Do not disappoint him further.
        </p>
      </div>

      <div class="avatar-section">
        <p class="avatar-label">Choose Your Raider</p>
        <div class="avatar-grid">
          <button
            v-for="avatar in AVATARS"
            :key="avatar.id"
            class="avatar-btn"
            :class="{ selected: gameState.selectedAvatar.value === avatar.src }"
            @click="gameState.selectAvatar(avatar.src)"
          >
            <img :src="avatar.src" :alt="avatar.id" class="avatar-img" />
          </button>
        </div>
      </div>

      <div class="beam-section">
        <p class="section-label">Select a Beam</p>
        <div class="beam-grid">
          <BeamCard beam="red" :best-score="getBest('red')" @select="selectAndPlay('red')" />
          <BeamCard beam="blue" :best-score="getBest('blue')" @select="selectAndPlay('blue')" />
          <BeamCard beam="yellow" :best-score="getBest('yellow')" @select="selectAndPlay('yellow')" />
        </div>
      </div>

      <div class="random-section">
        <button class="btn btn-primary btn-lg random-btn" @click="randomAndPlay">
          Random
        </button>
        <p class="random-hint">You don't get to pick in raid either.</p>
      </div>
    </main>

    <footer class="landing-footer">
      <p>Throne of Thunder &middot; Mists of Pandaria</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { BeamType } from '~/utils/types'
import { AVATARS } from '~/utils/constants'

const gameState = useGameState()
const router = useRouter()
const { getBest } = useLocalScores()

// Auto-select a random avatar if none is selected
onMounted(() => {
  if (!gameState.selectedAvatar.value) {
    const idx = Math.floor(Math.random() * AVATARS.length)
    gameState.selectAvatar(AVATARS[idx]!.src)
  }
})

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

.avatar-section {
  text-align: center;
  padding-bottom: 28px;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--border-color);
  width: 100%;
}

.section-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 14px;
  font-weight: 600;
}

.avatar-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
  font-weight: 600;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(5, 56px);
  gap: 10px;
  justify-content: center;
}

.avatar-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.1);
  padding: 0;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  overflow: hidden;
  opacity: 0.65;
}

.avatar-btn:hover {
  border-color: rgba(136, 68, 204, 0.5);
  transform: scale(1.1);
  opacity: 0.9;
}

.avatar-btn.selected {
  border-color: #aa66ee;
  box-shadow: 0 0 16px rgba(136, 68, 204, 0.6), 0 0 4px rgba(170, 102, 238, 0.8);
  opacity: 1;
  transform: scale(1.1);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

.beam-section {
  text-align: center;
  padding-bottom: 28px;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--border-color);
  width: 100%;
}

.beam-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
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
