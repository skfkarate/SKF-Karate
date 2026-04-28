#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const rootDir = process.cwd()
const publicDir = path.join(rootDir, 'public')

const minBytes = Number(process.env.IMAGE_OPTIMIZE_MIN_BYTES || 1024 * 1024) // 1MB
const maxWidth = Number(process.env.IMAGE_OPTIMIZE_MAX_WIDTH || 1920)
const qualityJpeg = Number(process.env.IMAGE_OPTIMIZE_JPEG_QUALITY || 78)
const qualityPng = Number(process.env.IMAGE_OPTIMIZE_PNG_QUALITY || 70)
const coloursPng = Number(process.env.IMAGE_OPTIMIZE_PNG_COLOURS || 192)
const dryRun = process.argv.includes('--dry-run')

const optimizeExts = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const skipExts = new Set(['.heic', '.heif', '.avif', '.gif', '.svg'])

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function relativePublicPath(filePath) {
  return path.relative(publicDir, filePath).replace(/\\/g, '/')
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(absolutePath)))
      continue
    }

    if (!entry.isFile()) continue
    files.push(absolutePath)
  }

  return files
}

async function optimizeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (skipExts.has(ext)) {
    return { status: 'skipped', reason: 'unsupported-ext' }
  }

  if (!optimizeExts.has(ext)) {
    return { status: 'skipped', reason: 'not-target-ext' }
  }

  const beforeStat = await fs.stat(filePath)
  if (beforeStat.size < minBytes) {
    return { status: 'skipped', reason: 'below-threshold' }
  }

  const source = sharp(filePath, { failOn: 'none' })
  const metadata = await source.metadata()
  const pipeline =
    metadata.width && metadata.width > maxWidth
      ? source.resize({ width: maxWidth, withoutEnlargement: true, fit: 'inside' })
      : source

  let outputBuffer
  if (ext === '.jpg' || ext === '.jpeg') {
    outputBuffer = await pipeline
      .jpeg({
        quality: qualityJpeg,
        mozjpeg: true,
        progressive: true,
      })
      .toBuffer()
  } else if (ext === '.png') {
    outputBuffer = await pipeline
      .png({
        compressionLevel: 9,
        effort: 8,
        palette: true,
        quality: qualityPng,
        colours: coloursPng,
      })
      .toBuffer()
  } else if (ext === '.webp') {
    outputBuffer = await pipeline
      .webp({
        quality: Math.min(qualityJpeg, 80),
        effort: 5,
      })
      .toBuffer()
  } else {
    return { status: 'skipped', reason: 'not-target-ext' }
  }

  const afterBytes = outputBuffer.length
  if (afterBytes >= beforeStat.size * 0.98) {
    return {
      status: 'skipped',
      reason: 'no-meaningful-improvement',
      beforeBytes: beforeStat.size,
      afterBytes,
    }
  }

  if (!dryRun) {
    await fs.writeFile(filePath, outputBuffer)
  }

  return {
    status: 'optimized',
    beforeBytes: beforeStat.size,
    afterBytes,
  }
}

async function main() {
  const files = await walk(publicDir)
  const results = []

  for (const filePath of files) {
    try {
      const result = await optimizeFile(filePath)
      results.push({ filePath, ...result })
    } catch (error) {
      results.push({
        filePath,
        status: 'error',
        reason: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const optimized = results.filter((item) => item.status === 'optimized')
  const skipped = results.filter((item) => item.status === 'skipped')
  const errors = results.filter((item) => item.status === 'error')

  const totalBefore = optimized.reduce((sum, item) => sum + item.beforeBytes, 0)
  const totalAfter = optimized.reduce((sum, item) => sum + item.afterBytes, 0)
  const totalSaved = totalBefore - totalAfter

  console.info(`[image-optimize] Mode: ${dryRun ? 'dry-run' : 'write'}`)
  console.info(`[image-optimize] Files scanned: ${results.length}`)
  console.info(`[image-optimize] Optimized: ${optimized.length}, skipped: ${skipped.length}, errors: ${errors.length}`)
  console.info(`[image-optimize] Bytes saved: ${formatBytes(totalSaved)} (${totalBefore > 0 ? ((totalSaved / totalBefore) * 100).toFixed(1) : '0.0'}%)`)

  if (optimized.length > 0) {
    console.info('[image-optimize] Top optimized files:')
    const top = [...optimized]
      .sort((a, b) => (b.beforeBytes - b.afterBytes) - (a.beforeBytes - a.afterBytes))
      .slice(0, 25)

    for (const item of top) {
      const saved = item.beforeBytes - item.afterBytes
      console.info(
        ` - public/${relativePublicPath(item.filePath)} | ${formatBytes(item.beforeBytes)} -> ${formatBytes(item.afterBytes)} (saved ${formatBytes(saved)})`
      )
    }
  }

  if (errors.length > 0) {
    console.error('[image-optimize] Errors:')
    for (const error of errors.slice(0, 25)) {
      console.error(` - public/${relativePublicPath(error.filePath)}: ${error.reason}`)
    }
    process.exit(1)
  }
}

await main()
