import { describe, expect, it } from 'vitest'

import { practiceAudienceMatches } from '@/lib/server/repositories/portal-content-live'

describe('Home Practice audience rules', () => {
  const yellowMpMorning = { branchSlug: 'm-p-sports-club', batch: 'morning', belt: 'yellow' }

  it('allows an unrestricted folder for every athlete', () => {
    expect(practiceAudienceMatches({ branchSlugs: [], batchNames: [], beltLevels: [] }, yellowMpMorning)).toBe(true)
  })

  it('requires every configured rule to match', () => {
    const yellowMpFolder = {
      branchSlugs: ['m-p-sports-club'],
      batchNames: ['morning'],
      beltLevels: ['yellow'],
    }
    expect(practiceAudienceMatches(yellowMpFolder, yellowMpMorning)).toBe(true)
    expect(practiceAudienceMatches(yellowMpFolder, { ...yellowMpMorning, belt: 'orange' })).toBe(false)
    expect(practiceAudienceMatches(yellowMpFolder, { ...yellowMpMorning, branchSlug: 'herohalli' })).toBe(false)
  })

  it('keeps a lesson hidden when either its folder or its own rule excludes the athlete', () => {
    const folderAllowsYellow = { branchSlugs: [], batchNames: [], beltLevels: ['yellow'] }
    const lessonAllowsOrange = { branchSlugs: [], batchNames: [], beltLevels: ['orange'] }
    expect(practiceAudienceMatches(folderAllowsYellow, yellowMpMorning)).toBe(true)
    expect(practiceAudienceMatches(lessonAllowsOrange, yellowMpMorning)).toBe(false)
  })

  it('distinguishes the detailed Kyu belt categories', () => {
    const greenTwo = { branchSlug: '', batch: '', belt: 'Green II Belt' }
    expect(practiceAudienceMatches({ branchSlugs: [], batchNames: [], beltLevels: ['green-ii'] }, greenTwo)).toBe(true)
    expect(practiceAudienceMatches({ branchSlugs: [], batchNames: [], beltLevels: ['green-i'] }, greenTwo)).toBe(false)
    expect(practiceAudienceMatches({ branchSlugs: [], batchNames: [], beltLevels: ['brown-iii'] }, { ...greenTwo, belt: 'Brown III' })).toBe(true)
  })

  it('matches human-readable batch names without changing their spaces', () => {
    expect(practiceAudienceMatches(
      { branchSlugs: ['branch-a'], batchNames: ['evening'], beltLevels: ['black'] },
      { branchSlug: 'branch-a', batch: 'evening', belt: 'black' }
    )).toBe(true)
  })
})
