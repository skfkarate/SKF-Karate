import fs from 'node:fs'
import path from 'node:path'

function getDataRoot() {
  const configuredDir = process.env.SKF_DATA_DIR?.trim()
  return configuredDir ? path.resolve(configuredDir) : path.join(process.cwd(), '.data')
}

export function resolveDataFile(filename: string): string {
  return path.join(getDataRoot(), filename)
}

export function readJsonArray<T = unknown>(filePath: string): T[] | null {
  if (!fs.existsSync(filePath)) return null

  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  return Array.isArray(parsed) ? parsed : null
}

// ⚠️ DEPRECATED: Vercel filesystem is read-only at runtime.
// All write calls silently fail in production (Vercel serverless).
// After migration to Supabase events/tournaments tables
// (see /database/schema.sql SECTION 5), this function is a no-op.
// Kept for local development only.
export function writeJsonAtomically(filePath: string, data: unknown): void {
  if (process.env.VERCEL) {
    console.warn('[data-store] writeJsonAtomically skipped — Vercel filesystem is read-only.')
    return
  }

  const directory = path.dirname(filePath)
  const tempFile = path.join(
    directory,
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`
  )

  fs.mkdirSync(directory, { recursive: true })
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8')
  fs.renameSync(tempFile, filePath)
}
