import { describe, expect, it } from 'vitest'

import { buildStaticSenseiDataset, toSenseiSummary } from '@/lib/server/repositories/senseis-live'

describe('senseis-live', () => {
  it('builds a static dataset that includes seeded senseis and branch-only instructors', () => {
    const senseis = buildStaticSenseiDataset()

    const founder = senseis.find((sensei) => sensei.name === 'Renshi Dr. Channegowda UC')
    const usha = senseis.find((sensei) => sensei.name === 'Sensei Usha C')
    const treasurer = senseis.find((sensei) => sensei.name === 'Latha')
    const krishna = senseis.find((sensei) => sensei.name === 'Sensei Krishna C')

    expect(founder).toBeTruthy()
    expect(founder?.isFounder).toBe(true)
    expect(founder?.isExecutiveCommittee).toBe(true)
    expect(founder?.isAssignable).toBe(false)

    expect(usha).toBeTruthy()
    expect(usha?.isExecutiveCommittee).toBe(true)
    expect(usha?.isAssignable).toBe(true)
    expect(usha?.assignments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          branchName: 'M P Sports Club',
          citySlug: 'bangalore',
        }),
      ])
    )

    expect(treasurer).toBeTruthy()
    expect(treasurer?.isExecutiveCommittee).toBe(true)
    expect(treasurer?.isAssignable).toBe(false)

    expect(krishna).toBeTruthy()
    expect(krishna?.slug).toBe('krishna-c')
    expect(krishna?.assignments).toEqual([
      expect.objectContaining({
        branchName: 'Herohalli',
        citySlug: 'bangalore',
      }),
    ])
  })

  it('creates compact dropdown-safe summaries from full sensei profiles', () => {
    const [record] = buildStaticSenseiDataset()
    const summary = toSenseiSummary(record)

    expect(summary).toEqual(
      expect.objectContaining({
        id: record.id,
        slug: record.slug,
        name: record.name,
        dan: record.dan,
        isAssignable: record.isAssignable,
      })
    )
  })
})
