/**
 * Public profile visibility is intentionally independent of portal access.
 *
 * `athletes.status` is the portal-access flag: only `active` athletes may log
 * in, and billing discontinuation flips it to `inactive`. That must never hide
 * a profile that was published when the student joined the association — the
 * public profile remains part of the historical record across discontinuations
 * and re-joins. `isPublic` is the only (explicit) privacy switch.
 */
type PublicAthleteLike = {
  isPublic?: boolean | null
}

export function isPubliclyVisibleAthlete<T extends PublicAthleteLike>(
  athlete?: T | null
): athlete is NonNullable<T> {
  if (!athlete) return false

  // Missing values default to public, matching the athletes.is_public column
  // default and the repository normalisation.
  return athlete.isPublic !== false
}
