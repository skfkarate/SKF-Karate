/**
 * Home Page Content Constants
 * Hero copy, CTA features, "Why Parents Choose", "Your First Class", cinematic values, etc.
 */

export const homeWhyParentsChooseData = [
  {
    iconType: 'shield',
    title: 'WKF Certified',
    desc: 'World Karate Federation-affiliated. Every belt, every grade is internationally recognized.',
  },
  {
    iconType: 'graduate',
    title: 'Black Belt Instructors',
    desc: 'All classes led by certified Dan-graded black belt instructors with competition experience.',
  },
  {
    iconType: 'trophy',
    title: 'Competition Ready',
    desc: 'From local tournaments to international championships — we prepare champions at every level.',
  },
  {
    iconType: 'users',
    title: 'Small Class Sizes',
    desc: 'Personal attention guaranteed. Every student gets the coaching they deserve.',
  },
  {
    iconType: 'award',
    title: 'Character First',
    desc: 'Discipline, respect, confidence — values that go far beyond the dojo.',
  },
]

export const homePathsOfMasteryData = [
  {
    id: 'kyu-journey',
    title: 'The Kyu Journey',
    desc: 'Build your unshakable foundation and discipline.',
    bgImage: '/gallery/beltexam.jpg',
    link: '/grading',
  },
  {
    id: 'dan-sanctuary',
    title: 'The Dan Sanctuary',
    desc: 'Advance into true artistry and complete mastery.',
    bgImage: '/gallery/belt.jpg',
    link: '/grading',
  },
]

export const homeYourFirstClassData = [
  {
    iconType: 'calendar',
    number: '01',
    title: 'Book Your Trial',
    desc: "Fill out a quick form or WhatsApp us. We'll confirm your slot within 24 hours.",
  },
  {
    iconType: 'tshirt',
    number: '02',
    title: 'Show Up',
    desc: 'Wear comfortable clothes. No special gear needed for your first class.',
  },
  {
    iconType: 'child',
    number: '03',
    title: 'Train with Champions',
    desc: 'A 60-minute guided session with a certified black belt instructor.',
  },
  {
    iconType: 'smile',
    number: '04',
    title: 'Join the Family',
    desc: 'Loved it? Pick a plan that fits. No long-term contracts required.',
  },
]

export const cinematicValuesData = [
  { text: 'DISCIPLINE', img: '/gallery/In Dojo.jpeg', pos: 'center 25%' },
  { text: 'INCLUSION', img: '/gallery/IMG_1191.JPG.jpeg', pos: 'center 30%' },
  { text: 'SPIRIT', img: '/gallery/Karate Demonstration2 starred.jpeg', pos: 'center 20%' },
  { text: 'EXCELLENCE', img: '/gallery/Tournment8 starred.jpeg', pos: 'center 20%' },
  { text: 'RESPECT', img: '/gallery/Tournment.jpeg', pos: 'center 25%' },
  { text: 'PASSION', img: '/gallery/Train the Elite - Training Camp starred.jpeg', pos: 'center 20%' },
  { text: 'FAMILY', img: '/gallery/In dojo 2 starred.jpeg', pos: 'center 25%' },
  { text: 'HERE WE ARE', img: '/logo/SKF logo.png', isLogo: true },
] as { text: string; img: string; pos?: string; isLogo?: boolean }[]

export const homeBookTrialCTAFeatures = [
  'No commitment required',
  'All ages and skill levels welcome',
  'Train under Grandmasters',
]

/** Hero section copy */
export const HERO_COPY = Object.freeze({
  BADGE: 'Nothing is Impossible',
  TITLE_PRE: 'SKF',
  TITLE_ACCENT: 'KARATE',
  SUBTITLE: 'Sports Karate-do Fitness & Self Defence Association®',
  DESCRIPTION: 'Where discipline meets excellence. Train with masters, compete with champions, and forge an unbreakable spirit.',
  WATERMARK: '空手',
})
