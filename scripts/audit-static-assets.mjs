#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const publicDir = path.join(rootDir, 'public')

const warnBytes = Number(process.env.ASSET_WARN_BYTES || 1024 * 1024) // 1MB
const failBytes = Number(process.env.ASSET_FAIL_BYTES || 10 * 1024 * 1024) // 10MB
const reportLimit = Number(process.env.ASSET_REPORT_LIMIT || 30)
const ciMode = process.argv.includes('--ci')

const imageExts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg', '.heic', '.heif'])
const videoExts = new Set(['.mp4', '.webm', '.mov', '.m4v'])

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(absolute)))
      continue
    }

    if (!entry.isFile()) continue

    const stat = await fs.stat(absolute)
    const rel = path.relative(publicDir, absolute).replace(/\\/g, '/')
    const ext = path.extname(entry.name).toLowerCase()

    files.push({
      relPath: rel,
      size: stat.size,
      ext,
      isImage: imageExts.has(ext),
      isVideo: videoExts.has(ext),
    })
  }

  return files
}

async function main() {
  let files = []
  try {
    files = await walk(publicDir)
  } catch (error) {
    console.error(`[asset-audit] Failed to scan public directory: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }

  const sorted = files.sort((a, b) => b.size - a.size)
  const totalBytes = sorted.reduce((sum, file) => sum + file.size, 0)
  const imageBytes = sorted.filter((file) => file.isImage).reduce((sum, file) => sum + file.size, 0)
  const videoBytes = sorted.filter((file) => file.isVideo).reduce((sum, file) => sum + file.size, 0)
  const warnFiles = sorted.filter((file) => file.size >= warnBytes)
  const failFiles = sorted.filter((file) => file.size >= failBytes)

  console.info(`[asset-audit] Scanned ${sorted.length} files under public/`)
  console.info(`[asset-audit] Total size: ${formatBytes(totalBytes)} (images: ${formatBytes(imageBytes)}, videos: ${formatBytes(videoBytes)})`)
  console.info(`[asset-audit] Files >= ${formatBytes(warnBytes)}: ${warnFiles.length}`)
  console.info(`[asset-audit] Files >= ${formatBytes(failBytes)}: ${failFiles.length}`)
  console.info('')
  console.info(`[asset-audit] Top ${Math.min(reportLimit, sorted.length)} largest files:`)

  sorted.slice(0, reportLimit).forEach((file, index) => {
    console.info(`${String(index + 1).padStart(2, '0')}. ${formatBytes(file.size).padStart(10)}  public/${file.relPath}`)
  })

  if (ciMode && failFiles.length > 0) {
    console.error('')
    console.error('[asset-audit] CI mode failed due to oversized assets:')
    for (const file of failFiles) {
      console.error(` - public/${file.relPath} (${formatBytes(file.size)})`)
    }
    process.exit(1)
  }
}

await main()
