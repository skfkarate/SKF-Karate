export type SeedBlogPost = {
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  coverImageUrl: string
  isFeatured: boolean
  readMinutes: number
  sortOrder: number
  authorName: string
  publishedAt: string
}

function body(paragraphs: string[]) {
  return paragraphs.join('\n\n')
}

export const SEEDED_BLOG_POSTS: SeedBlogPost[] = [
  {
    slug: 'how-to-start-karate',
    title: 'How to Start Karate',
    excerpt:
      'The practical first step is simpler than most beginners think: walk into a good dojo, watch the room, and start.',
    category: 'Getting Started',
    tags: ['beginner', 'dojo', 'first class'],
    coverImageUrl: '',
    isFeatured: true,
    readMinutes: 3,
    sortOrder: 1,
    authorName: 'SKF Karate',
    publishedAt: '2026-05-03T00:00:00.000Z',
    content: body([
      "Stop overthinking it. That's the real answer.",
      "Most people spend weeks researching dojos, watching YouTube videos, comparing styles, and never actually walk through a door. Here's what actually matters when you're starting out:",
      'Find a dojo that feels right when you walk in. Not the cheapest one, not the one with the most trophies on the wall, but the one where the instructor looks at students like they matter. Watch a class before you join. If the instructor is screaming at beginners or the senior students look arrogant, leave. A good dojo has a certain energy you will feel immediately.',
      "You don't need to be fit to start. You don't need flexibility. You don't need any prior experience. You show up in whatever comfortable clothes you have, you bow when everyone bows, you try what you're shown, and you don't quit after the first week because it felt awkward. It will feel awkward. That's the whole point.",
      "Karate doesn't ask you to be ready. It makes you ready.",
    ]),
  },
  {
    slug: 'how-long-to-get-black-belt-karate',
    title: 'How Long Does It Take to Get a Black Belt in Karate?',
    excerpt:
      'Most students need years of steady training, but the belt is only the start of serious learning.',
    category: 'Belt Journey',
    tags: ['black belt', 'grading', 'training'],
    coverImageUrl: '',
    isFeatured: true,
    readMinutes: 3,
    sortOrder: 2,
    authorName: 'SKF Karate',
    publishedAt: '2026-05-03T00:00:00.000Z',
    content: body([
      "Here's the truth nobody really wants to hear: the belt isn't the destination. But since you asked, let's talk honestly.",
      'In most traditional styles, reaching a black belt takes anywhere from 3 to 6 years of consistent training, typically 2 to 3 classes a week. Some styles take longer. Some people get there faster. A lot depends on your dojo, your effort, and how seriously you treat each class.',
      "But here's what changes everything: a black belt doesn't mean you have mastered karate. It means you have finally learned enough to start learning properly. Every serious black belt will tell you this. The real journey begins at first dan, not ends there.",
      'The students who focus obsessively on when they get their black belt almost always plateau. The ones who focus on understanding each technique deeply are the ones who quietly become exceptional.',
      'Train for the knowledge. The belt will follow.',
    ]),
  },
  {
    slug: 'best-age-to-start-karate',
    title: 'What Is the Best Age to Start Karate?',
    excerpt:
      'Karate can shape children early, steady teenagers, and give adults a disciplined way to keep learning.',
    category: 'Children & Adults',
    tags: ['kids karate', 'adult karate', 'age'],
    coverImageUrl: '',
    isFeatured: false,
    readMinutes: 3,
    sortOrder: 3,
    authorName: 'SKF Karate',
    publishedAt: '2026-05-03T00:00:00.000Z',
    content: body([
      'The best age is whatever age you are right now.',
      "That said, if you are asking about children, the sweet spot is around 5 to 7 years old. Not because they will become better fighters, but because karate at that age is shaping how a child thinks. Discipline, focus, respect, the ability to lose without falling apart and win without showing off: these are life skills, and karate plants them early.",
      "For teenagers, karate offers something rare: a space where phones don't exist, where effort is visibly rewarded, and where your body starts doing things you didn't think were possible. That's powerful at an age when confidence is everything.",
      'For adults in their 30s, 40s, 50s and beyond, karate is one of the few martial arts where your mind genuinely compensates for physical limitations. Timing, reading an opponent, and body mechanics are learnable at any age, and they matter more than raw athleticism.',
      "There are students around the world who have earned black belts late in life. Age asked for permission. They didn't give it.",
    ]),
  },
  {
    slug: 'how-many-belts-are-in-karate',
    title: 'How Many Belts Are in Karate?',
    excerpt:
      'Most systems use kyu grades before black belt and dan grades after it, but the belt is only a map.',
    category: 'Belt Journey',
    tags: ['belts', 'kyu', 'dan'],
    coverImageUrl: '',
    isFeatured: false,
    readMinutes: 3,
    sortOrder: 4,
    authorName: 'SKF Karate',
    publishedAt: '2026-05-03T00:00:00.000Z',
    content: body([
      "This depends on the style and the organization, so let's clear the confusion once and for all.",
      'Most traditional karate systems have around 8 to 10 colored belts before black belt, called kyu grades. These typically go from white belt through yellow, orange, green, blue, purple, brown, and then black. Some styles add stripes or additional colors in between.',
      'After black belt, there are 10 dan degree levels. Most practitioners spend their entire lives between 1st and 5th dan. 9th and 10th dan are exceptionally rare, reserved for those who have dedicated decades to the art and contributed enormously to its growth.',
      "The belt system was introduced relatively recently in martial arts history. Judo's founder Jigoro Kano introduced it in the late 1800s, and karate adopted it afterward. Before that, karate had no belts at all. The knowledge was simply passed from person to person.",
      'So the belt is a map, not the territory.',
    ]),
  },
  {
    slug: 'what-does-skf-stand-for-in-karate',
    title: 'What Does SKF Stand for in Karate?',
    excerpt:
      'SKF Karate represents Sports Karate-do Fitness & Self Defence Association, built around karate training, fitness, and discipline.',
    category: 'About SKF',
    tags: ['SKF', 'association', 'shotokan'],
    coverImageUrl: '',
    isFeatured: true,
    readMinutes: 3,
    sortOrder: 5,
    authorName: 'SKF Karate',
    publishedAt: '2026-05-03T00:00:00.000Z',
    content: body([
      'SKF stands for Sports Karate-do Fitness & Self Defence Association, the organization behind SKF Karate.',
      'The purpose of SKF is to promote karate as a complete discipline: technical training, fitness, self-defence awareness, character development, and competitive growth. A strong association gives students a clear path from beginner classes to grading, seminars, camps, tournaments, and public achievement.',
      'Organizations like SKF exist to maintain training standards. They help standardize grading expectations, organize events, support instructors, and create a structure where students across different branches can grow under one shared system.',
      "If your dojo is affiliated with SKF, you are not training in isolation. You are part of a wider training network where progress, records, certificates, events, and athlete profiles can connect back to the same student journey. That's not a small thing.",
    ]),
  },
  {
    slug: 'is-karate-good-for-children',
    title: 'Is Karate Good for Children?',
    excerpt:
      'Karate improves fitness, but its deeper value is how children learn effort, respect, and resilience.',
    category: 'Children & Adults',
    tags: ['children', 'parents', 'discipline'],
    coverImageUrl: '',
    isFeatured: false,
    readMinutes: 4,
    sortOrder: 6,
    authorName: 'SKF Karate',
    publishedAt: '2026-05-03T00:00:00.000Z',
    content: body([
      'It might be one of the best things you ever enroll them in, and not for the reason most parents think.',
      "Yes, karate improves fitness, coordination, and self-defense awareness. But the real value is invisible on the surface. Children who train in karate consistently develop a relationship with effort that most adults are still trying to figure out. They learn that progress isn't instant, that frustration is part of the process, and that showing up on a hard day is more important than showing up when it is easy.",
      "They also learn respect, genuine respect, not the performative kind. Bowing to a senior isn't about submission. It is about acknowledging that someone knows something you don't, and being willing to learn from them. That's a mindset that serves children in school, in friendships, and eventually in their careers.",
      "Children who are shy often find their voice in a dojo. Children who are unfocused often find their stillness. Children who feel overlooked often find that their effort is seen and celebrated here, in a way it sometimes isn't elsewhere.",
      "Karate doesn't raise fighters. It raises people.",
    ]),
  },
  {
    slug: 'can-adults-learn-karate',
    title: 'Can Adults Learn Karate?',
    excerpt:
      'Adults can learn karate well because they can understand the why behind movement, timing, and discipline.',
    category: 'Children & Adults',
    tags: ['adults', 'fitness', 'beginner'],
    coverImageUrl: '',
    isFeatured: false,
    readMinutes: 3,
    sortOrder: 7,
    authorName: 'SKF Karate',
    publishedAt: '2026-05-03T00:00:00.000Z',
    content: body([
      "Absolutely. And in some ways, adults have advantages that children don't.",
      'Adults can understand the why behind every movement. When an instructor explains the body mechanics of a reverse punch, or the strategy behind a particular defensive stance, adults can absorb and apply that understanding in ways that take children years to develop.',
      "What adults struggle with is mostly ego. Starting something as a beginner, standing in a white belt next to a teenager who is already a green belt, requires genuine humility. That's the first real test of adult karate training. Pass that test, and everything else becomes learnable.",
      'Physically, yes, flexibility and recovery take more work as we age. But karate is remarkably adaptable. Good instructors train the person in front of them, not a textbook version of what a karateka should look like. Technique, timing, and awareness do not expire with age.',
      "Some of the most precise karateka in the world are in their 50s and 60s. They are not faster than a 25-year-old. They don't need to be.",
    ]),
  },
  {
    slug: 'what-is-kata-in-karate',
    title: 'What Is Kata in Karate?',
    excerpt:
      'Kata is the stored knowledge of karate: a solo form where technique, application, and history meet.',
    category: 'Training',
    tags: ['kata', 'bunkai', 'technique'],
    coverImageUrl: '',
    isFeatured: false,
    readMinutes: 4,
    sortOrder: 8,
    authorName: 'SKF Karate',
    publishedAt: '2026-05-03T00:00:00.000Z',
    content: body([
      'Kata is the soul of karate. Everything else, the sparring, the conditioning, the breaking, is the body. Kata is what lives underneath.',
      'A kata is a sequence of pre-arranged techniques performed alone: attacks, blocks, strikes, stances, turns, all woven together into a kind of moving meditation. There are no opponents. There are no points. Just you and the form.',
      'On the surface, kata looks like choreography. But each movement contains a practical application, called bunkai, that reveals itself only with time and deep study. A block in a kata might actually be a joint lock. A step might be a throw setup. The applications were deliberately embedded, layer upon layer, by the masters who created these forms centuries ago.',
      'This is why kata are not just performance pieces for competition. They are textbooks. They are libraries. A single kata, studied properly, can take a lifetime to truly understand.',
      "When you watch a master perform kata, you are not watching a demonstration. You are watching a conversation with history.",
    ]),
  },
  {
    slug: 'what-is-kumite-in-karate',
    title: 'What Is Kumite in Karate?',
    excerpt:
      'Kumite is sparring: the place where timing, distance, calmness, and adaptability are tested.',
    category: 'Training',
    tags: ['kumite', 'sparring', 'competition'],
    coverImageUrl: '',
    isFeatured: false,
    readMinutes: 3,
    sortOrder: 9,
    authorName: 'SKF Karate',
    publishedAt: '2026-05-03T00:00:00.000Z',
    content: body([
      'If kata is the soul, kumite is the heartbeat.',
      'Kumite means sparring, the practice of applying your techniques against a real, moving, reacting human being. It is where everything you have trained in isolation gets tested in the chaos of real interaction.',
      'There are different forms of kumite. Beginners start with controlled, pre-arranged sparring. You know exactly what attack is coming and practice the correct response. As you progress, sparring becomes freer, more spontaneous, eventually reaching jiyu kumite, free sparring, where anything within the rules of your dojo or competition can happen.',
      "Kumite teaches something kata cannot: adaptability. An opponent doesn't move the way a textbook says they will. They are unpredictable, different in size and speed and style. Learning to stay calm, read the situation, and respond cleanly under pressure is what kumite builds.",
      "Good kumite isn't about aggression. The best sparrers are often the most relaxed people in the room. They are not reacting. They are already one step ahead.",
    ]),
  },
  {
    slug: 'how-to-tie-a-karate-belt',
    title: 'How to Tie a Karate Belt',
    excerpt:
      'A clean belt knot is simple, centered, and intentional. It is one of the first habits a student learns.',
    category: 'Dojo Basics',
    tags: ['belt', 'uniform', 'dojo etiquette'],
    coverImageUrl: '',
    isFeatured: false,
    readMinutes: 3,
    sortOrder: 10,
    authorName: 'SKF Karate',
    publishedAt: '2026-05-03T00:00:00.000Z',
    content: body([
      'This is one of those things that seems complicated and then becomes second nature. Here is the clearest way to do it:',
      'Hold the middle of the belt against your stomach, just below your navel. Wrap both ends around your back and bring them to the front. Cross the right end over the left and pull it up through the gap between the belt and your body, so both ends are pointing down evenly.',
      'Now take the top end, fold it over the bottom end, then tuck it up and through the loop you have just created, like tying a flat knot. Pull both ends firmly until the knot is tight and sitting flat against your body. Both ends should hang at roughly equal length.',
      'The belt should sit centered, flat, and secure: not too tight, not loose enough to unravel during training.',
      'A small detail most beginners miss: the knot should never hang lopsided or twisted. In many dojos, how you wear your belt reflects how seriously you take your training. It is the first thing you put on. Tie it with intention.',
    ]),
  },
  {
    slug: 'what-to-wear-to-karate-class',
    title: 'What to Wear to Karate Class',
    excerpt:
      'Start in comfortable athletic wear, then move to a clean, well-fitted gi when you commit.',
    category: 'Dojo Basics',
    tags: ['gi', 'uniform', 'first class'],
    coverImageUrl: '',
    isFeatured: false,
    readMinutes: 3,
    sortOrder: 11,
    authorName: 'SKF Karate',
    publishedAt: '2026-05-03T00:00:00.000Z',
    content: body([
      'For your very first class, comfortable athletic wear is fine. Loose track pants, a plain t-shirt, bare feet. You do not need to buy anything before you have decided this is for you.',
      'Once you are committed, you will wear a gi, the traditional karate uniform. A gi consists of a jacket, pants, and your belt. It is designed to be durable, allow full range of movement, and withstand the grabbing, pulling, and sweating that comes with training.',
      "When buying your first gi, don't overspend on the most expensive one. A clean, well-fitted mid-range gi will serve you well for years. What matters more is that it is the right size: not too baggy that it gets in the way, not too tight that it restricts movement.",
      'Keep it clean. This sounds obvious, but in many traditional dojos, a dirty or crumpled gi is considered disrespectful to your training partners, to the dojo, and to the art. Wash it after every session. Never wear shoes on the mat.',
      'How you present yourself in the dojo is part of the training.',
    ]),
  },
  {
    slug: 'how-much-do-karate-classes-cost',
    title: 'How Much Do Karate Classes Cost?',
    excerpt:
      'In India, karate remains one of the most cost-effective martial arts to train consistently.',
    category: 'Costs',
    tags: ['fees', 'india', 'classes'],
    coverImageUrl: '',
    isFeatured: false,
    readMinutes: 4,
    sortOrder: 12,
    authorName: 'SKF Karate',
    publishedAt: '2026-05-03T00:00:00.000Z',
    content: body([
      "In India, karate classes typically range from Rs. 500 to Rs. 2,500 per month, depending on the city, the instructor's credentials, the dojo's facilities, and whether it is a private academy or a community-based program.",
      "In metro cities like Bengaluru, Mumbai, or Delhi, you will find academies at the higher end of that range, particularly those affiliated with recognized national or international bodies. In smaller towns, community classes through sports associations or school programs can be significantly more affordable.",
      'Beyond monthly fees, factor in the cost of a gi, usually Rs. 800 to Rs. 2,500 for a decent beginner uniform, grading fees when you test for a new belt, and occasional training camps or tournament fees if you go competitive.',
      'The honest truth: karate is one of the most cost-effective martial arts you can train in. No expensive equipment. No gym membership. No ongoing gear purchases. Your body, your gi, and your commitment are what it takes.',
      'What you put in will always cost more than what you pay.',
    ]),
  },
  {
    slug: 'is-karate-a-good-workout',
    title: 'Is Karate a Good Workout?',
    excerpt:
      'Karate trains strength, endurance, flexibility, coordination, decision-making, and composure together.',
    category: 'Fitness',
    tags: ['workout', 'fitness', 'conditioning'],
    coverImageUrl: '',
    isFeatured: false,
    readMinutes: 4,
    sortOrder: 13,
    authorName: 'SKF Karate',
    publishedAt: '2026-05-03T00:00:00.000Z',
    content: body([
      "It is one of the most complete workouts you will find, and most people don't realize it until they are drenched in sweat twenty minutes into their first class.",
      'A typical karate session works your cardiovascular system, builds functional strength, sharpens coordination, and dramatically improves flexibility all at once. You are not isolating muscles on a machine. You are using your entire body as one connected system.',
      'The repetition of punches and kicks builds shoulder, core, and leg endurance in ways that gym routines rarely replicate. Stances like kiba-dachi, horse stance, held for extended periods will challenge your legs more than most leg-day workouts. Free sparring gets your heart rate into zones that rival high-intensity interval training.',
      'But what separates karate from a gym session is that you are also mentally working out. Reading an opponent, making split-second decisions, staying focused during an exhausting drill: your brain is being trained alongside your body. That dual engagement is something a treadmill will never give you.',
      "People who train consistently for six months don't just look different. They move differently. They react differently. They carry themselves differently.",
      "That's not a workout. That's a transformation.",
    ]),
  },
]
