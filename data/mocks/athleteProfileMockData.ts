/**
 * @deprecated — Import from '@/data/seed' and '@/data/constants' instead.
 * This file re-exports from the new centralized data layer for backward compatibility.
 */
export { DEFAULT_PROFILE_PHOTO, DEFAULT_COUNTRY_FLAG, beltExaminations } from '@/data/seed/beltExaminations'
export { BELT_HEX_COLORS as beltColors } from '@/data/constants/belts'
export { BRANCH_COACHES } from '@/data/seed/instructors'

/**
 * These items are profile-specific mock data that remain here since they are
 * highly specialized (WKF ranking results) and not general-purpose seed data.
 */
export const nextEvents = [
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

export const categories = [
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
      { date: '2024-09-20', event: 'THE 20TH ASIAN SENIOR CHAMPIONSHIP 2024 (CHN)', flag: 'https://www.wkf.net/Assets/flags/CHN.webp', type: 'Continental Championships', category: 'Female Kata', factor: 6, hasView: true, rank: 1, wins: 5, points: 930, actual: 465 },
      { date: '2024-05-31', event: 'Karate1 Premier League - Casablanca 2024 (MAR)', flag: 'https://www.wkf.net/Assets/flags/MAR.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 3, wins: 2, points: 570, actual: 285 },
      { date: '2024-03-15', event: 'Karate1 Premier League - Antalya 2024 (TUR)', flag: 'https://www.wkf.net/Assets/flags/TUR.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 1, wins: 3, points: 990, actual: 0 },
      { date: '2024-01-26', event: 'Karate1 Premier League - Paris 2024 (FRA)', flag: 'https://www.wkf.net/Assets/flags/FRA.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 3, wins: 2, points: 570, actual: 0 },
      { date: '2023-10-24', event: 'WKF Senior World Championships 2023 - Budapest (HUN)', flag: 'https://www.wkf.net/Assets/flags/HUN.webp', type: 'World Championships', category: 'Female Kata', factor: 12, hasView: true, rank: 2, wins: 5, points: 1500, actual: 0 },
      { date: '2023-09-08', event: 'Karate1 Premier League - Dublin 2023 (IRL)', flag: 'https://www.wkf.net/Assets/flags/IRL.webp', type: 'Karate One Premier League', category: 'Female Kata', factor: 6, hasView: true, rank: 2, wins: 2, points: 750, actual: 0 },
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
    ],
    results: [
      { date: '2026-02-14', event: 'Karate One Premier League - Dubai 2026 (UAE)', flag: 'https://www.wkf.net/Assets/flags/UAE.webp', type: 'Karate One Premier League', category: 'Kumite Female -55 kg', factor: 6, hasView: true, rank: 2, wins: 4, points: 750, actual: 750 },
      { date: '2025-05-23', event: 'THE 21ST ASIAN SENIOR CHAMPIONSHIP 2025 (UZB)', flag: 'https://www.wkf.net/Assets/flags/UZB.webp', type: 'Continental Championships', category: 'Kumite Female -55 kg', factor: 6, hasView: true, rank: 1, wins: 5, points: 930, actual: 930 },
    ],
  },
]

export const specialEvents = [
  { date: '2025-12-10', title: 'International Kata Masterclass with Sensei Inoue', type: 'Seminar', location: 'Tokyo, Japan', description: 'Advanced kata refinement seminar covering Unsu, Suparinpei, and Chatanyara Kushanku.' },
  { date: '2025-08-01', title: 'WKF Asian Training Camp 2025', type: 'Training Camp', location: 'Tashkent, Uzbekistan', description: '2-week high-performance training camp.' },
  { date: '2025-03-22', title: 'SKF Coaching & Judging Workshop', type: 'Workshop', location: 'Mumbai, India', description: 'Official SKF workshop.' },
  { date: '2024-07-15', title: 'Summer Intensive Karate Camp 2024', type: 'Training Camp', location: 'Chiang Mai, Thailand', description: '10-day residential camp.' },
]
