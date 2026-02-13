import type { Point } from '~/utils/types'

export function useInputHandler(canvasRef: Ref<HTMLCanvasElement | null>) {
  const mousePosition = ref<Point>({ x: 0, y: 0 })

  function getCanvasPosition(clientX: number, clientY: number): Point {
    const canvas = canvasRef.value
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    // Return CSS pixel position since renderer uses ctx.scale(dpr, dpr)
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  function onMouseMove(e: MouseEvent) {
    mousePosition.value = getCanvasPosition(e.clientX, e.clientY)
  }

  function onTouchMove(e: TouchEvent) {
    e.preventDefault()
    if (e.touches.length > 0) {
      const touch = e.touches[0]
      mousePosition.value = getCanvasPosition(touch.clientX, touch.clientY)
    }
  }

  function onTouchStart(e: TouchEvent) {
    e.preventDefault()
    if (e.touches.length > 0) {
      const touch = e.touches[0]
      mousePosition.value = getCanvasPosition(touch.clientX, touch.clientY)
    }
  }

  return { mousePosition, onMouseMove, onTouchMove, onTouchStart }
}
