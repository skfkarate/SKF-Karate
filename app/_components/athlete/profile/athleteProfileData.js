const DEFAULT_PROFILE_PHOTO = 'https://www.sportdata.org/wkf/competitor_pics/3561.jpg'
const DEFAULT_COUNTRY_FLAG = 'https://www.wkf.net/Assets/flags/IND.webp'

const BRANCH_COACHES = {
  Sunkadakatte: 'Sensei Rajesh Kumar',
  Rajajinagar: 'Sensei Arvind Kumar',
  Malleshwaram: 'Sensei Deepa Natarajan',
  Yeshwanthpur: 'Sensei Priya Sharma',
  Vijayanagar: 'Sensei Sanjay Bhat',
}

const nextEvents = [
  {
    dateRange: '10 - 12 April 2026',
    name: 'Karate One Premier League - Leshan 2026 (CHN)',
    flag: 'https://www.wkf.net/Assets/flags/CHN.webp',
  },
  {
    dateRange: '25 - 27 May 2026',
    name: 'SKF National Championship - Mumbai 2026 (IND)',
    flag: 'https://www.wkf.net/Assets/flags/IND.webp',
  },
]

const categories = [
  {
    name: 'Female Kata',
    isPrimary: true,
    rank: 1,
    points: 8895,
    totalPoints: 40183,
    honours: [
      { gold: 8, silver: 10, bronze: 15, name: 'Karate One Premier League' },
      { gold: 3, silver: 3, bronze: 2, name: 'Continental Championships' },
      { gold: 1, silver: 1, bronze: 2, name: 'World Championships' },
      { gold: 1, silver: 0, bronze: 4, name: 'Karate One Series A' },
    ],
    results: [
      { date: '2026-03-13', event: 'Karate One Premier League - Rome 2026 (ITA)', flag: 'https://www.wkf.net/Assets/flags/ITA.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 1, wins: 3, points: 990, actual: 990 },
      { date: '2026-01-23', event: 'Karate One Premier League - Istanbul 2026 (TUR)', flag: 'https://www.wkf.net/Assets/flags/TUR.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 1, wins: 3, points: 990, actual: 990 },
      { date: '2025-11-27', event: 'Karate World Championships - Cairo 2025 (EGY)', flag: 'https://www.wkf.net/Assets/flags/EGY.webp', type: 'World Championships', category: 'Female Kata', factor: 12, hasView: true, rank: 1, wins: 4, points: 2100, actual: 2100 },
      { date: '2025-05-30', event: 'Karate1 Premier League - Rabat 2025 (MAR)', flag: 'https://www.wkf.net/Assets/flags/MAR.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 1, wins: 3, points: 990, actual: 990 },
      { date: '2025-05-23', event: 'THE 21ST ASIAN SENIOR CHAMPIONSHIP 2025 (UZB)', flag: 'https://www.wkf.net/Assets/flags/UZB.webp', type: 'Continental Championships', category: 'Female Kata', factor: 6, hasView: true, rank: 1, wins: 5, points: 930, actual: 930 },
      { date: '2025-04-18', event: 'Karate1 Premier League - Cairo 2025 (EGY)', flag: 'https://www.wkf.net/Assets/flags/EGY.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 1, wins: 3, points: 990, actual: 990 },
      { date: '2025-03-14', event: 'Karate1 Premier League - Hangzhou 2025 (CHN)', flag: 'https://www.wkf.net/Assets/flags/CHN.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 1, wins: 3, points: 990, actual: 495 },
      { date: '2025-01-24', event: 'Karate1 Premier League - Paris 2025 (FRA)', flag: 'https://www.wkf.net/Assets/flags/FRA.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 2, wins: 2, points: 750, actual: 375 },
      { date: '2024-09-20', event: 'THE 20TH ASIAN SENIOR CHAMPIONSHIP 2024 (CHN)', flag: 'https://www.wkf.net/Assets/flags/CHN.webp', type: 'Continental Championships', category: 'Female Kata', factor: 6, hasView: true, rank: 1, wins: 5, points: 930, actual: 465 },
      { date: '2024-05-31', event: 'Karate1 Premier League - Casablanca 2024 (MAR)', flag: 'https://www.wkf.net/Assets/flags/MAR.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 3, wins: 2, points: 570, actual: 285 },
      { date: '2024-04-19', event: 'Karate1 Premier League - Cairo 2024 (EGY)', flag: 'https://www.wkf.net/Assets/flags/EGY.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 3, wins: 2, points: 570, actual: 285 },
      { date: '2024-03-15', event: 'Karate1 Premier League - Antalya 2024 (TUR)', flag: 'https://www.wkf.net/Assets/flags/TUR.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 1, wins: 3, points: 990, actual: 0 },
      { date: '2024-01-26', event: 'Karate1 Premier League - Paris 2024 (FRA)', flag: 'https://www.wkf.net/Assets/flags/FRA.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 3, wins: 2, points: 570, actual: 0 },
      { date: '2023-10-24', event: 'WKF Senior World Championships 2023 - Budapest (HUN)', flag: 'https://www.wkf.net/Assets/flags/HUN.webp', type: 'World Championships', category: 'Female Kata', factor: 12, hasView: true, rank: 2, wins: 5, points: 1500, actual: 0 },
      { date: '2023-09-08', event: 'Karate1 Premier League - Dublin 2023 (IRL)', flag: 'https://www.wkf.net/Assets/flags/IRL.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 2, wins: 2, points: 750, actual: 0 },
      { date: '2023-07-21', event: 'THE 19TH ASIAN SENIOR CHAMPIONSHIP 2023 (MAS)', flag: 'https://www.wkf.net/Assets/flags/MAS.webp', type: 'Continental Championships', category: 'Female Kata', factor: 6, hasView: true, rank: 1, wins: 4, points: 870, actual: 0 },
      { date: '2023-06-09', event: 'Karate1 Premier League - Fukuoka 2023 (JPN)', flag: 'https://www.wkf.net/Assets/flags/JPN.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 2, wins: 2, points: 750, actual: 0 },
      { date: '2023-05-12', event: 'Karate1 Premier League - Rabat 2023 (MAR)', flag: 'https://www.wkf.net/Assets/flags/MAR.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 2, wins: 2, points: 750, actual: 0 },
      { date: '2023-01-27', event: 'Karate1 Premier League - Cairo 2023 (EGY)', flag: 'https://www.wkf.net/Assets/flags/EGY.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 2, wins: 2, points: 750, actual: 0 },
      { date: '2022-12-16', event: 'Asian Senior & Para Karate Championship 2022 (UZB)', flag: 'https://www.wkf.net/Assets/flags/UZB.webp', type: 'Continental Championships', category: 'Female Kata', factor: 6, hasView: true, rank: 2, wins: 4, points: 690, actual: 0 },
      { date: '2022-09-02', event: 'Karate1 Premier League - Baku 2022 (AZE)', flag: 'https://www.wkf.net/Assets/flags/AZE.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 2, wins: 2, points: 750, actual: 0 },
      { date: '2022-05-13', event: 'Karate1 Premier League - Rabat 2022 (MAR)', flag: 'https://www.wkf.net/Assets/flags/MAR.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 2, wins: 2, points: 750, actual: 0 },
    ],
  },
  {
    name: 'Kumite Female -55 kg',
    isPrimary: false,
    rank: 5,
    points: 2340,
    totalPoints: 8750,
    honours: [
      { gold: 2, silver: 3, bronze: 4, name: 'Karate One Premier League' },
      { gold: 1, silver: 1, bronze: 1, name: 'Continental Championships' },
      { gold: 0, silver: 1, bronze: 0, name: 'World Championships' },
    ],
    results: [
      { date: '2026-02-14', event: 'Karate One Premier League - Dubai 2026 (UAE)', flag: 'https://www.wkf.net/Assets/flags/UAE.webp', type: 'Karate One Premier League', category: 'Kumite Female -55 kg', factor: 6, hasView: true, rank: 2, wins: 4, points: 750, actual: 750 },
      { date: '2025-11-27', event: 'Karate World Championships - Cairo 2025 (EGY)', flag: 'https://www.wkf.net/Assets/flags/EGY.webp', type: 'World Championships', category: 'Kumite Female -55 kg', factor: 12, hasView: true, rank: 5, wins: 3, points: 840, actual: 840 },
      { date: '2025-09-12', event: 'Karate1 Premier League - Berlin 2025 (GER)', flag: 'https://www.wkf.net/Assets/flags/GER.webp', type: 'Karate One Premier League', category: 'Kumite Female -55 kg', factor: 6, hasView: true, rank: 3, wins: 3, points: 570, actual: 570 },
      { date: '2025-05-23', event: 'THE 21ST ASIAN SENIOR CHAMPIONSHIP 2025 (UZB)', flag: 'https://www.wkf.net/Assets/flags/UZB.webp', type: 'Continental Championships', category: 'Kumite Female -55 kg', factor: 6, hasView: true, rank: 1, wins: 5, points: 930, actual: 930 },
      { date: '2025-04-18', event: 'Karate1 Premier League - Cairo 2025 (EGY)', flag: 'https://www.wkf.net/Assets/flags/EGY.webp', type: 'Karate One Premier League', category: 'Kumite Female -55 kg', factor: 6, hasView: true, rank: 1, wins: 4, points: 990, actual: 990 },
      { date: '2025-01-24', event: 'Karate1 Premier League - Paris 2025 (FRA)', flag: 'https://www.wkf.net/Assets/flags/FRA.webp', type: 'Karate One Premier League', category: 'Kumite Female -55 kg', factor: 6, hasView: true, rank: 5, wins: 2, points: 390, actual: 390 },
      { date: '2024-09-20', event: 'THE 20TH ASIAN SENIOR CHAMPIONSHIP 2024 (CHN)', flag: 'https://www.wkf.net/Assets/flags/CHN.webp', type: 'Continental Championships', category: 'Kumite Female -55 kg', factor: 6, hasView: true, rank: 2, wins: 4, points: 690, actual: 0 },
      { date: '2024-05-31', event: 'Karate1 Premier League - Casablanca 2024 (MAR)', flag: 'https://www.wkf.net/Assets/flags/MAR.webp', type: 'Karate One Premier League', category: 'Kumite Female -55 kg', factor: 6, hasView: true, rank: 1, wins: 4, points: 990, actual: 0 },
      { date: '2024-03-15', event: 'Karate1 Premier League - Antalya 2024 (TUR)', flag: 'https://www.wkf.net/Assets/flags/TUR.webp', type: 'Karate One Premier League', category: 'Kumite Female -55 kg', factor: 6, hasView: true, rank: 3, wins: 3, points: 570, actual: 0 },
      { date: '2023-10-24', event: 'WKF Senior World Championships 2023 (HUN)', flag: 'https://www.wkf.net/Assets/flags/HUN.webp', type: 'World Championships', category: 'Kumite Female -55 kg', factor: 12, hasView: true, rank: 2, wins: 5, points: 1500, actual: 0 },
      { date: '2023-09-08', event: 'Karate1 Premier League - Dublin 2023 (IRL)', flag: 'https://www.wkf.net/Assets/flags/IRL.webp', type: 'Karate One Premier League', category: 'Kumite Female -55 kg', factor: 6, hasView: true, rank: 7, wins: 1, points: 210, actual: 0 },
      { date: '2023-06-09', event: 'Karate1 Premier League - Fukuoka 2023 (JPN)', flag: 'https://www.wkf.net/Assets/flags/JPN.webp', type: 'Karate One Premier League', category: 'Kumite Female -55 kg', factor: 6, hasView: true, rank: 1, wins: 3, points: 990, actual: 0 },
    ],
  },
  {
    name: 'Team Kata Female',
    isPrimary: false,
    rank: 3,
    points: 1580,
    totalPoints: 5240,
    honours: [
      { gold: 1, silver: 2, bronze: 3, name: 'Karate One Premier League' },
      { gold: 1, silver: 0, bronze: 1, name: 'Continental Championships' },
      { gold: 0, silver: 1, bronze: 0, name: 'World Championships' },
    ],
    results: [
      { date: '2026-03-13', event: 'Karate One Premier League - Rome 2026 (ITA)', flag: 'https://www.wkf.net/Assets/flags/ITA.webp', type: 'Karate One Premier League', category: 'Team Kata Female', factor: 6, hasView: true, rank: 1, wins: 3, points: 990, actual: 990 },
      { date: '2025-11-27', event: 'Karate World Championships - Cairo 2025 (EGY)', flag: 'https://www.wkf.net/Assets/flags/EGY.webp', type: 'World Championships', category: 'Team Kata Female', factor: 12, hasView: true, rank: 2, wins: 4, points: 1500, actual: 1500 },
      { date: '2025-05-23', event: 'THE 21ST ASIAN SENIOR CHAMPIONSHIP 2025 (UZB)', flag: 'https://www.wkf.net/Assets/flags/UZB.webp', type: 'Continental Championships', category: 'Team Kata Female', factor: 6, hasView: true, rank: 1, wins: 4, points: 930, actual: 930 },
      { date: '2025-04-18', event: 'Karate1 Premier League - Cairo 2025 (EGY)', flag: 'https://www.wkf.net/Assets/flags/EGY.webp', type: 'Karate One Premier League', category: 'Team Kata Female', factor: 6, hasView: true, rank: 3, wins: 2, points: 570, actual: 570 },
      { date: '2024-09-20', event: 'THE 20TH ASIAN SENIOR CHAMPIONSHIP 2024 (CHN)', flag: 'https://www.wkf.net/Assets/flags/CHN.webp', type: 'Continental Championships', category: 'Team Kata Female', factor: 6, hasView: true, rank: 3, wins: 3, points: 450, actual: 0 },
      { date: '2024-03-15', event: 'Karate1 Premier League - Antalya 2024 (TUR)', flag: 'https://www.wkf.net/Assets/flags/TUR.webp', type: 'Karate One Premier League', category: 'Team Kata Female', factor: 6, hasView: true, rank: 2, wins: 3, points: 750, actual: 0 },
      { date: '2023-10-24', event: 'WKF Senior World Championships 2023 (HUN)', flag: 'https://www.wkf.net/Assets/flags/HUN.webp', type: 'World Championships', category: 'Team Kata Female', factor: 12, hasView: true, rank: 3, wins: 5, points: 1020, actual: 0 },
      { date: '2023-06-09', event: 'Karate1 Premier League - Fukuoka 2023 (JPN)', flag: 'https://www.wkf.net/Assets/flags/JPN.webp', type: 'Karate One Premier League', category: 'Team Kata Female', factor: 6, hasView: true, rank: 1, wins: 3, points: 990, actual: 0 },
    ],
  },
  {
    name: 'Team Kumite Female',
    isPrimary: false,
    rank: null,
    points: 890,
    totalPoints: 3120,
    honours: [
      { gold: 0, silver: 1, bronze: 2, name: 'Karate One Premier League' },
      { gold: 1, silver: 0, bronze: 0, name: 'Continental Championships' },
    ],
    results: [
      { date: '2025-05-23', event: 'THE 21ST ASIAN SENIOR CHAMPIONSHIP 2025 (UZB)', flag: 'https://www.wkf.net/Assets/flags/UZB.webp', type: 'Continental Championships', category: 'Team Kumite Female', factor: 6, hasView: true, rank: 1, wins: 4, points: 930, actual: 930 },
      { date: '2025-04-18', event: 'Karate1 Premier League - Cairo 2025 (EGY)', flag: 'https://www.wkf.net/Assets/flags/EGY.webp', type: 'Karate One Premier League', category: 'Team Kumite Female', factor: 6, hasView: true, rank: 2, wins: 3, points: 750, actual: 750 },
      { date: '2024-09-20', event: 'THE 20TH ASIAN SENIOR CHAMPIONSHIP 2024 (CHN)', flag: 'https://www.wkf.net/Assets/flags/CHN.webp', type: 'Continental Championships', category: 'Team Kumite Female', factor: 6, hasView: true, rank: 3, wins: 2, points: 450, actual: 0 },
      { date: '2024-03-15', event: 'Karate1 Premier League - Antalya 2024 (TUR)', flag: 'https://www.wkf.net/Assets/flags/TUR.webp', type: 'Karate One Premier League', category: 'Team Kumite Female', factor: 6, hasView: true, rank: 5, wins: 2, points: 390, actual: 0 },
      { date: '2023-10-24', event: 'WKF Senior World Championships 2023 (HUN)', flag: 'https://www.wkf.net/Assets/flags/HUN.webp', type: 'World Championships', category: 'Team Kumite Female', factor: 12, hasView: true, rank: 3, wins: 4, points: 1020, actual: 0 },
      { date: '2023-06-09', event: 'Karate1 Premier League - Fukuoka 2023 (JPN)', flag: 'https://www.wkf.net/Assets/flags/JPN.webp', type: 'Karate One Premier League', category: 'Team Kumite Female', factor: 6, hasView: true, rank: 7, wins: 1, points: 210, actual: 0 },
    ],
  },
]

const beltExaminations = [
  { date: '2014-03-15', belt: 'White', grade: '10th Kyu', examiner: 'Sensei Tanaka', result: 'Pass', dojo: 'SKF Central Dojo' },
  { date: '2014-09-20', belt: 'Yellow', grade: '9th Kyu', examiner: 'Sensei Tanaka', result: 'Pass', dojo: 'SKF Central Dojo' },
  { date: '2015-04-11', belt: 'Orange', grade: '8th Kyu', examiner: 'Sensei Yamamoto', result: 'Pass', dojo: 'SKF Central Dojo' },
  { date: '2015-12-05', belt: 'Green', grade: '7th Kyu', examiner: 'Sensei Yamamoto', result: 'Pass', dojo: 'SKF Central Dojo' },
  { date: '2016-07-23', belt: 'Blue', grade: '6th Kyu', examiner: 'Sensei Nakamura', result: 'Pass', dojo: 'SKF National Academy' },
  { date: '2017-03-18', belt: 'Purple', grade: '5th Kyu', examiner: 'Sensei Nakamura', result: 'Pass', dojo: 'SKF National Academy' },
  { date: '2018-01-27', belt: 'Brown', grade: '3rd Kyu', examiner: 'Shihan Ota', result: 'Pass', dojo: 'SKF National Academy' },
  { date: '2019-06-15', belt: 'Brown', grade: '1st Kyu', examiner: 'Shihan Ota', result: 'Pass', dojo: 'SKF National Academy' },
]

const specialEvents = [
  { date: '2025-12-10', title: 'International Kata Masterclass with Sensei Inoue', type: 'Seminar', location: 'Tokyo, Japan', description: 'Advanced kata refinement seminar covering Unsu, Suparinpei, and Chatanyara Kushanku. 3-day intensive with world-class instruction.' },
  { date: '2025-08-01', title: 'WKF Asian Training Camp 2025', type: 'Training Camp', location: 'Tashkent, Uzbekistan', description: '2-week high-performance training camp with national team coaches from 15 Asian countries. Focus on competition preparation and tactical analysis.' },
  { date: '2025-03-22', title: 'SKF Coaching & Judging Workshop', type: 'Workshop', location: 'Mumbai, India', description: 'Official SKF workshop on updated WKF competition rules, judging criteria for kata and kumite, and coaching methodologies.' },
  { date: '2024-07-15', title: 'Summer Intensive Karate Camp 2024', type: 'Training Camp', location: 'Chiang Mai, Thailand', description: '10-day residential camp combining traditional Okinawan karate training with modern sports science. Includes sparring sessions, kata clinics, and mental conditioning.' },
  { date: '2024-01-20', title: 'Sports Psychology & Performance Seminar', type: 'Seminar', location: 'Hong Kong', description: 'Seminar on competitive mental preparation, visualization techniques, and pre-competition routines.' },
]

export const beltColors = {
  White: '#F5F5F5',
  Yellow: '#FFD700',
  Orange: '#FF8C00',
  Green: '#228B22',
  Blue: '#1E90FF',
  Purple: '#8B008B',
  Brown: '#8B4513',
  Black: '#1a1a1a',
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function formatBeltLabel(value) {
  return String(value || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

function calculateAge(dateOfBirth) {
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1
  }

  return age
}

function formatLongDate(value) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function normaliseGenderCategories(profileCategories, gender) {
  const genderLabel = gender === 'male' ? 'Male' : 'Female'

  return profileCategories.map((category) => ({
    ...category,
    name: category.name.replace(/Female/g, genderLabel),
    results: category.results.map((result) => ({
      ...result,
      category: result.category.replace(/Female/g, genderLabel),
    })),
  }))
}

export function buildAthleteProfileData(athlete, rankInfo) {
  const profileCategories = normaliseGenderCategories(clone(categories), athlete.gender)
  const totalGolds = profileCategories.reduce((sum, category) => sum + category.honours.reduce((acc, honour) => acc + honour.gold, 0), 0)
  const totalSilvers = profileCategories.reduce((sum, category) => sum + category.honours.reduce((acc, honour) => acc + honour.silver, 0), 0)
  const totalBronzes = profileCategories.reduce((sum, category) => sum + category.honours.reduce((acc, honour) => acc + honour.bronze, 0), 0)
  const totalEvents = profileCategories.reduce((sum, category) => sum + category.results.length, 0)
  const totalMedals = totalGolds + totalSilvers + totalBronzes
  const activePoints = Number(rankInfo?.totalPoints || profileCategories[0]?.points || athlete.pointsBalance || 0)
  const lifetimePoints = Number(athlete.pointsLifetime || activePoints || 0)
  const totalBouts = Math.max(48, totalEvents * 3 + Math.round(totalMedals * 1.5))
  const winRate = `${Math.min(92, 63 + Math.round((totalGolds / Math.max(totalMedals, 1)) * 22))}.0%`
  const primaryCategory = profileCategories.find((category) => category.isPrimary) || profileCategories[0]

  return {
    athlete: {
      name: `${athlete.firstName} ${athlete.lastName}`.trim().toUpperCase(),
      shortName: `${athlete.firstName} ${athlete.lastName}`.trim(),
      photo: athlete.photoUrl || DEFAULT_PROFILE_PHOTO,
      country: 'INDIA',
      countryFlag: DEFAULT_COUNTRY_FLAG,
      id: athlete.registrationNumber,
      age: calculateAge(athlete.dateOfBirth),
      totalBouts,
      winRate,
      branchName: athlete.branchName,
      currentBelt: formatBeltLabel(athlete.currentBelt),
      status: athlete.status,
      joinedOn: formatLongDate(athlete.joinDate),
      dateOfBirth: formatLongDate(athlete.dateOfBirth),
      overallRank: rankInfo?.overallRank || primaryCategory.rank || null,
      branchRank: rankInfo?.branchRank || null,
      activePoints,
      lifetimePoints,
      totalMedals,
      coachName: BRANCH_COACHES[athlete.branchName] || 'Sensei SKF',
      biography: `${athlete.firstName} trains at SKF ${athlete.branchName} and this dedicated athlete page uses the restored mock profile data set to preview rankings, honours, belts, and event history for the selected athlete.`,
    },
    primaryCategory,
    categories: profileCategories,
    nextEvents: clone(nextEvents),
    beltExaminations: Array.isArray(athlete.achievements) && athlete.achievements.length > 0
      ? athlete.achievements
          .filter(a => a.type === 'belt-grading' || a.type === 'enrollment')
          .map(a => ({
            id: a.id,
            date: a.date,
            belt: formatBeltLabel(a.beltEarned || athlete.currentBelt || 'white'),
            grade: a.title || 'Grading',
            examiner: a.examiner || 'Sensei Arvind',
            result: 'Pass',
            dojo: athlete.branchName
          }))
      : clone(beltExaminations),
    specialEvents: clone(specialEvents),
    totals: {
      totalGolds,
      totalSilvers,
      totalBronzes,
      totalMedals,
      totalEvents,
    },
  }
}

export function buildRestoredAthleteProfileData(athlete, rankInfo) {
  const profile = buildAthleteProfileData(athlete, rankInfo)
  const primaryCategory = profile.primaryCategory
  const activePoints = Number(rankInfo?.totalPoints || primaryCategory?.points || athlete.pointsBalance || 0)

  const legacyCategories = clone(profile.categories)
  if (legacyCategories[0]) {
    legacyCategories[0].points = activePoints
    if (rankInfo?.overallRank) {
      legacyCategories[0].rank = rankInfo.overallRank
    }
  }

  return {
    athleteInfo: {
      name: profile.athlete.name,
      photo: profile.athlete.photo,
      country: profile.athlete.country,
      countryFlag: profile.athlete.countryFlag,
      id: profile.athlete.id,
      age: profile.athlete.age,
      totalBouts: profile.athlete.totalBouts,
      winRate: profile.athlete.winRate,
    },
    categories: legacyCategories,
    nextEvents: clone(profile.nextEvents),
    beltExaminations: clone(profile.beltExaminations),
    specialEvents: clone(profile.specialEvents),
    beltColors,
  }
}
