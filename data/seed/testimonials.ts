/**
 * Seed: Testimonials — parent testimonials for the shop/home page.
 */

export interface Testimonial {
  id: string
  name: string
  parentOf: string
  branch: string
  quote: string
  rating: number
  photo: string | null
}

export const testimonials: Testimonial[] = [
  { id: 'tst_001', name: 'Priya M.', parentOf: 'Kiran (Yellow Belt)', branch: 'koramangala', quote: 'My son has grown so much in confidence since joining SKF. The senseis are patient and encouraging, pushing him to be his very best every single class.', rating: 5, photo: null },
  { id: 'tst_002', name: 'Rahul V.', parentOf: 'Aditi (Green Belt)', branch: 'whitefield', quote: 'We moved to SKF Karate after trying two other academies. The level of discipline, technical focus, and sportsmanship here is simply unmatched in Bangalore.', rating: 5, photo: null },
  { id: 'tst_003', name: 'Sarah J.', parentOf: 'Michael (Orange Belt)', branch: 'jp-nagar', quote: 'An incredible martial arts family. Not only does my child learn self-defense, but the life lessons about respect and resilience have transformed his attitude at home.', rating: 5, photo: null },
  { id: 'tst_004', name: 'Vikram S.', parentOf: 'Riya (Blue Belt)', branch: 'koramangala', quote: 'From a shy introverted girl to winning state-level gold medals. The elite training pathway at SKF is real and it works.', rating: 5, photo: null },
  { id: 'tst_005', name: 'Anika D.', parentOf: 'Aryan (Brown Belt)', branch: 'whitefield', quote: "The senseis at SKF don't just teach punches and kicks; they mold character. The community is so supportive and the curriculum is deeply structured.", rating: 5, photo: null },
  { id: 'tst_006', name: 'Nitin C.', parentOf: 'Vivaan (White Belt)', branch: 'jp-nagar', quote: 'Started just two months ago, and Vivaan is already completely obsessed with his training. The engaging classes keep him excited for every session.', rating: 5, photo: null },
  { id: 'tst_007', name: 'Deepika R.', parentOf: 'Sneha (Green Belt)', branch: 'koramangala', quote: 'The structured curriculum and regular progress tracking means we always know where our daughter stands. The belt grading system keeps her motivated.', rating: 4, photo: null },
  { id: 'tst_008', name: 'Suresh K.', parentOf: 'Aarav (Blue Belt)', branch: 'whitefield', quote: 'My son was bullied at school. After 6 months of SKF training, his confidence sky-rocketed. He now stands tall and walks with purpose.', rating: 5, photo: null },
  { id: 'tst_009', name: 'Meena T.', parentOf: 'Divya (Brown Belt)', branch: 'koramangala', quote: 'Divya has been with SKF for 3 years now. The transformation is unbelievable — she recently won bronze at nationals. Worth every rupee.', rating: 5, photo: null },
  { id: 'tst_010', name: 'Arjun N.', parentOf: 'Karthik (Yellow Belt)', branch: 'jp-nagar', quote: 'The weekend classes are perfectly timed for working parents. My son looks forward to Saturday training more than anything else in his week.', rating: 4, photo: null },
]
