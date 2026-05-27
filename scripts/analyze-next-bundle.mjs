#!/usr/bin/env node

import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const args = new Set(process.argv.slice(2))
const ciMode = args.has('--ci')
const showDetails = args.has('--details') || ciMode
const staticDir = path.join(process.cwd(), '.next', 'static')

const DEFAULT_BUDGETS = {
  totalJsBytes: 3_200_000,
  totalCssBytes: 700_000,
  maxJsFileBytes: 320_000,
  maxCssFileBytes: 140_000,
}

function readBudget(name, fallback) {
  const raw = process.env[name]
  if (!raw) return fallback

  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const budgets = {
  totalJsBytes: readBudget('BUNDLE_BUDGET_TOTAL_JS_BYTES', DEFAULT_BUDGETS.totalJsBytes),
  totalCssBytes: readBudget('BUNDLE_BUDGET_TOTAL_CSS_BYTES', DEFAULT_BUDGETS.totalCssBytes),
  maxJsFileBytes: readBudget('BUNDLE_BUDGET_MAX_JS_FILE_BYTES', DEFAULT_BUDGETS.maxJsFileBytes),
  maxCssFileBytes: readBudget('BUNDLE_BUDGET_MAX_CSS_FILE_BYTES', DEFAULT_BUDGETS.maxCssFileBytes),
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walk(absolutePath))
    } else if (entry.isFile() && !entry.name.endsWith('.map')) {
      const info = await stat(absolutePath)
      files.push({
        path: absolutePath,
        relPath: path.relative(process.cwd(), absolutePath),
        size: info.size,
      })
    }
  }

  return files
}

function summarize(files, extension) {
  const matching = files
    .filter((file) => file.path.endsWith(extension))
    .sort((a, b) => b.size - a.size)

  return {
    files: matching,
    total: matching.reduce((sum, file) => sum + file.size, 0),
    largest: matching[0] || null,
  }
}

function printTopFiles(label, files) {
  console.info(`[bundle] Largest ${label} files:`)
  for (const [index, file] of files.slice(0, 10).entries()) {
    console.info(`${String(index + 1).padStart(2, '0')}. ${formatBytes(file.size).padStart(10)}  ${file.relPath}`)
  }
}

let files
try {
  files = await walk(staticDir)
} catch (error) {
  console.error(`[bundle] Could not read ${path.relative(process.cwd(), staticDir)}. Run a production build first.`)
  if (showDetails && error instanceof Error) {
    console.error(`[bundle] ${error.message}`)
  }
  process.exit(1)
}

const js = summarize(files, '.js')
const css = summarize(files, '.css')

console.info(`[bundle] Static JS: ${formatBytes(js.total)} across ${js.files.length} files`)
console.info(`[bundle] Static CSS: ${formatBytes(css.total)} across ${css.files.length} files`)
console.info(`[bundle] Largest JS: ${js.largest ? `${formatBytes(js.largest.size)} ${js.largest.relPath}` : 'none'}`)
console.info(`[bundle] Largest CSS: ${css.largest ? `${formatBytes(css.largest.size)} ${css.largest.relPath}` : 'none'}`)

if (showDetails) {
  printTopFiles('JS', js.files)
  printTopFiles('CSS', css.files)
}

const failures = []
if (js.total > budgets.totalJsBytes) {
  failures.push(`Total JS ${formatBytes(js.total)} exceeds ${formatBytes(budgets.totalJsBytes)}`)
}
if (css.total > budgets.totalCssBytes) {
  failures.push(`Total CSS ${formatBytes(css.total)} exceeds ${formatBytes(budgets.totalCssBytes)}`)
}
if (js.largest && js.largest.size > budgets.maxJsFileBytes) {
  failures.push(`Largest JS file ${formatBytes(js.largest.size)} exceeds ${formatBytes(budgets.maxJsFileBytes)}: ${js.largest.relPath}`)
}
if (css.largest && css.largest.size > budgets.maxCssFileBytes) {
  failures.push(`Largest CSS file ${formatBytes(css.largest.size)} exceeds ${formatBytes(budgets.maxCssFileBytes)}: ${css.largest.relPath}`)
}

if (ciMode && failures.length > 0) {
  console.error('[bundle] CI budget failed:')
  for (const failure of failures) {
    console.error(` - ${failure}`)
  }
  process.exit(1)
}

if (ciMode) {
  console.info('[bundle] CI budget passed.')
}
