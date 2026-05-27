import { spawn } from 'node:child_process'
import { mkdir, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const port = Number(process.env.LIGHTHOUSE_PORT || 3010)
const host = '127.0.0.1'
const url = process.env.LIGHTHOUSE_URL || `http://${host}:${port}`
const outputDir = path.join(process.cwd(), '.lighthouseci')
const outputPath = path.join(outputDir, 'home.json')
const thresholds = {
  performance: Number(process.env.LIGHTHOUSE_PERFORMANCE_MIN || 0.9),
  accessibility: Number(process.env.LIGHTHOUSE_ACCESSIBILITY_MIN || 0.9),
  'best-practices': Number(process.env.LIGHTHOUSE_BEST_PRACTICES_MIN || 0.9),
  seo: Number(process.env.LIGHTHOUSE_SEO_MIN || 0.9),
}

function spawnLogged(command, args, options = {}) {
  return spawn(command, args, {
    stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
    ...options,
  })
}

function waitForExit(child) {
  if (child.exitCode !== null) {
    return Promise.resolve(child.exitCode)
  }
  if (child.signalCode !== null) {
    return Promise.resolve(0)
  }

  return new Promise((resolve) => {
    child.on('exit', (code) => resolve(code ?? 1))
  })
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function collectOutput(child) {
  const chunks = []
  child.stdout?.on('data', (chunk) => chunks.push(chunk.toString()))
  child.stderr?.on('data', (chunk) => chunks.push(chunk.toString()))
  return () => chunks.join('')
}

async function waitForServer() {
  const deadline = Date.now() + 60_000
  let lastError

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: 'manual' })
      const contentType = response.headers.get('content-type') || ''
      if (response.status < 500 && contentType.includes('text/html')) return
      lastError = new Error(`Unexpected readiness response ${response.status} ${contentType || 'no content-type'}`)
    } catch (error) {
      lastError = error
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  throw new Error(`Timed out waiting for ${url}${lastError ? `: ${lastError.message}` : ''}`)
}

async function main() {
  await rm(outputDir, { recursive: true, force: true })
  await mkdir(outputDir, { recursive: true })

  const nextBin = path.join(process.cwd(), 'node_modules', '.bin', 'next')
  const server = spawnLogged(nextBin, ['start', '--hostname', host, '--port', String(port)], {
    stdio: ['ignore', 'ignore', 'pipe'],
  })

  let serverError = ''
  server.stderr.on('data', (chunk) => {
    serverError += chunk.toString()
  })

  try {
    await waitForServer()

    const lighthouseBin = path.join(process.cwd(), 'node_modules', '.bin', 'lighthouse')
    const lighthouse = spawnLogged(lighthouseBin, [
      url,
      '--only-categories=performance,accessibility,best-practices,seo',
      '--preset=desktop',
      '--chrome-flags=--headless=new --no-sandbox',
      '--output=json',
      `--output-path=${outputPath}`,
      '--quiet',
    ], {
      env: {
        ...process.env,
        CHROME_PATH: process.env.CHROME_PATH || chromium.executablePath(),
      },
    })
    const lighthouseOutput = collectOutput(lighthouse)

    const lighthouseCode = await waitForExit(lighthouse)
    if (lighthouseCode !== 0) {
      throw new Error(`Lighthouse exited with code ${lighthouseCode}\n${lighthouseOutput().trim()}`)
    }

    const report = JSON.parse(await readFile(outputPath, 'utf8'))
    const scores = Object.fromEntries(
      Object.entries(report.categories).map(([name, category]) => [name, Number(category.score)])
    )

    const failures = Object.entries(thresholds)
      .filter(([name, minimum]) => (scores[name] ?? 0) < minimum)
      .map(([name, minimum]) => `${name} ${(scores[name] ?? 0).toFixed(2)} < ${minimum.toFixed(2)}`)

    console.log(
      Object.entries(scores)
        .map(([name, score]) => `${name}: ${Math.round(score * 100)}`)
        .join(', ')
    )

    if (failures.length > 0) {
      throw new Error(`Lighthouse budget failed: ${failures.join('; ')}`)
    }
  } finally {
    server.kill('SIGTERM')
    await Promise.race([waitForExit(server), delay(3000)])
  }

  if (serverError.includes('Error:')) {
    console.warn(serverError.trim())
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
