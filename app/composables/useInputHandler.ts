import type { Point, ArenaDimensions } from '~/utils/types'
import { PLAYER } from '~/utils/constants'

const KEY_MAP: Record<string, 'up' | 'down' | 'left' | 'right'> = {
  w: 'up',
  W: 'up',
  ArrowUp: 'up',
  s: 'down',
  S: 'down',
  ArrowDown: 'down',
  a: 'left',
  A: 'left',
  ArrowLeft: 'left',
  d: 'right',
  D: 'right',
  ArrowRight: 'right',
}

export function useInputHandler(canvasRef: Ref<HTMLCanvasElement | null>) {
  // Player position in cartesian (CSS pixels relative to canvas)
  const playerPosition = ref<Point>({ x: 0, y: 0 })

  // Click/tap events for fog killing
  const pendingClicks = ref<Point[]>([])

  const heldKeys = new Set<string>()

  function onKeyDown(e: KeyboardEvent) {
    const action = KEY_MAP[e.key]
    if (action) {
      e.preventDefault()
      heldKeys.add(action)
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    const action = KEY_MAP[e.key]
    if (action) {
      heldKeys.delete(action)
    }
  }

  function onBlur() {
    heldKeys.clear()
  }

  /** Called every frame to move the player based on held keys. */
  function update(dt: number, dims: ArenaDimensions) {
    const speed = PLAYER.SPEED

    // Cardinal direction movement in screen space
    let dx = 0
    let dy = 0
    if (heldKeys.has('left')) dx -= 1
    if (heldKeys.has('right')) dx += 1
    if (heldKeys.has('up')) dy -= 1
    if (heldKeys.has('down')) dy += 1

    // Normalize diagonal so it doesn't move faster
    if (dx !== 0 && dy !== 0) {
      const inv = 1 / Math.SQRT2
      dx *= inv
      dy *= inv
    }

    if (dx !== 0 || dy !== 0) {
      let nx = playerPosition.value.x + dx * speed * dt
      let ny = playerPosition.value.y + dy * speed * dt

      // Clamp to arena circle
      const offX = nx - dims.center.x
      const offY = ny - dims.center.y
      const dist = Math.sqrt(offX * offX + offY * offY)
      if (dist > dims.radius) {
        nx = dims.center.x + (offX / dist) * dims.radius
        ny = dims.center.y + (offY / dist) * dims.radius
      }

      // Keep minimum distance from center
      const minR = dims.radius * PLAYER.MIN_DISTANCE
      if (dist < minR && dist > 0) {
        nx = dims.center.x + (offX / dist) * minR
        ny = dims.center.y + (offY / dist) * minR
      }

      playerPosition.value = { x: nx, y: ny }
    }
  }

  /** Set initial position once arena dimensions are known. */
  function initPosition(dims: ArenaDimensions) {
    const r = PLAYER.INITIAL_DISTANCE * dims.radius
    playerPosition.value = {
      x: dims.center.x + Math.cos(PLAYER.INITIAL_ANGLE) * r,
      y: dims.center.y + Math.sin(PLAYER.INITIAL_ANGLE) * r,
    }
  }

  // Touch fallback — direct positioning for mobile
  function getCanvasPosition(clientX: number, clientY: number): Point {
    const canvas = canvasRef.value
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  function onTouchMove(e: TouchEvent) {
    e.preventDefault()
    const touch = e.touches[0]
    if (touch) {
      playerPosition.value = getCanvasPosition(touch.clientX, touch.clientY)
    }
  }

  function onTouchStart(e: TouchEvent) {
    e.preventDefault()
    const touch = e.touches[0]
    if (touch) {
      const pos = getCanvasPosition(touch.clientX, touch.clientY)
      playerPosition.value = pos
      pendingClicks.value.push(pos)
    }
  }

  function onClick(e: MouseEvent) {
    const pos = getCanvasPosition(e.clientX, e.clientY)
    pendingClicks.value.push(pos)
  }

  function consumeClicks(): Point[] {
    const clicks = [...pendingClicks.value]
    pendingClicks.value = []
    return clicks
  }

  function attach() {
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
  }

  function detach() {
    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', onBlur)
    heldKeys.clear()
  }

  return {
    playerPosition,
    update,
    initPosition,
    attach,
    detach,
    onTouchMove,
    onTouchStart,
    onClick,
    consumeClicks,
  }
}
