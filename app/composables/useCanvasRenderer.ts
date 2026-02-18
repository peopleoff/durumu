import type { Point, PolarPosition, BeamCone, FogAdd, ArenaDimensions, BeamType } from '~/utils/types'
import { ARENA, BEAM_COLORS, SCORING } from '~/utils/constants'
import { polarToCartesian, isPositionInCone } from '~/utils/geometry'

export interface ImageUrls {
  backgroundImg: string
  bossImg: string
  redLightImg: string
  blueLightImg: string
  yellowLightImg: string
  skullImg: string
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

export function useCanvasRenderer(canvasRef: Ref<HTMLCanvasElement | null>) {
  let ctx: CanvasRenderingContext2D | null = null
  let cssSize = 0
  let platformImg: HTMLImageElement | null = null
  let bossImg: HTMLImageElement | null = null
  let skullImg: HTMLImageElement | null = null
  let beamImages: Record<BeamType, HTMLImageElement | null> = {
    red: null,
    blue: null,
    yellow: null,
  }
  let playerAvatarImg: HTMLImageElement | null = null

  function init() {
    ctx = canvasRef.value?.getContext('2d') ?? null
  }

  async function loadImages(urls: ImageUrls) {
    const results = await Promise.allSettled([
      loadImage(urls.backgroundImg),
      loadImage(urls.bossImg),
      loadImage(urls.redLightImg),
      loadImage(urls.blueLightImg),
      loadImage(urls.yellowLightImg),
      loadImage(urls.skullImg),
    ])

    if (results[0].status === 'fulfilled') platformImg = results[0].value
    if (results[1].status === 'fulfilled') bossImg = results[1].value
    if (results[2].status === 'fulfilled') beamImages.red = results[2].value
    if (results[3].status === 'fulfilled') beamImages.blue = results[3].value
    if (results[4].status === 'fulfilled') beamImages.yellow = results[4].value
    if (results[5].status === 'fulfilled') skullImg = results[5].value
  }

  async function loadPlayerAvatar(src: string) {
    try {
      playerAvatarImg = await loadImage(src)
    }
    catch {
      playerAvatarImg = null
    }
  }

  function getArenaDimensions(): ArenaDimensions {
    const s = cssSize || 400
    const radius = (s - ARENA.PADDING * 2) / 2
    const center: Point = { x: s / 2, y: s / 2 }
    return { center, radius, canvasSize: s }
  }

  function resizeCanvas(container: HTMLElement) {
    const canvas = canvasRef.value
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const size = Math.min(container.clientWidth, container.clientHeight, 700)
    cssSize = size

    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`

    ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }
  }

  function clear() {
    if (!ctx) return
    const s = cssSize || 400
    ctx.clearRect(0, 0, s, s)
  }

  function drawArena(dims: ArenaDimensions) {
    if (!ctx) return
    const { center, radius } = dims

    if (!platformImg) {
      // Fallback when no background image: solid fill + programmatic circle
      ctx.fillStyle = ARENA.BACKGROUND
      ctx.fillRect(0, 0, dims.canvasSize, dims.canvasSize)

      const grad = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius)
      grad.addColorStop(0, '#181830')
      grad.addColorStop(0.85, ARENA.PLATFORM_COLOR)
      grad.addColorStop(1, ARENA.PLATFORM_EDGE)
      ctx.beginPath()
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
    }

    // Edge ring
    ctx.beginPath()
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
    ctx.strokeStyle = '#2a2a50'
    ctx.lineWidth = 2
    ctx.stroke()

    // Concentric range guides
    for (const frac of [0.25, 0.5, 0.75]) {
      ctx.beginPath()
      ctx.arc(center.x, center.y, radius * frac, 0, Math.PI * 2)
      ctx.strokeStyle = ARENA.RING_COLOR
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }

  function drawEye(center: Point, playerPos: Point, elapsed: number, facingAngle?: number, beamType?: BeamType) {
    if (!ctx) return
    const pulse = 1 + Math.sin(elapsed * 2) * 0.05

    if (bossImg) {
      // Draw boss portrait at center
      const bossSize = ARENA.EYE_RADIUS * 3.5
      const halfSize = bossSize / 2

      // Purple glow behind boss
      ctx.save()
      ctx.shadowColor = '#6622aa'
      ctx.shadowBlur = 25 * pulse
      ctx.beginPath()
      ctx.arc(center.x, center.y, halfSize, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(26, 10, 42, 0.8)'
      ctx.fill()
      ctx.restore()

      // Clip to circle and draw boss image
      ctx.save()
      ctx.beginPath()
      ctx.arc(center.x, center.y, halfSize, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(
        bossImg,
        center.x - halfSize,
        center.y - halfSize,
        bossSize,
        bossSize,
      )
      ctx.restore()

      // Circular border ring
      ctx.beginPath()
      ctx.arc(center.x, center.y, halfSize, 0, Math.PI * 2)
      ctx.strokeStyle = '#4a2a6a'
      ctx.lineWidth = 2
      ctx.stroke()

      // Boss facing indicator
      if (facingAngle !== undefined && beamType) {
        drawFacingIndicator(center, halfSize, facingAngle, beamType, pulse)
      }

      return
    }

    // Fallback: programmatic eye
    const r = ARENA.EYE_RADIUS

    // Outer glow
    ctx.save()
    ctx.shadowColor = '#6622aa'
    ctx.shadowBlur = 20 * pulse
    ctx.beginPath()
    ctx.ellipse(center.x, center.y, r * 1.6, r, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#1a0a2a'
    ctx.fill()
    ctx.restore()

    // Eye shape (almond)
    ctx.beginPath()
    ctx.ellipse(center.x, center.y, r * 1.5, r * 0.9, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#220e3a'
    ctx.fill()
    ctx.strokeStyle = '#4a2a6a'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Iris
    const irisR = r * 0.65
    const irisGrad = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, irisR)
    irisGrad.addColorStop(0, '#8844cc')
    irisGrad.addColorStop(0.6, '#5522aa')
    irisGrad.addColorStop(1, '#330066')
    ctx.beginPath()
    ctx.arc(center.x, center.y, irisR, 0, Math.PI * 2)
    ctx.fillStyle = irisGrad
    ctx.fill()

    // Pupil (slit) - tracks player slightly
    const dx = playerPos.x - center.x
    const dy = playerPos.y - center.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxOffset = r * 0.15
    const offsetX = dist > 0 ? (dx / dist) * maxOffset : 0
    const offsetY = dist > 0 ? (dy / dist) * maxOffset : 0
    const px = center.x + offsetX
    const py = center.y + offsetY

    ctx.beginPath()
    ctx.ellipse(px, py, r * 0.12, r * 0.5, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#000'
    ctx.fill()

    // Pupil glow
    ctx.save()
    ctx.shadowColor = '#aa44ff'
    ctx.shadowBlur = 8 * pulse
    ctx.beginPath()
    ctx.ellipse(px, py, r * 0.08, r * 0.35, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#1a001a'
    ctx.fill()
    ctx.restore()

    // Facing indicator for programmatic eye too
    if (facingAngle !== undefined && beamType) {
      const eyeRadius = r * 1.6
      drawFacingIndicator(center, eyeRadius, facingAngle, beamType, pulse)
    }
  }

  function drawFacingIndicator(center: Point, bossRadius: number, angle: number, beamType: BeamType, pulse: number) {
    if (!ctx) return
    const colors = BEAM_COLORS[beamType]

    // Position the chevron on the outer edge of the boss circle
    const indicatorDist = bossRadius + 8
    const tipX = center.x + Math.cos(angle) * (indicatorDist + 6)
    const tipY = center.y + Math.sin(angle) * (indicatorDist + 6)

    // Chevron arms — two lines angled back from the tip
    const armLength = 8
    const armSpread = 0.5 // radians from center line
    const leftX = tipX - Math.cos(angle - armSpread) * armLength
    const leftY = tipY - Math.sin(angle - armSpread) * armLength
    const rightX = tipX - Math.cos(angle + armSpread) * armLength
    const rightY = tipY - Math.sin(angle + armSpread) * armLength

    ctx.save()
    ctx.shadowColor = colors.solid
    ctx.shadowBlur = 10 * pulse

    // Filled chevron
    ctx.beginPath()
    ctx.moveTo(tipX, tipY)
    ctx.lineTo(leftX, leftY)
    ctx.lineTo(rightX, rightY)
    ctx.closePath()
    ctx.fillStyle = colors.solid
    ctx.globalAlpha = 0.85
    ctx.fill()

    ctx.restore()
  }

  function drawBeamCone(dims: ArenaDimensions, cone: BeamCone) {
    if (!ctx) return
    const { center, radius } = dims
    const colors = BEAM_COLORS[cone.type]
    const halfWidth = cone.width / 2
    const coneRadius = radius * cone.radius
    const beamImg = beamImages[cone.type]

    if (beamImg) {
      // Draw beam texture clipped to cone shape
      ctx.save()

      // Create cone clip path
      ctx.beginPath()
      ctx.moveTo(center.x, center.y)
      ctx.arc(center.x, center.y, coneRadius, cone.angle - halfWidth, cone.angle + halfWidth)
      ctx.closePath()
      ctx.clip()

      // Draw the beam image centered, scaled to cover the cone radius
      const size = coneRadius * 2
      ctx.globalAlpha = 0.6
      ctx.drawImage(
        beamImg,
        center.x - size / 2,
        center.y - size / 2,
        size,
        size,
      )
      ctx.restore()

      // Overlay a subtle gradient for depth
      ctx.save()
      const grad = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, coneRadius)
      grad.addColorStop(0, colors.coneEdge)
      grad.addColorStop(0.5, 'transparent')
      grad.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.moveTo(center.x, center.y)
      ctx.arc(center.x, center.y, coneRadius, cone.angle - halfWidth, cone.angle + halfWidth)
      ctx.closePath()
      ctx.fillStyle = grad
      ctx.fill()
      ctx.restore()
    }
    else {
      // Fallback: gradient fill
      const grad = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, coneRadius)
      grad.addColorStop(0, colors.coneEdge)
      grad.addColorStop(0.3, colors.cone)
      grad.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.moveTo(center.x, center.y)
      ctx.arc(center.x, center.y, coneRadius, cone.angle - halfWidth, cone.angle + halfWidth)
      ctx.closePath()
      ctx.fillStyle = grad
      ctx.fill()
    }

    // Cone edge lines (always drawn)
    ctx.save()
    ctx.shadowColor = colors.solid
    ctx.shadowBlur = 6
    for (const sign of [-1, 1]) {
      const edgeAngle = cone.angle + halfWidth * sign
      ctx.beginPath()
      ctx.moveTo(center.x, center.y)
      ctx.lineTo(
        center.x + Math.cos(edgeAngle) * coneRadius,
        center.y + Math.sin(edgeAngle) * coneRadius,
      )
      ctx.strokeStyle = colors.coneEdge
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
    ctx.restore()
  }

  function drawFog(dims: ArenaDimensions, fog: FogAdd, beamType: BeamType, elapsed: number) {
    if (!ctx) return
    if (fog.killed) return

    const colors = BEAM_COLORS[beamType]
    const pos = polarToCartesian(dims.center, fog.position, dims.radius)
    const fogRadius = 12

    if (!fog.revealed) return

    // Revealed fog: glowing circle
    const pulse = 1 + Math.sin(elapsed * 4) * 0.15
    ctx.save()
    ctx.shadowColor = colors.fogGlow
    ctx.shadowBlur = 15 * pulse

    ctx.beginPath()
    ctx.arc(pos.x, pos.y, fogRadius * pulse, 0, Math.PI * 2)
    ctx.fillStyle = colors.fog
    ctx.fill()
    ctx.restore()

    // Inner dot
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, fogRadius * 0.5, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.globalAlpha = 0.6
    ctx.fill()
    ctx.globalAlpha = 1

    // Health bar (for crimson and amber fogs)
    if ((fog.type === 'crimson' || fog.type === 'amber') && fog.health < fog.maxHealth) {
      drawHealthBar(pos, fog.health, fog.maxHealth, fogRadius)
    }
  }

  function drawFogHint(dims: ArenaDimensions, position: PolarPosition, elapsed: number) {
    if (!ctx) return
    const pos = polarToCartesian(dims.center, position, dims.radius)
    const alpha = Math.max(0, Math.sin(elapsed * 8) * 0.4)

    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(68, 136, 255, ${alpha})`
    ctx.lineWidth = 2
    ctx.stroke()
  }

  function drawHealthBar(pos: Point, health: number, maxHealth: number, fogRadius: number) {
    if (!ctx) return
    const barWidth = 30
    const barHeight = 4
    const x = pos.x - barWidth / 2
    const y = pos.y - fogRadius - 10

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(x, y, barWidth, barHeight)

    // Health
    const pct = health / maxHealth
    ctx.fillStyle = pct > 0.5 ? '#44cc44' : pct > 0.25 ? '#ccaa00' : '#cc2222'
    ctx.fillRect(x, y, barWidth * pct, barHeight)

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 0.5
    ctx.strokeRect(x, y, barWidth, barHeight)
  }

  function drawPlayerCursor(pos: Point, beamType: BeamType) {
    if (!ctx) return
    const colors = BEAM_COLORS[beamType]

    if (playerAvatarImg) {
      const radius = 18
      ctx.save()
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(playerAvatarImg, pos.x - radius, pos.y - radius, radius * 2, radius * 2)
      ctx.restore()

      // Border ring
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
      ctx.strokeStyle = colors.solid
      ctx.lineWidth = 2
      ctx.stroke()
      return
    }

    // Fallback: crosshair
    const size = 8
    ctx.save()
    ctx.strokeStyle = colors.solid
    ctx.lineWidth = 1.5
    ctx.globalAlpha = 0.7

    ctx.beginPath()
    ctx.moveTo(pos.x - size, pos.y)
    ctx.lineTo(pos.x + size, pos.y)
    ctx.moveTo(pos.x, pos.y - size)
    ctx.lineTo(pos.x, pos.y + size)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2)
    ctx.stroke()

    ctx.restore()
  }

