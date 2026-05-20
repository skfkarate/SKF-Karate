import { timingSafeEqual } from 'node:crypto'

export function timingSafeStringEqual(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)

  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
}
