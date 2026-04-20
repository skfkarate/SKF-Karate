import { BranchSlug } from '@/data/constants/branches'

/* ── SKF Karate Classes Data ── */
/* Central data source for all cities, branches, and class info */

export interface Branch {
    slug: BranchSlug
    name: string
    isHQ?: boolean
    city: string
    address: string
    phone: string
    whatsapp: string
    sensei: string
    senseiDan: string
    classDays: number[] // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    classTime: string
    mapUrl?: string
    photos: string[]
    description: string
}

export interface School {
    name: string
    city: string
}

export interface City {
    slug: string
    name: string
    state: string
    branches: Branch[]
    schools: School[]
    photo: string // group photo for city card
}

/* ── Cities & Branches ── */
export const cities: City[] = [
    {
        slug: 'bangalore',
        name: 'Bangalore',
        state: 'Karnataka',
        photo: '/gallery/In Dojo.jpeg',
        branches: [
            {
                slug: 'mp-sports-club',
                name: 'M P Sports Club',
                isHQ: true,
                city: 'bangalore',
                address: '35/4, MP SPORTS CLUB Mallathahalli Nagarbhavi, Ullal Junction, Kengeri Ring Road, MP Sports Club Rd, Jnananjyothinagar, Srirama Layout, Jnana Ganga Nagar, Bengaluru, Karnataka 560056',
                phone: '+91 90199 71726',
                whatsapp: '919019971726',
                sensei: 'Sensei Usha C',
                senseiDan: 'Black Belt',
                classDays: [2, 3, 5],
                classTime: '5:30 PM – 7:00 PM',
                mapUrl: 'https://maps.app.goo.gl/ZsgVX25nyK27oCZ17',
                photos: ['/gallery/In Dojo.jpeg'],
                description: 'The headquarters of SKF Karate. World-class WKF-approved tatami mats, elite conditioning equipment, and an atmosphere of pure discipline.',
            },
            {
                slug: 'herohalli',
                name: 'Herohalli',
                city: 'bangalore',
                address: 'BBMP SAMUDAYA BHAVANA, Herohalli, Tunganagara, Bengaluru, Karnataka 560091',
                phone: '+91 90199 71726',
                whatsapp: '919019971726',
                sensei: 'Sensei Krishna C',
                senseiDan: 'Black Belt',
                classDays: [2, 3, 5], // Tue, Wed, Fri
                classTime: '4:30 PM – 6:00 PM',
                mapUrl: 'https://maps.app.goo.gl/mQQhiQYSNR7bhQ3eA',
                photos: ['/gallery/In Dojo.jpeg'],
                description: 'A thriving SKF Karate branch bringing championship-level training to Herohalli.',
            },
        ],
        schools: [
            { name: 'Delhi Public School, Whitefield', city: 'bangalore' },
            { name: 'Kendriya Vidyalaya, Malleshwaram', city: 'bangalore' },
            { name: 'National Public School, Koramangala', city: 'bangalore' },
        ],
    },
    {
        slug: 'kunigal',
        name: 'Kunigal',
        state: 'Karnataka',
        photo: '/gallery/In Dojo.jpeg',
        branches: [
            {
                slug: 'kunigal-main',
                name: 'Kunigal',
                city: 'kunigal',
                address: 'Kunigal, Karnataka',
                phone: '+91 90199 71726',
                whatsapp: '919019971726',
                sensei: 'To be updated',
                senseiDan: 'Black Belt',
                classDays: [2, 3, 5],
                classTime: '5:00 PM – 6:30 PM',
                photos: ['/gallery/In Dojo.jpeg'],
                description: 'SKF Karate Kunigal branch. Details to be updated soon.',
            },
        ],
        schools: [],
    },
    {
        slug: 'tumkur',
        name: 'Tumkur',
        state: 'Karnataka',
        photo: '/gallery/In Dojo.jpeg',
        branches: [
            {
                slug: 'tumkur-main',
                name: 'Tumkur',
                city: 'tumkur',
                address: 'BH Road, Tumkur',
                phone: '+91 90199 71726',
                whatsapp: '919019971726',
                sensei: 'Sensei Arjun',
                senseiDan: '2nd Dan Black Belt',
                classDays: [2, 3, 5],
                classTime: '5:00 PM – 6:30 PM',
                photos: ['/gallery/In Dojo.jpeg'],
                description: 'Bringing WKF-standard karate training to Tumkur with certified instructors.',
            },
        ],
        schools: [],
    },
    {
        slug: 'udupi',
        name: 'Udupi',
        state: 'Karnataka',
        photo: '/gallery/In Dojo.jpeg',
        branches: [
            {
                slug: 'udupi-main',
                name: 'Udupi',
                city: 'udupi',
                address: 'Car Street, Udupi',
                phone: '+91 90199 71726',
                whatsapp: '919019971726',
                sensei: 'Sensei Karthik',
                senseiDan: '2nd Dan Black Belt',
                classDays: [2, 3, 5],
                classTime: '5:00 PM – 6:30 PM',
                photos: ['/gallery/In Dojo.jpeg'],
                description: 'SKF Karate\'s coastal presence, building champions in Udupi.',
            },
        ],
        schools: [],
    },
]

/* ── Helper functions ── */

export function getAllCities(): City[] {
    return cities
}

export function getCityBySlug(slug: string): City | undefined {
    return cities.find((c) => c.slug === slug)
}

export function getBranch(citySlug: string, branchSlug: string): Branch | undefined {
    const city = getCityBySlug(citySlug)
    if (!city) return undefined
    return city.branches.find((b) => b.slug === branchSlug)
}

export function getAllBranches(): Branch[] {
    return cities.flatMap((c) => c.branches)
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function formatClassDays(days: number[]): string {
    return days.map(d => DAY_NAMES[d]).join(', ')
}

export function formatClassDaysFull(days: number[]): string {
    return days.map(d => DAY_NAMES_FULL[d]).join(', ')
}

/**
 * Generate calendar data for a given month.
 * Returns array of weeks, each week is array of { date, isClassDay, isCurrentMonth }
 */
export function generateCalendar(year: number, month: number, classDays: number[]) {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDow = firstDay.getDay() // 0=Sun
    const daysInMonth = lastDay.getDate()

    const weeks: { date: number; isClassDay: boolean; isCurrentMonth: boolean; isToday: boolean }[][] = []
    let currentWeek: typeof weeks[0] = []

    const today = new Date()
    const isCurrentMonthYear = today.getFullYear() === year && today.getMonth() === month

    // Leading empty cells
    for (let i = 0; i < startDow; i++) {
        currentWeek.push({ date: 0, isClassDay: false, isCurrentMonth: false, isToday: false })
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dow = new Date(year, month, day).getDay()
        const isClassDay = classDays.includes(dow)
        const isToday = isCurrentMonthYear && today.getDate() === day

        currentWeek.push({ date: day, isClassDay, isCurrentMonth: true, isToday })

        if (currentWeek.length === 7) {
            weeks.push(currentWeek)
            currentWeek = []
        }
    }

    // Trailing empty cells
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push({ date: 0, isClassDay: false, isCurrentMonth: false, isToday: false })
        }
        weeks.push(currentWeek)
    }

    return weeks
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

export function getMonthName(month: number): string {
    return MONTH_NAMES[month]
}
