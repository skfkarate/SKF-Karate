/**
 * Factory: createInstructor
 */
import { generateId, isoNow, slugify } from './helpers'
import type { Instructor } from '../seed/instructors'

type InstructorInput = Partial<Instructor> & Pick<Instructor, 'name' | 'dan'>

export function createInstructor(input: InstructorInput): Instructor {
  return {
    id: input.id || generateId('ins'),
    slug: input.slug || slugify(input.name),
    name: input.name,
    title: input.title || 'Instructor',
    dan: input.dan,
    rank: input.rank,
    branch: input.branch,
    specialty: input.specialty || 'General Karate',
    role: input.role || 'Instructor',
    dojos: input.dojos,
    dojoSlug: input.dojoSlug,
    experience: input.experience || '5+ years',
    desc: input.desc || `${input.name} is a dedicated karate instructor.`,
    fullBio: input.fullBio || `${input.name} brings years of experience and dedication to the art of karate.`,
    achievements: input.achievements || [],
    quote: input.quote,
    image: input.image || '/gallery/In Dojo.jpeg',
    isFounder: input.isFounder || false,
    isExecutiveCommittee: input.isExecutiveCommittee ?? false,
    isSensei: input.isSensei ?? true,
    color: input.color || 'gold',
  }
}
