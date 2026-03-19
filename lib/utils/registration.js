// Generates registration numbers in the format: SKF-YYYY-NNNN
// YYYY = year of joining, NNNN = zero-padded sequential number within that year
// Example: SKF-2024-0042

export function generateRegistrationNumber(year, sequence) {
  const paddedSequence = sequence.toString().padStart(4, '0');
  return `SKF-${year}-${paddedSequence}`;
}

// Validate that a string looks like a valid SKF registration number
export function isValidRegistrationNumber(value) {
  return /^SKF-\d{4}-\d{4}$/.test(value.trim().toUpperCase());
}

// Normalise input — handle common variations students type
// e.g. "skf 2024 0042", "SKF2024-0042", "skf-2024-42"
export function normaliseRegistrationNumber(input) {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, '-').replace(/-+/g, '-');
  
  // Try to extract year and number
  const match = cleaned.match(/SKF[-\s]?(\d{4})[-\s]?(\d{1,4})/);
  if (!match) return input.trim().toUpperCase();
  
  const year = match[1];
  const num = match[2].padStart(4, '0');
  return `SKF-${year}-${num}`;
}
