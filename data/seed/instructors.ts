/**
 * Seed: Instructors — Leadership team + dojo senseis
 * Every instructor record. Components import from here instead of local arrays.
 */

export interface Instructor {
  id: string
  slug: string
  name: string
  title: string
  dan: string
  rank?: string
  branch?: string
  specialty?: string
  role?: string
  dojos?: string
  dojoSlug?: string
  experience?: string
  desc: string
  fullBio: string
  achievements: string[]
  quote?: string
  image: string
  isFounder?: boolean
  isExecutiveCommittee: boolean
  isSensei: boolean
  color?: 'gold' | 'crimson' | 'blue'
}

export const instructors: Instructor[] = [
  // ══════ EXECUTIVE COMMITTEE ══════
  {
    id: 'ins_001',
    slug: 'channegowda',
    name: 'Renshi Dr. Channegowda UC',
    title: 'Founder & Technical Director',
    dan: '7th Dan Black Belt',
    desc: 'The ultimate visionary behind SKF Karate, bringing decades of elite pedagogical experience to forge global champions and structure the entire curriculum.',
    fullBio: 'Renshi Dr. Channegowda UC founded SKF Karate with a singular vision: to establish an institution of martial arts excellence guided by authentic WKF standards. Over the decades, his pedagogical strategies have transformed raw talent into international champions. He actively oversees the curriculum architecture for all branches and leads exclusive high-dan grading ceremonies. His dedication to martial arts extends beyond the tatami, focusing on forging resilient, disciplined individuals capable of excelling in every aspect of life.',
    achievements: [
      'Founded SKF Karate in 2011',
      'Awarded 7th Dan Black Belt for lifetime technical mastery',
      'Structured the WKF-standardized grading syllabus across all SKF branches',
      'Coached multiple athletes to international gold medals',
    ],
    quote: 'Our singular mission is to build highly resilient, confident athletes equipped completely for the real world.',
    image: '/gallery/Koramangala 3.jpg',
    isFounder: true,
    isExecutiveCommittee: true,
    isSensei: false,
    color: 'gold',
  },
  {
    id: 'ins_002',
    slug: 'usha',
    name: 'Sensei Usha C',
    title: 'President, SKF Karate',
    dan: '4th Dan Black Belt',
    desc: 'Leading SKF Karate with over 10 years of teaching experience, specializing in self-defense, fitness karate, and elite competitor preparation.',
    fullBio: 'As President of SKF Karate, Sensei Usha C is a pivotal force in the day-to-day operations and strategic expansion of the academy. With over a decade of dedicated teaching experience, she has personally trained and mentored over 500 athletes across three branches. Her specialization lies in tactical self-defense mapping, elite fitness conditioning, and traditional weaponry (Nunchaku). Her leadership ensures that every dojo meets the rigorous standards of SKF.',
    achievements: [
      'Personally trained 500+ active athletes',
      'Spearheaded the integration of tactical self-defense into the modern curriculum',
      'Oversees operations and standards across all Bengaluru branches',
      'Holds multiple national titles in Kata and Kumite',
    ],
    image: '/gallery/In Dojo.jpeg',
    isExecutiveCommittee: true,
    isSensei: false,
  },
  {
    id: 'ins_003',
    slug: 'someshekhar',
    name: 'Sensei Someshekhar',
    title: 'Vice President',
    dan: '4th Dan Black Belt',
    desc: 'Overseeing metropolitan branch operations and guiding the senior athlete development system for state-level dominance.',
    fullBio: "Sensei Someshekhar serves as the Vice President of SKF Karate, bringing a profound tactical edge to the organization. He specializes in the rigorous development of senior athletes, preparing them for the physical and mental demands of state and national level tournaments. His meticulous approach to Kumite strategy has been instrumental in SKF's consistent dominance in the competition circuit.",
    achievements: [
      'Lead strategist for the Senior Athlete Competition Team',
      'Developed the advanced Kumite reaction-timing drills used by the elite roster',
      'Guided the team to 6 consecutive State Championship victories',
    ],
    image: '/gallery/Banneraghatta.jpeg',
    isExecutiveCommittee: true,
    isSensei: false,
  },
  {
    id: 'ins_004',
    slug: 'rakesh',
    name: 'Sensei Rakesh',
    title: 'General Secretary',
    dan: '4th Dan Black Belt',
    desc: 'Coordinating high-level administrative affairs and leading advanced branch training at the Central Dojo.',
    fullBio: "Balancing high-level administrative governance with on-the-mat excellence, Sensei Rakesh is the General Secretary of SKF Karate. He is the master orchestrator behind SKF's massive tournament events and grading cycles. On the mat, he is known for his lightning-fast mechanical breakdowns and advanced Kumite coaching at the Central Dojo.",
    achievements: [
      'Chief Organizer for the annual SKF National Invitational Tournament',
      'Manages all WKF, KIO, and AKSKA compliance and affiliations',
      'Lead technical instructor for the Central Headquarters Dojo',
    ],
    image: '/gallery/Student (5).jpeg',
    isExecutiveCommittee: true,
    isSensei: false,
  },
  {
    id: 'ins_005',
    slug: 'latha',
    name: 'Latha',
    title: 'Treasurer',
    dan: '',
    desc: "Managing vital financial governance and supporting the association's rapid infrastructure expansion.",
    fullBio: "Latha is the backbone of SKF Karate's institutional stability. As Treasurer, she ensures absolute financial transparency and drives the resource allocation that allows the academy to open state-of-the-art facilities across Bengaluru. Her strategic governance guarantees that SKF can continually invest in world-class equipment and sponsorship for elite athletes.",
    achievements: [
      'Pioneered the transparent digital fee-tracking infrastructure',
      'Secured funding avenues for the Elite Athlete Sponsorship Program',
      'Facilitated the structural expansion to 3 massive dojo headquarters',
    ],
    image: '/gallery/In Dojo.jpeg',
    isExecutiveCommittee: true,
    isSensei: false,
  },

  // ══════ DOJO SENSEIS ══════
  {
    id: 'ins_006',
    slug: 'akira',
    name: 'Sensei Akira',
    title: 'Chief Instructor & Founder',
    dan: '5th Dan — Godan',
    specialty: 'Kata & Kumite Mastery',
    role: 'Chief Instructor & Founder',
    dojos: 'SKF Headquarters',
    dojoSlug: 'koramangala',
    experience: '20+ years of relentless dedication',
    desc: 'Chief Instructor with over 20 years of relentless dedication to Kata and Kumite mastery.',
    fullBio: 'Sensei Akira is the heart and soul of SKF Karate on the mat. With over 20 years of competitive and coaching experience, he has shaped the technical foundation that every SKF athlete inherits.',
    achievements: [
      'National Champion (3x)',
      'State Kata Champion',
      'WKF-certified Elite Coach',
    ],
    quote: 'True mastery is not found in the defeat of an opponent, but in the perfection of the self through tireless discipline.',
    image: '/gallery/In Dojo.jpeg',
    isExecutiveCommittee: false,
    isSensei: true,
    color: 'gold',
  },
  {
    id: 'ins_007',
    slug: 'ravi',
    name: 'Sensei Ravi',
    title: 'Senior Instructor',
    dan: '4th Dan — Yondan',
    specialty: 'Advanced Kumite',
    role: 'Senior Instructor',
    dojos: 'Central Dojo',
    dojoSlug: 'central',
    experience: '15+ years',
    desc: 'Senior Instructor specializing in advanced Kumite strategy and competition coaching.',
    fullBio: 'Sensei Ravi is the tactical mastermind behind SKF\'s competition success. His 15+ years of Kumite specialization have forged multiple state and national champions.',
    achievements: [
      'State Kumite Champion (5x)',
      'National Team Coach',
      'Elite Tactic Specialist',
    ],
    quote: 'The mat is a mirror. It reflects your fears, but more importantly, it shows you the warrior you can become.',
    image: '/gallery/In Dojo.jpeg',
    isExecutiveCommittee: false,
    isSensei: true,
    color: 'crimson',
  },
  {
    id: 'ins_008',
    slug: 'meera',
    name: 'Sensei Meera',
    title: 'Instructor',
    dan: '3rd Dan — Sandan',
    specialty: 'Technical Kata',
    role: 'Instructor',
    dojos: 'East District Dojo',
    dojoSlug: 'east',
    experience: '12+ years',
    desc: 'Instructor known for technical Kata precision and form correction.',
    fullBio: 'Sensei Meera brings 12+ years of technical Kata mastery, with a focus on precision and form that has earned her multiple state titles.',
    achievements: [
      'State Kata Champion (2x)',
      'Certified Kata Judge',
      'Form Correction Expert',
    ],
    quote: 'Every form contains a thousand battles. Precision is the ultimate weapon against chaos.',
    image: '/gallery/In Dojo.jpeg',
    isExecutiveCommittee: false,
    isSensei: true,
    color: 'blue',
  },
  {
    id: 'ins_009',
    slug: 'arjun',
    name: 'Sensei Arjun',
    title: 'Instructor',
    dan: '3rd Dan — Sandan',
    specialty: 'Kumite & Self-Defence',
    role: 'Instructor',
    dojos: 'North District Dojo',
    dojoSlug: 'north',
    experience: '10+ years',
    desc: 'Instructor focusing on Kumite and self-defence for real-world situations.',
    fullBio: 'Sensei Arjun has dedicated 10+ years to making Kumite and self-defence practically applicable in real-world scenarios.',
    achievements: [
      'National Kumite Bronze',
      'Self-Defence Program Director',
      'Street-Ready Tactical Lead',
    ],
    quote: 'We train for the fights we never wish to have. Preparedness brings peace.',
    image: '/gallery/In Dojo.jpeg',
    isExecutiveCommittee: false,
    isSensei: true,
    color: 'gold',
  },
  {
    id: 'ins_010',
    slug: 'priya',
    name: 'Sensei Priya',
    title: 'Assistant Instructor',
    dan: '2nd Dan — Nidan',
    specialty: 'Junior Training',
    role: 'Assistant Instructor',
    dojos: 'SKF Headquarters',
    dojoSlug: 'koramangala',
    experience: '8+ years',
    desc: 'Assistant Instructor specializing in child development and junior karate.',
    fullBio: 'Sensei Priya is a specialist in junior karate development with 8+ years of experience, combining child psychology with martial arts pedagogy.',
    achievements: [
      'Junior Development Lead',
      'State Medalist',
      'Child Psychology inside the Dojo',
    ],
    quote: "The hardest belt to earn is the white belt. My duty is to turn that first step into a lifelong journey.",
    image: '/gallery/In Dojo.jpeg',
    isExecutiveCommittee: false,
    isSensei: true,
    color: 'crimson',
  },
  {
    id: 'ins_011',
    slug: 'karthik',
    name: 'Sensei Karthik',
    title: 'Assistant Instructor',
    dan: '2nd Dan — Nidan',
    specialty: 'Fitness Conditioning',
    role: 'Assistant Instructor',
    dojos: 'South District Dojo',
    dojoSlug: 'south',
    experience: '7+ years',
    desc: 'Assistant Instructor focusing on fitness conditioning, agility and core strength.',
    fullBio: 'Sensei Karthik brings 7+ years of conditioning expertise, forging athlete bodies to withstand the rigors of competition.',
    achievements: [
      'Conditioning Specialist',
      'Core Strengthening',
      'Agility & Reflex Mastery',
    ],
    quote: "Fatigue makes cowards of us all. I forge bodies so the spirit never has to surrender.",
    image: '/gallery/In Dojo.jpeg',
    isExecutiveCommittee: false,
    isSensei: true,
    color: 'blue',
  },
]

/* ── Helpers ── */
export function getInstructorBySlug(slug: string) {
  return instructors.find(i => i.slug === slug) ?? null
}

export function getExecutiveCommittee() {
  return instructors.filter(i => i.isExecutiveCommittee)
}

export function getSenseis() {
  return instructors.filter(i => i.isSensei)
}

export function getFounder() {
  return instructors.find(i => i.isFounder) ?? instructors[0]
}

/** Map branch name → coach name (for athlete profiles) */
export const BRANCH_COACHES: Record<string, string> = Object.fromEntries(
  instructors
    .filter(i => i.isSensei && i.dojoSlug)
    .map(i => [i.dojos || '', i.name])
)
