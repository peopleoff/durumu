# Durumu Light Spectrum Trainer

A browser-based practice tool for the **Light Spectrum (Colorblind) phase** from the Durumu the Forgotten encounter in World of Warcraft's Throne of Thunder raid (Mists of Pandaria).

**[Play it live →](https://durumu.netlify.app/)**

Practice beam mechanics so your raid leader doesn't have to yell at you again.

## How It Works

Pick your raider avatar, choose a beam (or get one randomly assigned — just like in raid), and practice the mechanic until you can S-grade it.

### Red Beam — Infrared Light

Sweep your beam around the arena to find and kill **3 hidden Crimson Fogs**. Hold the beam on a fog to drain its health. Moving the beam off a revealed fog triggers a **Crimson Bloom** (raid wipe). Kill all 3 as fast as possible.

**S-grade:** 3 kills, 0 blooms, under 30 seconds.

### Blue Beam — Blue Rays

Avoid the single hidden **Azure Fog**. Hint flashes periodically reveal its location — use them to find a safe spot and stay there. Revealing the fog triggers **Icy Grasp**; revealing it too many times causes **Flash Freeze** (raid wipe).

**S-grade:** 0 reveals for the full 50 seconds.

### Yellow Beam — Bright Light

Stay inside an auto-rotating cone that spawns at your position and moves independently. Time outside the cone accumulates damage. Hidden **Amber Fogs** are revealed when the cone sweeps over them — click to kill them before the cone passes or trigger **Burst of Amber** (raid wipe).

**S-grade:** 95%+ uptime inside the cone, 0 fogs revealed.

## Tech Stack

- **[Nuxt 4](https://nuxt.com/)** (Vue 3, TypeScript, Vite)
- **HTML5 Canvas** — all game rendering, no graphics libraries
- **SPA mode** (`ssr: false`) — deploys to any static host

No other runtime dependencies.

## Getting Started

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run generate` | Static site generation (outputs to `.output/public`) |
| `npm run preview` | Preview production build locally |

## Project Structure

```
app/
├── pages/
│   ├── index.vue                 # Home — avatar + beam selection
│   └── play.vue                  # Game — phases: instructions → countdown → play → results
├── components/
│   ├── game/
│   │   ├── GameCanvas.vue        # Core game loop + canvas element
│   │   ├── GameHUD.vue           # Live stats overlay
│   │   ├── InstructionModal.vue  # Per-beam instruction screens
│   │   └── ResultsScreen.vue     # Grade display, stats, retry/menu
│   └── ui/
│       ├── AppHeader.vue         # Navigation bar
│       └── BeamCard.vue          # Beam selection card
├── composables/
│   ├── useGameState.ts           # Global state: phase, beam, score
│   ├── useGameEngine.ts          # requestAnimationFrame loop
│   ├── useInputHandler.ts        # Mouse/touch tracking
│   ├── useCanvasRenderer.ts      # All 2D drawing
│   ├── useRedBeam.ts             # Red beam logic
│   ├── useBlueBeam.ts            # Blue beam logic
│   ├── useYellowBeam.ts          # Yellow beam logic
│   └── useScoring.ts             # Grade calculation (S/A/B/C/F)
├── utils/
│   ├── types.ts                  # TypeScript interfaces
│   ├── constants.ts              # Timing, colors, scoring thresholds
│   └── geometry.ts               # Polar/cartesian math, cone collision
└── assets/css/main.css           # Global styles, CSS variables, dark theme
```

## Architecture

- **State:** `useGameState` is global (`useState`). Phase transitions (`menu → instructions → countdown → playing → results`) drive the entire UI.
- **Game loop:** `useGameEngine` runs a standard `requestAnimationFrame` loop. Each frame calls `update(dt)` on the active beam composable, then `render()` via `useCanvasRenderer`.
- **Beam composables** share a common interface: `initialize()`, `update(dt, mouseAngle)`, `getScore()`, plus reactive state for rendering.
- **Geometry** is polar (angle + normalized distance 0–1 relative to arena radius). Cone collision is in `geometry.ts`.
- **Canvas** is DPR-aware with `ResizeObserver` for responsive sizing.
- **Mobile:** Touch events are handled alongside mouse events.

## Deployment

Generate a static site and deploy the output folder to any static host:

```bash
npm run generate
# Deploy .output/public/ to Vercel, Netlify, GitHub Pages, etc.
```

## License

This project is a fan-made practice tool for educational purposes. World of Warcraft and all related content are trademarks of Blizzard Entertainment.
