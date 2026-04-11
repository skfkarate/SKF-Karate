export function formatBranchName(slug: string): string {
  if (!slug) return ''
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
