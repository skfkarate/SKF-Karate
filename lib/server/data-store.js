import fs from 'node:fs'
import path from 'node:path'

function getDataRoot() {
  const configuredDir = process.env.SKF_DATA_DIR?.trim()
  return configuredDir ? path.resolve(configuredDir) : path.join(process.cwd(), '.data')
}

export function resolveDataFile(filename) {
  return path.join(getDataRoot(), filename)
}

export function readJsonArray(filePath) {
  if (!fs.existsSync(filePath)) return null

  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  return Array.isArray(parsed) ? parsed : null
}

export function writeJsonAtomically(filePath, data) {
  const directory = path.dirname(filePath)
  const tempFile = path.join(
    directory,
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`
  )

  fs.mkdirSync(directory, { recursive: true })
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8')
  fs.renameSync(tempFile, filePath)
}
