<template>
  <div class="landing">
    <div class="bg-layer" />
    <div class="bg-glow" />

    <main class="landing-content">
      <div class="hero anim-section" style="--delay: 0s">
        <div class="hero-portrait">
          <img src="~/assets/images/boss.png" alt="Durumu the Forgotten" class="hero-portrait-img" />
        </div>
        <h1 class="hero-title">Durumu the Forgotten</h1>
        <div class="hero-divider" />
        <p class="hero-subtitle">Peg's Mandatory Practice Session</p>
        <p class="hero-desc">
          Peg is tired of us wiping on Colorblind. This practice is not optional.
          Do not disappoint him further.
        </p>
      </div>

      <div class="avatar-section anim-section" style="--delay: 0.1s">
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

      <div class="beam-section anim-section" style="--delay: 0.2s">
        <p class="section-label">Select a Beam</p>
        <div class="beam-grid">
          <BeamCard beam="red" :best-score="getBest('red')" @select="selectAndPlay('red')" />
          <BeamCard beam="blue" :best-score="getBest('blue')" @select="selectAndPlay('blue')" />
          <BeamCard beam="yellow" :best-score="getBest('yellow')" @select="selectAndPlay('yellow')" />
        </div>
      </div>

      <div class="random-section anim-section" style="--delay: 0.3s">
        <button class="random-btn" @click="randomAndPlay">
          Random
        </button>
        <p class="random-hint">You don't get to pick in raid either.</p>
      </div>
    </main>

    <footer class="landing-footer anim-section" style="--delay: 0.4s">
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
  display: flex;
  flex-direction: column;
  position: relative;
  isolation: isolate;
  margin-top: 64px;
}

.bg-layer {
  position: fixed;
  inset: 0;
  z-index: -2;
  background: url('~/assets/images/background.png') center / cover no-repeat;
  opacity: 0.25;
  pointer-events: none;
}

.bg-glow {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: radial-gradient(ellipse 60% 40% at 50% 30%, var(--purple-glow), transparent 70%);
  pointer-events: none;
  animation: pulse-glow 6s ease-in-out infinite;
}

.landing-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px 40px;
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
}

/* Entrance animations */
.anim-section {
  animation: fade-in-up 0.6s ease both;
  animation-delay: var(--delay, 0s);
}

/* Hero */
.hero {
  text-align: center;
  margin-bottom: 36px;
}

.hero-portrait {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  margin: 0 auto 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 20px var(--purple-glow), 0 0 6px var(--purple-accent);
  animation: pulse-glow 3s ease-in-out infinite;
}

.hero-portrait-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

.hero-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(
    90deg,
    var(--purple-accent),
    var(--gold-accent),
    var(--purple-accent)
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s linear infinite;
  margin-bottom: 10px;
}

.hero-divider {
  width: 120px;
  height: 2px;
  margin: 0 auto 10px;
  background: linear-gradient(90deg, transparent, var(--purple-accent), var(--gold-accent), var(--purple-accent), transparent);
  border-radius: 1px;
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

/* Avatar section */
.avatar-section {
  text-align: center;
  padding-bottom: 28px;
  margin-bottom: 28px;
  width: 100%;
  border-bottom: 1px solid transparent;
  border-image: linear-gradient(90deg, transparent, var(--border-color), transparent) 1;
}

.section-label,
.avatar-label {
  font-family: var(--font-display);
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 14px;
  font-weight: 400;
}

.avatar-label {
  margin-bottom: 12px;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(5, 64px);
  gap: 10px;
  justify-content: center;
}

.avatar-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.1);
  padding: 0;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  overflow: hidden;
  opacity: 0.33;
}

.avatar-btn:hover {
  border-color: rgba(136, 68, 204, 0.5);
  transform: scale(1.1) rotate(3deg);
  opacity: 0.9;
}

.avatar-btn.selected {
  border-color: #aa66ee;
  box-shadow: 0 0 32px rgba(136, 68, 204, 0.6), 0 0 8px rgba(170, 102, 238, 0.8);
  opacity: 1;
  transform: scale(1.2);
  animation: glow 2s ease-in-out infinite;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

/* Beam section */
.beam-section {
  text-align: center;
  padding-bottom: 28px;
  margin-bottom: 28px;
  width: 100%;
  border-bottom: 1px solid transparent;
  border-image: linear-gradient(90deg, transparent, var(--border-color), transparent) 1;
}

.beam-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  width: 100%;
}

@media (max-width: 500px) {
  .beam-grid {
    grid-template-columns: 1fr;
  }
}

/* Random button */
.random-section {
  text-align: center;
}

.random-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 240px;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #fff;
  border: 1px solid var(--purple-accent);
  cursor: pointer;
  background: linear-gradient(135deg, #6c2bd9, #8b5cf6, #6c2bd9);
  background-size: 200% 200%;
  animation: shimmer 3s ease infinite;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.random-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px var(--purple-glow);
}

.random-btn:active {
  transform: translateY(0);
}

.random-hint {
  margin-top: 8px;
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
  opacity: 0.7;
}

/* Footer */
.landing-footer {
  text-align: center;
  padding: 20px;
  font-family: var(--font-display);
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
</style>
