import { describe, expect, it } from 'vitest'

import {
  buildAthleteAdminFormDefaults,
  buildAthleteAutomationSummary,
  mergeStudentAndAthleteRecord,
} from '@/lib/admin/athlete-records'

describe('athlete admin record helpers', () => {
  it('builds editable defaults from sheet and live athlete data together', () => {
    const profile = buildAthleteAdminFormDefaults(
      {
        skfId: 'SKF26HE001',
        name: 'Asha Kumar',
        branch: 'herohalli',
        batch: 'Evening',
        belt: 'brown',
        parentName: 'Kumar',
        phone: '+919999999999',
        status: 'Active',
        enrolledDate: '2024-01-10',
        monthlyFee: 1800,
        photoConsent: true,
        dob: '2012-05-09',
      },
      {
        skfId: 'SKF26HE001',
        gender: 'female',
        email: 'asha@example.com',
        photoUrl: 'https://example.com/asha.jpg',
        isPublic: true,
        isFeatured: true,
      }
    )

    expect(profile).toEqual(
      expect.objectContaining({
        skfId: 'SKF26HE001',
        name: 'Asha Kumar',
        dob: '2012-05-09',
        gender: 'female',
        email: 'asha@example.com',
        photoUrl: 'https://example.com/asha.jpg',
        isPublic: true,
        isFeatured: true,
        status: 'Active',
      })
    )
  })

  it('summarizes auto-managed athlete history for admin display', () => {
    const summary = buildAthleteAutomationSummary({
      achievements: [
        { type: 'tournament-gold', date: '2026-03-11', pointsAwarded: 90 },
        { type: 'belt-pass', date: '2026-01-10', pointsAwarded: 0 },
        { type: 'seminar', date: '2026-04-01', pointsAwarded: 0 },
      ],
    })

    expect(summary).toEqual(
      expect.objectContaining({
        competitionResults: 1,
        beltEntries: 1,
        specialEvents: 1,
        lifetimePoints: 90,
        achievementCount: 3,
        lastActivityDate: '2026-04-01',
      })
    )
  })

  it('merges student and athlete records with public profile metadata', () => {
    const merged = mergeStudentAndAthleteRecord(
      {
        skfId: 'SKF26HE001',
        name: 'Asha Kumar',
        branch: 'herohalli',
        belt: 'brown',
        status: 'Active',
      },
      {
        skfId: 'SKF26HE001',
        photoUrl: 'https://example.com/asha.jpg',
        isPublic: true,
        isFeatured: false,
        achievements: [{ type: 'tournament-gold', date: '2026-03-11', pointsAwarded: 90 }],
      }
    )

    expect(merged).toEqual(
      expect.objectContaining({
        skfId: 'SKF26HE001',
        displayName: 'Asha Kumar',
        publicProfileHref: '/athlete/SKF26HE001',
        isPublic: true,
      })
    )
    expect(merged.automation.achievementCount).toBe(1)
  })
})
