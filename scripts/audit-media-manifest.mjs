#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const manifestPath = path.join(rootDir, 'data', 'media', 'manifest.json')
const publicDir = path.join(rootDir, 'public')
const ciMode = process.argv.includes('--ci')

const driveHosts = new Set(['drive.google.com', 'docs.google.com'])
const absoluteUrlRe = /^https?:\/\//i

function isAbsoluteHttpUrl(value) {
  return absoluteUrlRe.test(value)
}

function isRootPath(value) {
  return value.startsWith('/')
}

function stripQueryAndHash(value) {
  const queryIndex = value.indexOf('?')
  const hashIndex = value.indexOf('#')
  const cutIndexCandidates = [queryIndex, hashIndex].filter((index) => index >= 0)
  if (cutIndexCandidates.length === 0) return value
  return value.slice(0, Math.min(...cutIndexCandidates))
}

function hasDriveHost(value) {
  try {
    const parsed = new URL(value)
    return driveHosts.has(parsed.hostname)
  } catch {
    return false
  }
}

async function fileExists(filePath) {
  try {
    const stat = await fs.stat(filePath)
    return stat.isFile()
  } catch {
    return false
  }
}

async function main() {
  /** @type {Record<string, string>} */
  let manifest = {}

  try {
    const raw = await fs.readFile(manifestPath, 'utf8')
    manifest = JSON.parse(raw)
  } catch (error) {
    console.error(`[media-manifest-audit] Failed to read manifest: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }

  const entries = Object.entries(manifest)
  const errors = []
  const warnings = []

  if (entries.length === 0) {
    errors.push('Manifest is empty.')
  }

  for (const [key, value] of entries) {
    if (typeof value !== 'string' || !value.trim()) {
      errors.push(`${key}: value must be a non-empty string.`)
      continue
    }

    const candidate = value.trim()

    if (isAbsoluteHttpUrl(candidate)) {
      if (hasDriveHost(candidate)) {
        errors.push(`${key}: Google Drive URL is not allowed for production media (${candidate}).`)
      }
      continue
    }

    if (!isRootPath(candidate)) {
      errors.push(`${key}: value must be an absolute URL or root path (received "${candidate}").`)
      continue
    }

    const localPath = stripQueryAndHash(candidate)
    const relativeLocal = localPath.replace(/^\/+/, '')
    const absoluteLocal = path.join(publicDir, relativeLocal)
    if (!(await fileExists(absoluteLocal))) {
      warnings.push(`${key}: local asset not found at public${localPath}`)
    }
  }

  console.info(`[media-manifest-audit] Entries scanned: ${entries.length}`)

  if (warnings.length > 0) {
    console.warn(`[media-manifest-audit] Warnings: ${warnings.length}`)
    for (const warning of warnings) {
      console.warn(` - ${warning}`)
    }
  }

  if (errors.length > 0) {
    console.error(`[media-manifest-audit] Errors: ${errors.length}`)
    for (const error of errors) {
      console.error(` - ${error}`)
    }
    process.exit(1)
  }

  if (ciMode && warnings.length > 0) {
    console.error('[media-manifest-audit] CI mode failed due to warnings.')
    process.exit(1)
  }

  console.info('[media-manifest-audit] Passed.')
}

await main()
