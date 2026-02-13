import type { Point, PolarPosition } from './types'

const TWO_PI = Math.PI * 2

export function polarToCartesian(
  center: Point,
  polar: PolarPosition,
  arenaRadius: number,
): Point {
  return {
    x: center.x + Math.cos(polar.angle) * polar.distance * arenaRadius,
    y: center.y + Math.sin(polar.angle) * polar.distance * arenaRadius,
  }
}

export function cartesianToPolar(
  point: Point,
  center: Point,
  arenaRadius: number,
): PolarPosition {
  const dx = point.x - center.x
  const dy = point.y - center.y
  return {
    angle: Math.atan2(dy, dx),
    distance: Math.min(Math.sqrt(dx * dx + dy * dy) / arenaRadius, 1),
  }
}

export function normalizeAngle(angle: number): number {
  return ((angle % TWO_PI) + TWO_PI) % TWO_PI
}

export function angleDiff(a: number, b: number): number {
  const d = normalizeAngle(a - b + Math.PI) - Math.PI
  return d
}

export function isPositionInCone(
  pos: PolarPosition,
  coneAngle: number,
  coneHalfWidth: number,
  coneRadius: number,
): boolean {
  if (pos.distance > coneRadius) return false
  const diff = angleDiff(pos.angle, coneAngle)
  return Math.abs(diff) <= coneHalfWidth
}

export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function generateSpreadPositions(count: number, minDist: number, maxDist: number): PolarPosition[] {
  const positions: PolarPosition[] = []
  const minAngleSeparation = TWO_PI / (count * 2)

  for (let i = 0; i < count; i++) {
    let attempts = 0
    let pos: PolarPosition

    do {
      pos = {
        angle: Math.random() * TWO_PI,
        distance: randomBetween(minDist, maxDist),
      }
      attempts++
    } while (
      attempts < 50
      && positions.some(p => Math.abs(angleDiff(p.angle, pos.angle)) < minAngleSeparation)
    )

    positions.push(pos)
  }

  return positions
}
