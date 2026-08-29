export function formatLocaleDate(
  value: unknown,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (value === null || value === undefined || value === '') return ''
  const date = new Date(value as string | number | Date)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(locale, options)
}