#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import convert from 'heic-convert'

const rootDir = process.cwd()

const args = new Map()
for (let i = 2; i < process.argv.length; i += 1) {
  const current = process.argv[i]
  if (!current.startsWith('--')) continue

  const [rawKey, rawValue] = current.split('=')
  const key = rawKey.slice(2)
  const value = rawValue ?? process.argv[i + 1]

  if (rawValue === undefined && value && !value.startsWith('--')) {
    args.set(key, value)
    i += 1
    continue
  }

  args.set(key, rawValue === undefined ? 'true' : rawValue)
}

const sourceRoot = path.resolve(rootDir, args.get('source') || 'public')
const outputRoot = path.resolve(rootDir, args.get('output') || sourceRoot)
const maxWidth = Number(args.get('max-width') || process.env.HEIC_CONVERT_MAX_WIDTH || 1920)
const quality = Number(args.get('quality') || process.env.HEIC_CONVERT_QUALITY || 78)
const dryRun = args.get('dry-run') === 'true'

const heicExts = new Set(['.heic', '.heif'])

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
    const absolutePath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(absolutePath)))
      continue
    }

    if (!entry.isFile()) continue
    const ext = path.extname(entry.name).toLowerCase()
    if (!heicExts.has(ext)) continue
    files.push(absolutePath)
  }

  return files
}

async function convertFile(inputPath) {
  const relativeInput = path.relative(sourceRoot, inputPath)
  const outputRelative = relativeInput.replace(/\.[^.]+$/i, '.jpeg')
  const outputPath = path.join(outputRoot, outputRelative)

  const inputBuffer = await fs.readFile(inputPath)
  const decodedJpeg = await convert({
    buffer: inputBuffer,
    format: 'JPEG',
    quality: 0.92,
  })

  const optimizedJpeg = await sharp(decodedJpeg)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true, fit: 'inside' })
    .jpeg({ quality, mozjpeg: true, progressive: true })
    .toBuffer()

  if (!dryRun) {
    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, optimizedJpeg)
  }

  return {
    inputPath,
    outputPath,
    beforeBytes: inputBuffer.length,
    afterBytes: optimizedJpeg.length,
  }
}

async function main() {
  let files = []
  try {
    files = await walk(sourceRoot)
  } catch (error) {
    console.error(`[heic-convert] Failed to read source directory: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }

  const converted = []
  const errors = []

  for (const filePath of files) {
    try {
      converted.push(await convertFile(filePath))
    } catch (error) {
      errors.push({
        filePath,
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const totalBefore = converted.reduce((sum, item) => sum + item.beforeBytes, 0)
  const totalAfter = converted.reduce((sum, item) => sum + item.afterBytes, 0)
  const totalSaved = totalBefore - totalAfter

  console.info(`[heic-convert] Mode: ${dryRun ? 'dry-run' : 'write'}`)
  console.info(`[heic-convert] Source: ${sourceRoot}`)
  console.info(`[heic-convert] Output: ${outputRoot}`)
  console.info(`[heic-convert] Converted files: ${converted.length}, errors: ${errors.length}`)
  console.info(`[heic-convert] Bytes saved: ${formatBytes(totalSaved)} (${totalBefore > 0 ? ((totalSaved / totalBefore) * 100).toFixed(1) : '0.0'}%)`)

  if (converted.length > 0) {
    for (const item of converted) {
      console.info(
        ` - ${path.relative(rootDir, item.inputPath)} -> ${path.relative(rootDir, item.outputPath)} | ${formatBytes(item.beforeBytes)} -> ${formatBytes(item.afterBytes)}`
      )
    }
  }

  if (errors.length > 0) {
    console.error('[heic-convert] Errors:')
    for (const error of errors.slice(0, 30)) {
      console.error(` - ${path.relative(rootDir, error.filePath)}: ${error.message}`)
    }
    process.exit(1)
  }
}

await main()

