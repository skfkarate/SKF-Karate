export const allDojos = [
    { 
        id: 'koramangala',
        slug: 'koramangala',
        name: 'SKF Headquarters Dojo', 
        sensei: 'Sensei Akira', 
        senseiId: 'akira',
        address: '14/1, 2nd Main Rd, M P M Layout, Mallathahalli, Bengaluru 560056', 
        phone: '+91 90199 71726', 
        timings: 'Mon-Sat: 6:00 AM - 8:00 PM', 
        ages: ['Junior', 'Cadet', 'Senior'],
        color: 'gold',
        desc: 'The beating heart of our association. The SKF Headquarters is where champions are forged under the direct supervision of our Chief Instructor. Equipped with world-class WKF-approved tatami mats, elite conditioning equipment, and an atmosphere of pure discipline.'
    },
    { 
        id: 'central', 
        slug: 'central',
        name: 'Central Dojo', 
        sensei: 'Sensei Ravi', 
        senseiId: 'ravi',
        address: 'Central Avenue, Downtown', 
        phone: '+91 000-000-0002', 
        timings: 'Mon-Sat: 6:30 AM - 7 PM', 
        ages: ['Junior', 'Cadet', 'Senior'], 
        color: 'crimson',
        desc: 'A central hub for martial arts excellence focusing on advanced Kumite and tournament preparation.'
    },
    { 
        id: 'east', 
        slug: 'east',
        name: 'East District Dojo', 
        sensei: 'Sensei Meera', 
        senseiId: 'meera',
        address: 'East District, Sector 12', 
        phone: '+91 000-000-0003', 
        timings: 'Mon-Fri: 5:30 AM - 6:30 PM', 
        ages: ['Junior', 'Cadet'], 
        color: 'blue',
        desc: 'Specialized in technical Kata and form correction. A peaceful environment for perfecting every movement.'
    },
    { 
        id: 'north', 
        slug: 'north',
        name: 'North District Dojo', 
        sensei: 'Sensei Arjun', 
        senseiId: 'arjun',
        address: 'North District, Block B', 
        phone: '+91 000-000-0004', 
        timings: 'Mon-Sat: 6 AM - 7 PM', 
        ages: ['Cadet', 'Senior'], 
        color: 'gold',
        desc: 'The center for street-ready tactical self-defence and intense physical conditioning.'
    },
    { 
        id: 'west', 
        slug: 'west',
        name: 'West District Dojo', 
        sensei: 'Sensei Ravi', 
        senseiId: 'ravi',
        address: 'West District, MG Road', 
        phone: '+91 000-000-0005', 
        timings: 'Tue-Sun: 6 AM - 6 PM', 
        ages: ['Junior', 'Cadet', 'Senior'], 
        color: 'crimson',
        desc: 'An all-round facility offering both traditional Kata and competitive Kumite modules.'
    },
    { 
        id: 'south', 
        slug: 'south',
        name: 'South District Dojo', 
        sensei: 'Sensei Karthik', 
        senseiId: 'karthik',
        address: 'South District, Ring Road', 
        phone: '+91 000-000-0006', 
        timings: 'Mon-Sat: 5:30 AM - 7 PM', 
        ages: ['Junior', 'Cadet'], 
        color: 'blue',
        desc: 'Renowned for fitness conditioning, core strengthening, and agility mastery.'
    },
    {
        id: 'whitefield',
        slug: 'whitefield',
        name: 'Whitefield Dojo',
        sensei: 'Sensei Akira',
        senseiId: 'akira',
        address: 'Whitefield Main Road',
        phone: '+91 000-000-0007',
        timings: 'Mon-Sat: 6 AM - 8 PM',
        ages: ['Junior', 'Cadet', 'Senior'],
        color: 'gold',
        desc: 'Premium branch catering to the tech community with flexible training hours.'
    },
    {
        id: 'jp-nagar',
        slug: 'jp-nagar',
        name: 'JP Nagar Dojo',
        sensei: 'Sensei Ravi',
        senseiId: 'ravi',
        address: 'JP Nagar Phase 1',
        phone: '+91 000-000-0008',
        timings: 'Mon-Sat: 6 AM - 8 PM',
        ages: ['Junior', 'Cadet', 'Senior'],
        color: 'crimson',
        desc: 'Vibrant neighborhood dojo focusing on youth development and senior technical drills.'
    }
];

export function getDojoBySlug(slug: string) {
    return allDojos.find(d => d.slug === slug);
}
