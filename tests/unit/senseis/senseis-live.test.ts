import { describe, expect, it } from 'vitest'

import { buildStaticSenseiDataset, toSenseiSummary } from '@/lib/server/repositories/senseis-live'

describe('senseis-live', () => {
  it('builds a static dataset that includes seeded senseis and branch-only instructors', () => {
    const senseis = buildStaticSenseiDataset()

    const usha = senseis.find((sensei) => sensei.name === 'Sensei Usha C')
    const krishna = senseis.find((sensei) => sensei.name === 'Sensei Krishna C')

    expect(usha).toBeTruthy()
    expect(usha?.assignments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          branchName: 'M P Sports Club',
          citySlug: 'bangalore',
        }),
      ])
    )

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
