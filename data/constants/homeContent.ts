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
  { text: 'SPIRIT', img: '/gallery/Karate Demonstration2 starred.jpeg', pos: 'center 20%' },
  { text: 'EXCELLENCE', img: '/gallery/Tournment8 starred.jpeg', pos: 'center 20%' },
  { text: 'RESPECT', img: '/gallery/Tournment.jpeg', pos: 'center 25%' },
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
  BADGE: 'Team SKF',
  TITLE_LINE1: 'Where Champions',
  TITLE_ACCENT: 'Are Made',
  SUBTITLE: 'Sports Karate-do Fitness & Self Defence Association®',
  DESCRIPTION: 'Awaken your true potential. Train alongside the elite. Forge an unbreakable legacy across Bangalore, Tumkur, Kunigal & Udupi.',
  WATERMARK: '空手',
})

/** Philosophy / About section */
export const PHILOSOPHY_SECTION = Object.freeze({
  LABEL: 'Our Philosophy',
  TITLE_1: 'The Art of',
  TITLE_ACCENT: 'Becoming',
  BODY: 'SKF Karate is not just a martial arts academy — it is a crucible for character. We believe every strike sharpens focus, every kata builds resilience, and every sparring session forges bonds that transcend the mat. Our WKF-certified curriculum blends centuries-old tradition with modern sports science, creating warriors who excel in competition and in life.',
  STAT_YEARS: '15+',
  STAT_YEARS_LABEL: 'Years of Excellence',
  STAT_BELTS: '87',
  STAT_BELTS_LABEL: 'Black Belts Produced',
})

/** Belt Journey / Progression */
export const BELT_JOURNEY_SECTION = Object.freeze({
  LABEL: 'The Path',
  TITLE_1: 'Your Journey to',
  TITLE_ACCENT: 'Mastery',
  SUBTITLE: 'Every belt tells a story of perseverance. From the purity of white to the depth of black, each rank is earned through sweat, discipline, and unwavering commitment.',
  BELTS: [
    { name: 'White', color: '#FFFFFF', meaning: 'Purity & Beginning', stage: 'Foundation' },
    { name: 'Yellow', color: '#FFD700', meaning: 'First Light of Knowledge', stage: 'Awareness' },
    { name: 'Orange', color: '#FF8C00', meaning: 'Growing Strength', stage: 'Development' },
    { name: 'Green', color: '#228B22', meaning: 'Growth & Refinement', stage: 'Growth' },
    { name: 'Blue', color: '#4169E1', meaning: 'Depth of Understanding', stage: 'Depth' },
    { name: 'Brown', color: '#8B4513', meaning: 'Maturity & Preparation', stage: 'Maturity' },
    { name: 'Black', color: '#1a1a1a', meaning: 'Mastery & New Beginning', stage: 'Mastery' },
  ],
})

/** FAQ Section */
export const FAQ_SECTION = Object.freeze({
  LABEL: 'Common Questions',
  TITLE_1: 'Everything You',
  TITLE_ACCENT: 'Need to Know',
  ITEMS: [
    {
      question: 'What age can my child start karate?',
      answer: 'We accept students from age 4 and above. Our Little Champions program (ages 4-7) is designed specifically for young learners with age-appropriate exercises, games, and fundamental techniques.',
    },
    {
      question: 'Do I need any prior experience?',
      answer: 'Absolutely not. Our curriculum is structured to take complete beginners through a progressive journey. Whether you are 5 or 50, our certified instructors will guide you at your own pace.',
    },
    {
      question: 'How often should my child train?',
      answer: 'We recommend 2-3 sessions per week for consistent progress. Our flexible scheduling allows you to pick class times that work best for your family.',
    },
    {
      question: 'Is karate safe for children?',
      answer: 'Safety is our top priority. All training is supervised by certified black belt instructors. We use age-appropriate techniques, proper protective equipment for sparring, and emphasize control at every level.',
    },
    {
      question: 'What is the belt grading process?',
      answer: 'Belt gradings are held every 3-4 months. Students are assessed on kata (forms), kumite (sparring), and theoretical knowledge. Each grading is conducted by senior Dan-graded examiners under WKF standards.',
    },
    {
      question: 'How much does it cost?',
      answer: 'We offer flexible monthly plans starting at ₹1,500/month. Visit our Fee page for detailed pricing, or contact us for a free trial class to experience SKF before committing.',
    },
  ],
})

/** Sensei Highlights for homepage */
export const SENSEI_HIGHLIGHTS = Object.freeze([
  {
    name: 'Sensei Irfan',
    title: 'Chief Instructor & Founder',
    dan: '4th Dan Black Belt',
    image: '/gallery/In Dojo 3.jpeg',
    achievement: 'WKF International Instructor',
  },
])
