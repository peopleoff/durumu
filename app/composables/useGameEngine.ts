export function useGameEngine() {
  const isRunning = ref(false)
  const elapsedTime = ref(0)

  let animationFrameId: number | null = null
  let lastTimestamp = 0
  let updateFn: ((dt: number) => void) | null = null
  let renderFn: (() => void) | null = null

  function start(onUpdate: (dt: number) => void, onRender: () => void) {
    updateFn = onUpdate
    renderFn = onRender
    isRunning.value = true
    elapsedTime.value = 0
    lastTimestamp = performance.now()
    animationFrameId = requestAnimationFrame(loop)
  }

  function loop(timestamp: number) {
    if (!isRunning.value) return

    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1)
    lastTimestamp = timestamp
    elapsedTime.value += dt

    updateFn?.(dt)
    renderFn?.()

    animationFrameId = requestAnimationFrame(loop)
  }

  function stop() {
    isRunning.value = false
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  function reset() {
    stop()
    elapsedTime.value = 0
  }

  onUnmounted(() => stop())

  return { isRunning, elapsedTime, start, stop, reset }
}