  function drawDamageVignette(intensity: number) {
    if (!ctx || intensity <= 0) return
    const w = cssSize
    const h = cssSize

    const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7)
    grad.addColorStop(0, 'transparent')
    grad.addColorStop(1, `rgba(255, 0, 0, ${intensity * 0.4})`)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  }

  function drawCountdown(center: Point, count: number) {
    if (!ctx) return
    const text = count > 0 ? count.toString() : 'GO!'
    ctx.save()
    ctx.font = 'bold 72px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = count > 0 ? '#e0e0e8' : '#44ff44'
    ctx.shadowColor = count > 0 ? '#8844cc' : '#22aa22'
    ctx.shadowBlur = 20
    ctx.fillText(text, center.x, center.y)
    ctx.restore()
  }

  function drawYellowPlayerIndicator(dims: ArenaDimensions, playerPos: Point, isInCone: boolean) {
    if (!ctx) return
    const ringColor = isInCone ? '#44ff44' : '#ff4444'
    const ringGlow = isInCone ? 'rgba(68, 255, 68, 0.5)' : 'rgba(255, 68, 68, 0.5)'

    if (playerAvatarImg) {
      const radius = 18
      ctx.save()
      ctx.shadowColor = ringColor
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.arc(playerPos.x, playerPos.y, radius, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(playerAvatarImg, playerPos.x - radius, playerPos.y - radius, radius * 2, radius * 2)
      ctx.restore()

      // Status ring
      ctx.beginPath()
      ctx.arc(playerPos.x, playerPos.y, radius + 2, 0, Math.PI * 2)
      ctx.strokeStyle = ringColor
      ctx.lineWidth = 2.5
      ctx.stroke()

      // Outer glow ring
      ctx.beginPath()
      ctx.arc(playerPos.x, playerPos.y, radius + 5, 0, Math.PI * 2)
      ctx.strokeStyle = ringGlow
      ctx.lineWidth = 1.5
      ctx.stroke()
      return
    }

    // Fallback: colored dot
    const size = 10
    ctx.save()
    ctx.shadowColor = ringColor
    ctx.shadowBlur = 12

    ctx.beginPath()
    ctx.arc(playerPos.x, playerPos.y, size, 0, Math.PI * 2)
    ctx.fillStyle = ringColor
    ctx.globalAlpha = 0.8
    ctx.fill()
    ctx.restore()

    // Ring
    ctx.beginPath()
    ctx.arc(playerPos.x, playerPos.y, size + 3, 0, Math.PI * 2)
    ctx.strokeStyle = ringGlow
    ctx.lineWidth = 2
    ctx.stroke()
  }

  function drawSkullMarker(dims: ArenaDimensions, position: PolarPosition, elapsed: number) {
    if (!ctx) return
    const pos = polarToCartesian(dims.center, position, dims.radius)
    const pulse = 1 + Math.sin(elapsed * 3) * 0.1
    const size = 28 * pulse

    ctx.save()
    ctx.shadowColor = '#ff4444'
    ctx.shadowBlur = 12 * pulse

    if (skullImg) {
      ctx.drawImage(skullImg, pos.x - size / 2, pos.y - size / 2, size, size)
    }
    else {
      // Fallback: red X marker
      ctx.strokeStyle = '#ff4444'
      ctx.lineWidth = 3
      const half = size / 2
      ctx.beginPath()
      ctx.moveTo(pos.x - half, pos.y - half)
      ctx.lineTo(pos.x + half, pos.y + half)
      ctx.moveTo(pos.x + half, pos.y - half)
      ctx.lineTo(pos.x - half, pos.y + half)
      ctx.stroke()
    }

    ctx.restore()
  }

  function drawWarmupTimer(center: Point, secondsRemaining: number) {
    if (!ctx) return
    const text = `Starting in ${Math.ceil(secondsRemaining)}...`
    ctx.save()
    ctx.font = 'bold 36px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#e0e0e8'
    ctx.shadowColor = '#8844cc'
    ctx.shadowBlur = 15
    ctx.fillText(text, center.x, center.y + 50)
    ctx.restore()
  }

  return {
    init,
    loadImages,
    loadPlayerAvatar,
    resizeCanvas,
    getArenaDimensions,
    clear,
    drawArena,
    drawEye,
    drawBeamCone,
    drawFog,
    drawFogHint,
    drawPlayerCursor,
    drawDamageVignette,
    drawCountdown,
    drawYellowPlayerIndicator,
    drawSkullMarker,
    drawWarmupTimer,
    drawAmberFog,
    drawAmberWipeFlash,
  }

  function drawAmberFog(dims: ArenaDimensions, fog: FogAdd, elapsed: number, cone: BeamCone) {
    if (!ctx) return

    const pos = polarToCartesian(dims.center, fog.position, dims.radius)
    const fogRadius = 12
    const colors = BEAM_COLORS.yellow

    // Killed fog: brief fade-out
    if (fog.killed) {
      const timeSinceReveal = fog.revealedAt !== null ? elapsed - fog.revealedAt : 0
      const alpha = Math.max(0, 1 - timeSinceReveal * 2)
      if (alpha <= 0) return

      ctx.save()
      ctx.globalAlpha = alpha * 0.4
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, fogRadius, 0, Math.PI * 2)
      ctx.fillStyle = '#666'
      ctx.fill()
      ctx.restore()
      return
    }

    if (!fog.revealed) return

    // Check if fog is currently inside the cone
    const fogInCone = isPositionInCone(
      fog.position,
      cone.angle,
      cone.width / 2,
      cone.radius,
    )

    // Revealed fog: pulsing amber glow
    const pulse = 1 + Math.sin(elapsed * 6) * 0.2
    ctx.save()
    ctx.shadowColor = colors.fogGlow
    ctx.shadowBlur = 20 * pulse

    ctx.beginPath()
    ctx.arc(pos.x, pos.y, fogRadius * pulse, 0, Math.PI * 2)
    ctx.fillStyle = colors.fog
    ctx.fill()
    ctx.restore()

    // Inner bright core
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, fogRadius * 0.5, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.globalAlpha = 0.7
    ctx.fill()
    ctx.globalAlpha = 1

    // Kill indicator — crosshair and "CLICK!" text when in cone
    if (fogInCone) {
      const killR = SCORING.FOG_KILL_RADIUS
      ctx.save()
      ctx.strokeStyle = '#ff4444'
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.6 + Math.sin(elapsed * 8) * 0.3

      // Crosshair
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, killR, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(pos.x - killR - 4, pos.y)
      ctx.lineTo(pos.x - killR + 6, pos.y)
      ctx.moveTo(pos.x + killR - 6, pos.y)
      ctx.lineTo(pos.x + killR + 4, pos.y)
      ctx.moveTo(pos.x, pos.y - killR - 4)
      ctx.lineTo(pos.x, pos.y - killR + 6)
      ctx.moveTo(pos.x, pos.y + killR - 6)
      ctx.lineTo(pos.x, pos.y + killR + 4)
      ctx.stroke()

      // "CLICK!" label
      ctx.font = 'bold 10px -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#ff6644'
      ctx.globalAlpha = 0.8 + Math.sin(elapsed * 8) * 0.2
      ctx.fillText('CLICK!', pos.x, pos.y - killR - 8)

      ctx.restore()
    }
  }

  function drawAmberWipeFlash(elapsed: number) {
    if (!ctx) return
    const w = cssSize
    const alpha = Math.min(1, Math.sin(elapsed * 10) * 0.3 + 0.5)
    ctx.save()
    ctx.fillStyle = `rgba(255, 170, 0, ${alpha * 0.35})`
    ctx.fillRect(0, 0, w, w)
    ctx.restore()
  }
}
