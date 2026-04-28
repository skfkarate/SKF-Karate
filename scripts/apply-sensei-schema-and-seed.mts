import { Client } from 'pg'

import { instructors } from '../data/seed/instructors.ts'
import { cities } from '../lib/classesData.ts'

type SenseiSeedRecord = {
  id: string
  slug: string
  name: string
  title: string
  dan: string
  role: string
  specialty: string
  experience: string
  description: string
  fullBio: string
  achievements: string[]
  quote: string
  imageUrl: string
  accent: string
  isFounder: boolean
  isExecutiveCommittee: boolean
  isPublic: boolean
  isActive: boolean
  isAssignable: boolean
  sortOrder: number
}

const connectionString = process.env.SUPABASE_DATABASE_URL

if (!connectionString) {
  throw new Error('SUPABASE_DATABASE_URL is required.')
}

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function normalizePersonKey(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^sensei\s+/i, '')
    .replace(/\s+/g, ' ')
}

function buildSenseiSeeds(): SenseiSeedRecord[] {
  const records: SenseiSeedRecord[] = []
  const seen = new Set<string>()

  for (const [index, instructor] of instructors.entries()) {
    const shouldInclude = instructor.isSensei || /^sensei\b/i.test(instructor.name)
    if (!shouldInclude) continue

    records.push({
      id: instructor.id,
      slug: instructor.slug,
      name: instructor.name,
      title: instructor.title || instructor.role || 'Lead Instructor',
      dan: instructor.dan || instructor.rank || 'Lead Instructor',
      role: instructor.role || instructor.title || 'Lead Instructor',
      specialty: instructor.specialty || 'Karate Instruction',
      experience: instructor.experience || '',
      description:
        instructor.desc || `${instructor.name} serves in the SKF Karate coaching team.`,
      fullBio:
        instructor.fullBio ||
        instructor.desc ||
        `${instructor.name} serves in the SKF Karate coaching team.`,
      achievements: Array.isArray(instructor.achievements) ? instructor.achievements : [],
      quote: instructor.quote || '',
      imageUrl: instructor.image || '/gallery/Training.jpeg',
      accent: instructor.color || 'gold',
      isFounder: Boolean(instructor.isFounder),
      isExecutiveCommittee: Boolean(instructor.isExecutiveCommittee),
      isPublic: true,
      isActive: true,
      isAssignable: true,
      sortOrder: index,
    })

    seen.add(normalizePersonKey(instructor.name))
  }

  for (const city of cities) {
    for (const branch of city.branches) {
      const normalizedKey = normalizePersonKey(branch.sensei)
      if (!normalizedKey || normalizedKey === 'to be updated' || seen.has(normalizedKey)) {
        continue
      }

      records.push({
        id: `sensei_${slugify(normalizedKey)}`,
        slug: slugify(normalizedKey),
        name: branch.sensei,
        title: 'Lead Instructor',
        dan: branch.senseiDan || 'Lead Instructor',
        role: 'Lead Instructor',
        specialty: 'Branch Training',
        experience: '',
        description:
          branch.description ||
          `${branch.sensei} leads day-to-day SKF Karate training for ${branch.name}.`,
        fullBio:
          branch.description ||
          `${branch.sensei} leads day-to-day SKF Karate training for ${branch.name}.`,
        achievements: [],
        quote: '',
        imageUrl: '/gallery/Training.jpeg',
        accent: 'gold',
        isFounder: false,
        isExecutiveCommittee: false,
        isPublic: true,
        isActive: true,
        isAssignable: true,
        sortOrder: records.length,
      })

      seen.add(normalizedKey)
    }
  }

  return records
}

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })
  const senseis = buildSenseiSeeds()
  const senseiByName = new Map(senseis.map((sensei) => [normalizePersonKey(sensei.name), sensei]))

  await client.connect()

  try {
    await client.query('BEGIN')

    await client.query(`
      CREATE TABLE IF NOT EXISTS senseis (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        dan TEXT NOT NULL,
        role TEXT NOT NULL,
        specialty TEXT NOT NULL DEFAULT 'Karate Instruction',
        experience TEXT DEFAULT '',
        description TEXT NOT NULL,
        full_bio TEXT NOT NULL,
        achievements JSONB DEFAULT '[]',
        quote TEXT DEFAULT '',
        image_url TEXT,
        accent_color TEXT NOT NULL DEFAULT 'gold'
          CHECK (accent_color IN ('gold', 'crimson', 'blue', 'neutral')),
        is_founder BOOLEAN DEFAULT false,
        is_executive_committee BOOLEAN DEFAULT false,
        is_public BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        is_assignable BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_senseis_public ON senseis(is_public, is_active, sort_order);
      CREATE INDEX IF NOT EXISTS idx_senseis_assignable ON senseis(is_assignable, is_active, sort_order);

      ALTER TABLE class_branches ADD COLUMN IF NOT EXISTS lead_sensei_id TEXT;

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'class_branches_lead_sensei_id_fkey'
        ) THEN
          ALTER TABLE class_branches
            ADD CONSTRAINT class_branches_lead_sensei_id_fkey
            FOREIGN KEY (lead_sensei_id)
            REFERENCES senseis(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE;
        END IF;
      END
      $$;

      CREATE INDEX IF NOT EXISTS idx_class_branches_sensei
        ON class_branches(lead_sensei_id, city_slug, sort_order);

      ALTER TABLE senseis ENABLE ROW LEVEL SECURITY;

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_policies
          WHERE schemaname = 'public'
            AND tablename = 'senseis'
            AND policyname = 'service_role_full_senseis'
        ) THEN
          CREATE POLICY "service_role_full_senseis" ON senseis
            FOR ALL USING (auth.role() = 'service_role');
        END IF;
      END
      $$;
    `)

    for (const sensei of senseis) {
      await client.query(
        `
          INSERT INTO senseis (
            id,
            slug,
            name,
            title,
            dan,
            role,
            specialty,
            experience,
            description,
            full_bio,
            achievements,
            quote,
            image_url,
            accent_color,
            is_founder,
            is_executive_committee,
            is_public,
            is_active,
            is_assignable,
            sort_order,
            updated_at
          )
          VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13,$14,$15,$16,$17,$18,$19,$20,NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            slug = EXCLUDED.slug,
            name = EXCLUDED.name,
            title = EXCLUDED.title,
            dan = EXCLUDED.dan,
            role = EXCLUDED.role,
            specialty = EXCLUDED.specialty,
            experience = EXCLUDED.experience,
            description = EXCLUDED.description,
            full_bio = EXCLUDED.full_bio,
            achievements = EXCLUDED.achievements,
            quote = EXCLUDED.quote,
            image_url = EXCLUDED.image_url,
            accent_color = EXCLUDED.accent_color,
            is_founder = EXCLUDED.is_founder,
            is_executive_committee = EXCLUDED.is_executive_committee,
            is_public = EXCLUDED.is_public,
            is_active = EXCLUDED.is_active,
            is_assignable = EXCLUDED.is_assignable,
            sort_order = EXCLUDED.sort_order,
            updated_at = NOW()
        `,
        [
          sensei.id,
          sensei.slug,
          sensei.name,
          sensei.title,
          sensei.dan,
          sensei.role,
          sensei.specialty,
          sensei.experience,
          sensei.description,
          sensei.fullBio,
          JSON.stringify(sensei.achievements),
          sensei.quote,
          sensei.imageUrl,
          sensei.accent,
          sensei.isFounder,
          sensei.isExecutiveCommittee,
          sensei.isPublic,
          sensei.isActive,
          sensei.isAssignable,
          sensei.sortOrder,
        ]
      )
    }

    for (const city of cities) {
      for (const branch of city.branches) {
        const matchedSensei = senseiByName.get(normalizePersonKey(branch.sensei))

        await client.query(
          `
            UPDATE class_branches
            SET
              lead_sensei_id = $2,
              sensei = $3,
              sensei_dan = $4,
              updated_at = NOW()
            WHERE slug = $1
          `,
          [
            branch.slug,
            matchedSensei?.id || null,
            matchedSensei?.name || branch.sensei,
            matchedSensei?.dan || branch.senseiDan,
          ]
        )
      }
    }

    await client.query('COMMIT')

    const { rows } = await client.query(`
      SELECT
        to_regclass('public.senseis') AS senseis_table,
        count(*)::int AS sensei_count
      FROM senseis
    `)

    console.log(JSON.stringify(rows[0], null, 2))
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
