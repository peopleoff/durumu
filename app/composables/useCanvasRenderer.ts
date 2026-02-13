import type { Point, PolarPosition, BeamCone, FogAdd, ArenaDimensions, BeamType } from '~/utils/types'
import { ARENA, BEAM_COLORS } from '~/utils/constants'
import { polarToCartesian } from '~/utils/geometry'

export function useCanvasRenderer(canvasRef: Ref<HTMLCanvasElement | null>) {
  let ctx: CanvasRenderingContext2D | null = null
  let cssSize = 0

  function init() {
    ctx = canvasRef.value?.getContext('2d') ?? null
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

    // Background
    ctx.fillStyle = ARENA.BACKGROUND
    ctx.fillRect(0, 0, dims.canvasSize, dims.canvasSize)

    // Platform circle
    const grad = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius)
    grad.addColorStop(0, '#181830')
    grad.addColorStop(0.85, ARENA.PLATFORM_COLOR)
    grad.addColorStop(1, ARENA.PLATFORM_EDGE)
    ctx.beginPath()
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()

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

  function drawEye(center: Point, mousePos: Point, elapsed: number) {
    if (!ctx) return
    const r = ARENA.EYE_RADIUS
    const pulse = 1 + Math.sin(elapsed * 2) * 0.05

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

    // Pupil (slit) - tracks mouse slightly
    const dx = mousePos.x - center.x
    const dy = mousePos.y - center.y
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
  }

  function drawBeamCone(dims: ArenaDimensions, cone: BeamCone) {
    if (!ctx) return
    const { center, radius } = dims
    const colors = BEAM_COLORS[cone.type]
    const halfWidth = cone.width / 2
    const coneRadius = radius * cone.radius

    // Cone fill
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

    // Cone edge lines
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

    // Health bar (for crimson fogs)
    if (fog.type === 'crimson' && fog.health < fog.maxHealth) {
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

    // Crosshair
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
    const colors = BEAM_COLORS.yellow

    // Player dot (larger for yellow mode since player position matters more)
    const size = 10
    ctx.save()
    ctx.shadowColor = isInCone ? '#44ff44' : '#ff4444'
    ctx.shadowBlur = 12

    ctx.beginPath()
    ctx.arc(playerPos.x, playerPos.y, size, 0, Math.PI * 2)
    ctx.fillStyle = isInCone ? '#44ff44' : '#ff4444'
    ctx.globalAlpha = 0.8
    ctx.fill()
    ctx.restore()

    // Ring
    ctx.beginPath()
    ctx.arc(playerPos.x, playerPos.y, size + 3, 0, Math.PI * 2)
    ctx.strokeStyle = isInCone ? 'rgba(68, 255, 68, 0.5)' : 'rgba(255, 68, 68, 0.5)'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  return {
    init,
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
  }
}
