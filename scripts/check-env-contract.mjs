import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const envSchemaPath = resolve(root, 'src/server/config/env.ts')
const envExamplePath = resolve(root, '.env.example')

const envSchemaSource = readFileSync(envSchemaPath, 'utf8')
const envExampleSource = readFileSync(envExamplePath, 'utf8')

const schemaKeys = [...envSchemaSource.matchAll(/^\s{2}([A-Z0-9_]+):/gm)]
  .map((match) => match[1])
  .filter((key) => key !== 'NODE_ENV')
  .sort()

const exampleKeys = [...envExampleSource.matchAll(/^([A-Z0-9_]+)=/gm)]
  .map((match) => match[1])
  .filter((key) => key !== 'NODE_ENV')
  .sort()

const schemaSet = new Set(schemaKeys)
const exampleSet = new Set(exampleKeys)

const missingFromExample = schemaKeys.filter((key) => !exampleSet.has(key))
const extraInExample = exampleKeys.filter((key) => !schemaSet.has(key))

if (missingFromExample.length || extraInExample.length) {
  console.error('Environment contract mismatch.')

  if (missingFromExample.length) {
    console.error(`Missing from .env.example: ${missingFromExample.join(', ')}`)
  }

  if (extraInExample.length) {
    console.error(`Not defined in env schema: ${extraInExample.join(', ')}`)
  }

  process.exit(1)
}

console.log(`Environment contract OK (${exampleKeys.length} documented variables).`)
