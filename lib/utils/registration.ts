// SKF ID Format: SKF{YY}{BRANCH}{NNN}
// YY     = 2-digit year of joining
// BRANCH = 2-letter branch code (e.g. MP = M P Sports Club, HE = Herohalli)
// NNN    = 3-digit zero-padded sequential number within that branch+year
// Example: SKF25MP001 -> SKF, 2025, MP Sports, Student #001

// Known branch codes
const BRANCH_CODES: Record<string, string> = {
  'sunkadakatte': 'SK',
  'rajajinagar': 'RJ',
  'malleshwaram': 'ML',
  'm p sports club': 'MP',
  'mp sports club': 'MP',
  'herohalli': 'HE',
  'kunigal-main': 'KG',
  'kunigal': 'KG',
  'tumkur-main': 'TK',
  'tumkur': 'TK',
  'udupi-main': 'UD',
  'udupi': 'UD',
}

export function getBranchCode(branchName: string): string {
  const normalized = String(branchName || '').toLowerCase().trim()
  if (!normalized) return 'MP'

  return BRANCH_CODES[normalized] || normalized.replace(/[^a-z]/g, '').slice(0, 2).toUpperCase() || 'MP'
}

export function generateSkfId(year: number, sequence: number): string
export function generateSkfId(year: number, branchName: string, sequence: number): string
export function generateSkfId(
  year: number,
  branchOrSequence: string | number,
  maybeSequence?: number
): string {
  const yy = String(year).slice(-2)
  const branchName = typeof branchOrSequence === 'number' ? 'MP' : branchOrSequence
  const sequence = typeof branchOrSequence === 'number' ? branchOrSequence : maybeSequence || 1
  const branch = getBranchCode(branchName)
  const num = String(sequence).padStart(3, '0')
  return `SKF${yy}${branch}${num}`
}

// Validate that a string looks like a valid SKF ID
// Supports the current format (SKF25MP001), branch-first imports (MP25-001),
// and old SKF-hyphen records (SKF-2024-0042) so existing data can be migrated.
export function isValidSkfId(value: string): boolean {
  const v = value.trim().toUpperCase()
  return (
    /^SKF\d{2}[A-Z]{2}\d{3,}$/.test(v) ||
    /^[A-Z]{2}\d{2}-?\d{1,}$/.test(v) ||
    /^SKF-\d{4}-\d{4}$/.test(v)
  )
}

export function parseSkfId(value: string) {
  const normalized = normaliseSkfId(value)
  const current = normalized.match(/^SKF(\d{2})([A-Z]{2})(\d{3,})$/)
  if (current) {
    const [, yy, branchCode, sequence] = current
    return {
      year: 2000 + Number(yy),
      yearSuffix: yy,
      branchCode,
      sequence: Number(sequence),
      legacy: false,
    }
  }

  const legacy = normalized.match(/^SKF-(\d{4})-(\d{4})$/)
  if (legacy) {
    const [, year, sequence] = legacy
    return {
      year: Number(year),
      yearSuffix: year.slice(-2),
      branchCode: 'MP',
      sequence: Number(sequence),
      legacy: true,
    }
  }

  return null
}

// Normalise input and convert branch-year imports into the canonical SKF ID.
// Supports: "SKF25MP001", "skf25mp001", "MP25-001", "SKF-2024-0042".
export function normaliseSkfId(input: string): string {
  const raw = String(input || '').trim()
  const cleaned = raw.toUpperCase().replace(/\s+/g, '').replace(/-/g, '')

  // New format: SKF25MP001
  const newMatch = cleaned.match(/^SKF(\d{2})([A-Z]{2})(\d{1,})$/)
  if (newMatch) {
    const [, yy, branch, num] = newMatch
    return `SKF${yy}${branch}${num.padStart(3, '0')}`
  }

  // Branch-first imports: MP25-001 -> SKF25MP001
  const branchFirstMatch = cleaned.match(/^([A-Z]{2})(\d{2})(\d{1,})$/)
  if (branchFirstMatch) {
    const [, branch, yy, num] = branchFirstMatch
    return `SKF${yy}${branch}${num.padStart(3, '0')}`
  }

  // Legacy SKF format without a branch: SKF20240042 or SKF-2024-0042.
  // Keep the ID in the current public shape by assigning MP as the default branch.
  const legacyMatch = cleaned.match(/^SKF(\d{4})(\d{1,4})$/)
  if (legacyMatch) {
    const [, year, num] = legacyMatch
    return `SKF${year.slice(-2)}MP${String(Number(num)).padStart(3, '0')}`
  }

  // If nothing matched, return cleaned up
  return raw.toUpperCase().replace(/\s+/g, '-').replace(/-+/g, '-')
}
