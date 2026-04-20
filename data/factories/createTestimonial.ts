/**
 * Factory: createTestimonial
 */
import { generateId } from './helpers'
import type { Testimonial } from '../seed/testimonials'

type TestimonialInput = Partial<Testimonial> & Pick<Testimonial, 'name' | 'quote'>

export function createTestimonial(input: TestimonialInput): Testimonial {
  return {
    id: input.id || generateId('tst'),
    name: input.name,
    parentOf: input.parentOf || '',
    branch: input.branch || 'koramangala',
    quote: input.quote,
    rating: input.rating ?? 5,
    photo: input.photo || null,
  }
}
