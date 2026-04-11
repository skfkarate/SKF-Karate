export function formatBranchName(slug: string): string {
  if (!slug) return ''

  return slug
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}
