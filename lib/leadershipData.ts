export interface Instructor {
    slug: string;
    name: string;
    title: string;
    dan?: string;
    rank?: string;
    branch?: string;
    specialty?: string;
    desc: string;
    fullBio: string;
    achievements: string[];
    image: string;
    isFounder?: boolean;
}

export const leadershipData: Instructor[] = [
    {
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
            'Coached multiple athletes to international gold medals'
        ],
        image: '/gallery/Koramangala 3.jpg',
        isFounder: true
    },
    {
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
            'Holds multiple national titles in Kata and Kumite'
        ],
        image: '/gallery/In Dojo.jpeg' 
    },
    {
        slug: 'someshekhar',
        name: 'Sensei Someshekhar',
        title: 'Vice President',
        dan: '4th Dan Black Belt',
        desc: 'Overseeing metropolitan branch operations and guiding the senior athlete development system for state-level dominance.',
        fullBio: 'Sensei Someshekhar serves as the Vice President of SKF Karate, bringing a profound tactical edge to the organization. He specializes in the rigorous development of senior athletes, preparing them for the physical and mental demands of state and national level tournaments. His meticulous approach to Kumite strategy has been instrumental in SKF\'s consistent dominance in the competition circuit.',
        achievements: [
            'Lead strategist for the Senior Athlete Competition Team',
            'Developed the advanced Kumite reaction-timing drills used by the elite roster',
            'Guided the team to 6 consecutive State Championship victories'
        ],
        image: '/gallery/Banneraghatta.jpeg'
    },
    {
        slug: 'rakesh',
        name: 'Sensei Rakesh',
        title: 'General Secretary',
        dan: '4th Dan Black Belt',
        desc: 'Coordinating high-level administrative affairs and leading advanced branch training at the Central Dojo.',
        fullBio: 'Balancing high-level administrative governance with on-the-mat excellence, Sensei Rakesh is the General Secretary of SKF Karate. He is the master orchestrator behind SKF\'s massive tournament events and grading cycles. On the mat, he is known for his lightning-fast mechanical breakdowns and advanced Kumite coaching at the Central Dojo.',
        achievements: [
            'Chief Organizer for the annual SKF National Invitational Tournament',
            'Manages all WKF, KIO, and AKSKA compliance and affiliations',
            'Lead technical instructor for the Central Headquarters Dojo'
        ],
        image: '/gallery/Student (5).jpeg'
    },
    {
        slug: 'latha',
        name: 'Latha',
        title: 'Treasurer',
        dan: '',
        desc: 'Managing vital financial governance and supporting the association\'s rapid infrastructure expansion.',
        fullBio: 'Latha is the backbone of SKF Karate\'s institutional stability. As Treasurer, she ensures absolute financial transparency and drives the resource allocation that allows the academy to open state-of-the-art facilities across Bengaluru. Her strategic governance guarantees that SKF can continually invest in world-class equipment and sponsorship for elite athletes.',
        achievements: [
            'Pioneered the transparent digital fee-tracking infrastructure',
            'Secured funding avenues for the Elite Athlete Sponsorship Program',
            'Facilitated the structural expansion to 3 massive dojo headquarters'
        ],
        image: '/gallery/In Dojo.jpeg'
    }
]
