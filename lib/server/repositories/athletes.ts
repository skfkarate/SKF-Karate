import { randomUUID } from 'node:crypto';
import { calculateAllRanks } from '../../utils/rank';
import { buildCompetitionResultsFromAthletes, getAthleteRankEntry } from '../../utils/rankings';
import { generateSkfId, getBranchCode, normaliseSkfId, parseSkfId } from '../../utils/registration';
import { ensureInitialWhiteBeltAchievement } from '../../utils/athlete-achievements';
import { resolveDataFile, readJsonArray, writeJsonAtomically } from '../data-store';
import { ApiError } from '../api';

const ATHLETES_DATA_FILE = resolveDataFile('athletes.json');

type AthleteRecord = Record<string, unknown> & {
  id: string;
  skfId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  photoUrl: string;
  branchName: string;
  currentBelt: string;
  joinDate: string;
  status: string;
  pointsBalance: number;
  pointsLifetime: number;
  isPublic: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  achievements: unknown[];
  pointsHistory: unknown[];
  parentName?: string;
  phone?: string;
  email?: string;
  batch?: string;
  monthlyFee?: number;
  photoConsent?: boolean;
  consentGivenAt?: string | null;
}

type AthletePayload = Partial<AthleteRecord>;

let mockAthletes: AthleteRecord[] = [
  {
    id: 'athlete_1',
    skfId: 'SKF18MP001',
    firstName: 'Arvind',
    lastName: 'Kumar',
    dateOfBirth: '1995-04-12',
    gender: 'male',
    photoUrl: '', // uses initials
    branchName: 'Sunkadakatte',
    currentBelt: 'black-2nd-dan',
    joinDate: '2018-01-15',
    status: 'active',
    pointsBalance: 2450,
    pointsLifetime: 4100,
    isPublic: true,
    isFeatured: true,
    createdAt: '2018-01-15T00:00:00Z',
    updatedAt: '2024-11-20T00:00:00Z',
    achievements: [
      { id: 'ach_1_wkc_2023', type: 'tournament-silver', date: '2023-10-24', title: 'World Senior Championships 2023', subtitle: 'Budapest, Hungary', tournamentLevel: 'international', pointsAwarded: 900, filter: 'competitions', meta: ['75.00', 'Female Kata'] },
      { id: 'ach_1_akf_2023', type: 'tournament-gold', date: '2023-07-21', title: 'AKF Senior Championships 2023', subtitle: 'Melaka, Malaysia', tournamentLevel: 'continental', pointsAwarded: 600, filter: 'competitions', meta: ['75.00', 'Female Kata'] },
      { id: 'ach_1_k1pl_paris_2024', type: 'tournament-silver', date: '2024-01-26', title: 'Karate 1 - Premier League', subtitle: 'Paris 2024', tournamentLevel: 'premier-league', pointsAwarded: 750, filter: 'competitions', meta: ['75.00', 'Female Kata'] },
      { id: 'ach_1_k1pl_antalya_2024', type: 'tournament-gold', date: '2024-03-15', title: 'Karate 1 - Premier League', subtitle: 'Antalya 2024', tournamentLevel: 'premier-league', pointsAwarded: 1000, filter: 'competitions', meta: ['75.00', 'Female Kata'] },
      { id: 'ach_1_k1pl_cairo_2024', type: 'tournament-gold', date: '2024-04-19', title: 'Karate 1 - Premier League', subtitle: 'Cairo 2024', tournamentLevel: 'premier-league', pointsAwarded: 1000, filter: 'competitions', meta: ['75.00', 'Female Kata'] },
      { id: 'ach_1_wkc_2021', type: 'tournament-bronze', date: '2021-11-16', title: 'World Senior Championships 2021', subtitle: 'Dubai, UAE', tournamentLevel: 'international', pointsAwarded: 700, filter: 'competitions', meta: ['60.00', 'Female Kata'] },
      { id: 'ach_1_akf_2022', type: 'tournament-bronze', date: '2022-12-16', title: 'AKF Senior Championships 2022', subtitle: 'Tashkent, Uzbekistan', tournamentLevel: 'continental', pointsAwarded: 500, filter: 'competitions', meta: ['60.00', 'Female Kata'] },
      { id: 'ach_1_olympics', type: 'tournament-bronze', date: '2021-08-05', title: 'Olympic Games Tokyo 2020', subtitle: 'Tokyo, Japan', tournamentLevel: 'olympic', pointsAwarded: 2000, filter: 'competitions', meta: ['80.00', 'Female Kata'] },
      { id: 'ach_1_k1pl_rabat_2023', type: 'tournament-silver', date: '2023-05-12', title: 'Karate 1 - Premier League', subtitle: 'Rabat 2023', tournamentLevel: 'premier-league', pointsAwarded: 750, filter: 'competitions', meta: ['75.00', 'Female Kata'] },
      { id: 'ach_1_k1pl_fukuoka_2023', type: 'tournament-silver', date: '2023-06-09', title: 'Karate 1 - Premier League', subtitle: 'Fukuoka 2023', tournamentLevel: 'premier-league', pointsAwarded: 750, filter: 'competitions', meta: ['75.00', 'Female Kata'] },
      { id: 'ach_1_k1pl_dublin_2023', type: 'tournament-silver', date: '2023-09-08', title: 'Karate 1 - Premier League', subtitle: 'Dublin 2023', tournamentLevel: 'premier-league', pointsAwarded: 750, filter: 'competitions', meta: ['75.00', 'Female Kata'] },
      { id: 'ach_1_worldgames_2022', type: 'tournament-bronze', date: '2022-07-08', title: 'The World Games 2022', subtitle: 'Birmingham, USA', tournamentLevel: 'international', pointsAwarded: 800, filter: 'competitions', meta: ['60.00', 'Female Kata'] }
    ],
    pointsHistory: []
  },
  {
    id: 'athlete_2',
    skfId: 'SKF22RJ145',
    firstName: 'Priya',
    lastName: 'Sharma',
    dateOfBirth: '2010-09-25',
    gender: 'female',
    photoUrl: '',
    branchName: 'Rajajinagar',
    currentBelt: 'black-1st-dan',
    joinDate: '2022-03-10',
    status: 'active',
    pointsBalance: 850,
    pointsLifetime: 1250,
    isPublic: true,
    isFeatured: true,
    createdAt: '2022-03-10T00:00:00Z',
    updatedAt: '2024-10-15T00:00:00Z',
    achievements: [
      { id: 'ach_2_1', type: 'belt-grading', date: '2024-10-10', title: 'Passed Brown Belt Grading', beltEarned: 'brown', pointsAwarded: 200 },
      { id: 'ach_2_2', type: 'tournament-silver', date: '2024-08-05', title: 'Silver Medal — State Championship', tournamentLevel: 'state', pointsAwarded: 800 },
      { id: 'ach_2_3', type: 'birthday-bonus', date: '2024-09-25', title: 'Birthday Bonus 2024', pointsAwarded: 100 },
      { id: 'ach_2_4', type: 'attendance-milestone', date: '2023-12-01', title: '100 Classes Attended', pointsAwarded: 100 }
    ],
    pointsHistory: []
  },
  {
    id: 'athlete_3',
    skfId: 'SKF24RJ042',
    firstName: 'Rohan',
    lastName: 'Singh',
    dateOfBirth: '2014-06-18',
    gender: 'male',
    photoUrl: '',
    branchName: 'Malleshwaram',
    currentBelt: 'black-1st-dan',
    joinDate: '2024-01-05',
    status: 'active',
    pointsBalance: 350,
    pointsLifetime: 350,
    isPublic: true,
    isFeatured: false,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-05-10T00:00:00Z',
    achievements: [
      { id: 'ach_3_1', type: 'belt-grading', date: '2024-05-01', title: 'Passed Yellow Belt Grading', beltEarned: 'yellow', pointsAwarded: 200 },
      { id: 'ach_3_2', type: 'enrollment', date: '2024-01-05', title: 'Joined SKF Karate', pointsAwarded: 50 },
      { id: 'ach_3_3', type: 'birthday-bonus', date: '2024-06-18', title: 'Birthday Bonus 2024', pointsAwarded: 100 }
    ],
    pointsHistory: []
  },
  {
    id: 'athlete_4',
    skfId: 'SKF20SK089',
    firstName: 'Deepa',
    lastName: 'Natarajan',
    dateOfBirth: '2005-11-30',
    gender: 'female',
    photoUrl: '',
    branchName: 'Sunkadakatte',
    currentBelt: 'black-1st-dan',
    joinDate: '2020-02-20',
    status: 'active',
    pointsBalance: 1200,
    pointsLifetime: 3200,
    isPublic: true,
    isFeatured: false,
    createdAt: '2020-02-20T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
    achievements: [
      { id: 'ach_4_1', type: 'tournament-bronze', date: '2024-11-20', title: 'Bronze Medal — National Karate Cup', tournamentLevel: 'national', pointsAwarded: 1200 },
      { id: 'ach_4_2', type: 'belt-grading', date: '2024-01-15', title: 'Passed Black Belt — 1st Dan Grading', beltEarned: 'black-1st-dan', pointsAwarded: 200 },
      { id: 'ach_4_3', type: 'birthday-bonus', date: '2024-11-30', title: 'Birthday Bonus 2024', pointsAwarded: 100 },
      { id: 'ach_4_4', type: 'attendance-milestone', date: '2023-06-10', title: '500 Classes Attended', pointsAwarded: 100 }
    ],
    pointsHistory: []
  },
  {
    id: 'athlete_5',
    skfId: 'SKF23SK211',
    firstName: 'Karthik',
    lastName: 'Rao',
    dateOfBirth: '2012-02-14',
    gender: 'male',
    photoUrl: '',
    branchName: 'Rajajinagar',
    currentBelt: 'black-1st-dan',
    joinDate: '2023-05-10',
    status: 'active',
    pointsBalance: 600,
    pointsLifetime: 600,
    isPublic: true,
    isFeatured: false,
    createdAt: '2023-05-10T00:00:00Z',
    updatedAt: '2024-08-20T00:00:00Z',
    achievements: [
      { id: 'ach_5_1', type: 'tournament-gold', date: '2024-08-15', title: 'Gold Medal — District Championship', tournamentLevel: 'district', pointsAwarded: 500 },
      { id: 'ach_5_2', type: 'belt-grading', date: '2024-06-10', title: 'Passed Green Belt Grading', beltEarned: 'green', pointsAwarded: 200 },
      { id: 'ach_5_3', type: 'birthday-bonus', date: '2024-02-14', title: 'Birthday Bonus 2024', pointsAwarded: 100 }
    ],
    pointsHistory: []
  },
  {
    id: 'athlete_6',
    skfId: 'SKF21ML033',
    firstName: 'Ananya',
    lastName: 'Gowda',
    dateOfBirth: '2008-07-22',
    gender: 'female',
    photoUrl: '',
    branchName: 'Malleshwaram',
    currentBelt: 'blue',
    joinDate: '2021-08-15',
    status: 'active',
    pointsBalance: 1150,
    pointsLifetime: 1800,
    isPublic: true,
    isFeatured: true,
    createdAt: '2021-08-15T00:00:00Z',
    updatedAt: '2024-09-10T00:00:00Z',
    achievements: [
      { id: 'ach_6_1', type: 'tournament-silver', date: '2024-09-05', title: 'Silver Medal — State Open', tournamentLevel: 'state', pointsAwarded: 800 },
      { id: 'ach_6_2', type: 'belt-grading', date: '2024-04-12', title: 'Passed Blue Belt Grading', beltEarned: 'blue', pointsAwarded: 200 },
      { id: 'ach_6_3', type: 'birthday-bonus', date: '2024-07-22', title: 'Birthday Bonus 2024', pointsAwarded: 100 },
      { id: 'ach_6_4', type: 'referral-bonus', date: '2023-11-20', title: 'Referred a New Athlete', pointsAwarded: 150 }
    ],
    pointsHistory: []
  },
  {
    id: 'athlete_7',
    skfId: 'SKF24ML105',
    firstName: 'Vikram',
    lastName: 'Reddy',
    dateOfBirth: '2015-12-05',
    gender: 'male',
    photoUrl: '',
    branchName: 'Sunkadakatte',
    currentBelt: 'white',
    joinDate: '2024-02-10',
    status: 'active',
    pointsBalance: 50,
    pointsLifetime: 50,
    isPublic: true,
    isFeatured: false,
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z',
    achievements: [
      { id: 'ach_7_1', type: 'enrollment', date: '2024-02-10', title: 'Joined SKF Karate', pointsAwarded: 50 }
    ],
    pointsHistory: []
  },
  {
    id: 'athlete_8',
    skfId: 'SKF19SK056',
    firstName: 'Nandini',
    lastName: 'Murthy',
    dateOfBirth: '1998-05-14',
    gender: 'female',
    photoUrl: '',
    branchName: 'Rajajinagar',
    currentBelt: 'black-1st-dan',
    joinDate: '2019-06-20',
    status: 'alumni',
    pointsBalance: 400,
    pointsLifetime: 2800,
    isPublic: true,
    isFeatured: false,
    createdAt: '2019-06-20T00:00:00Z',
    updatedAt: '2023-12-10T00:00:00Z',
    achievements: [
      { id: 'ach_8_1', type: 'belt-grading', date: '2023-11-15', title: 'Passed Black Belt — 1st Dan Grading', beltEarned: 'black-1st-dan', pointsAwarded: 200 },
      { id: 'ach_8_2', type: 'tournament-gold', date: '2022-09-05', title: 'Gold Medal — District Championship', tournamentLevel: 'district', pointsAwarded: 500 }
    ],
    pointsHistory: []
  },
  {
    id: 'athlete_9',
    skfId: 'SKF22SK092',
    firstName: 'Rahul',
    lastName: 'Chaudhary',
    dateOfBirth: '2009-08-30',
    gender: 'male',
    photoUrl: '',
    branchName: 'Malleshwaram',
    currentBelt: 'green',
    joinDate: '2022-04-15',
    status: 'active',
    pointsBalance: 550,
    pointsLifetime: 850,
    isPublic: true,
    isFeatured: false,
    createdAt: '2022-04-15T00:00:00Z',
    updatedAt: '2024-08-30T00:00:00Z',
    achievements: [
      { id: 'ach_9_1', type: 'birthday-bonus', date: '2024-08-30', title: 'Birthday Bonus 2024', pointsAwarded: 100 },
      { id: 'ach_9_2', type: 'belt-grading', date: '2024-02-10', title: 'Passed Green Belt Grading', beltEarned: 'green', pointsAwarded: 200 },
      { id: 'ach_9_3', type: 'tournament-participation', date: '2023-11-20', title: 'Participated in State Open', tournamentLevel: 'state', pointsAwarded: 100 }
    ],
    pointsHistory: []
  },
  {
    id: 'athlete_10',
    skfId: 'SKF21MP188',
    firstName: 'Shruti',
    lastName: 'Hassan',
    dateOfBirth: '2011-01-20',
    gender: 'female',
    photoUrl: '',
    branchName: 'Sunkadakatte',
    currentBelt: 'brown',
    joinDate: '2021-10-05',
    status: 'active',
    pointsBalance: 900,
    pointsLifetime: 1500,
    isPublic: true,
    isFeatured: false,
    createdAt: '2021-10-05T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    achievements: [
      { id: 'ach_10_1', type: 'belt-grading', date: '2024-10-10', title: 'Passed Brown Belt Grading', beltEarned: 'brown', pointsAwarded: 200 },
      { id: 'ach_10_2', type: 'special-award', date: '2024-05-15', title: 'Outstanding Discipline Award', awardedBy: 'Branch Sensei', pointsAwarded: 150 },
      { id: 'ach_10_3', type: 'birthday-bonus', date: '2024-01-20', title: 'Birthday Bonus 2024', pointsAwarded: 100 }
    ],
    pointsHistory: []
  },
  {
    id: 'athlete_11',
    skfId: 'SKF23SK050',
    firstName: 'Aditya',
    lastName: 'Nambiar',
    dateOfBirth: '2013-10-11',
    gender: 'male',
    photoUrl: '',
    branchName: 'Rajajinagar',
    currentBelt: 'orange',
    joinDate: '2023-01-25',
    status: 'active',
    pointsBalance: 450,
    pointsLifetime: 450,
    isPublic: true,
    isFeatured: false,
    createdAt: '2023-01-25T00:00:00Z',
    updatedAt: '2024-06-15T00:00:00Z',
    achievements: [
      { id: 'ach_11_1', type: 'belt-grading', date: '2024-06-10', title: 'Passed Orange Belt Grading', beltEarned: 'orange', pointsAwarded: 200 },
      { id: 'ach_11_2', type: 'attendance-milestone', date: '2023-12-05', title: '100 Classes Attended', pointsAwarded: 100 },
      { id: 'ach_11_3', type: 'belt-grading', date: '2023-07-20', title: 'Passed Yellow Belt Grading', beltEarned: 'yellow', pointsAwarded: 200 }
    ],
    pointsHistory: []
  },
  {
    id: 'athlete_12',
    skfId: 'SKF20ML112',
    firstName: 'Meera',
    lastName: 'Iyer',
    dateOfBirth: '2007-03-08',
    gender: 'female',
    photoUrl: '',
    branchName: 'Malleshwaram',
    currentBelt: 'blue',
    joinDate: '2020-08-10',
    status: 'active',
    pointsBalance: 1400,
    pointsLifetime: 2100,
    isPublic: true,
    isFeatured: false,
    createdAt: '2020-08-10T00:00:00Z',
    updatedAt: '2024-11-05T00:00:00Z',
    achievements: [
      { id: 'ach_12_1', type: 'tournament-gold', date: '2024-11-01', title: 'Gold Medal — State Championship', tournamentLevel: 'state', pointsAwarded: 1000 },
      { id: 'ach_12_2', type: 'belt-grading', date: '2024-05-20', title: 'Passed Blue Belt Grading', beltEarned: 'blue', pointsAwarded: 200 },
      { id: 'ach_12_3', type: 'birthday-bonus', date: '2024-03-08', title: 'Birthday Bonus 2024', pointsAwarded: 100 },
      { id: 'ach_12_4', type: 'attendance-milestone', date: '2023-09-15', title: '300 Classes Attended', pointsAwarded: 100 }
    ],
    pointsHistory: []
  },
  {
    id: 'athlete_13',
    skfId: 'SKF24MP199',
    firstName: 'Aryan',
    lastName: 'Patil',
    dateOfBirth: '2016-01-25',
    gender: 'male',
    photoUrl: '',
    branchName: 'Sunkadakatte',
    currentBelt: 'yellow',
    joinDate: '2024-05-15',
    status: 'active',
    pointsBalance: 250,
    pointsLifetime: 250,
    isPublic: true,
    isFeatured: false,
    createdAt: '2024-05-15T00:00:00Z',
    updatedAt: '2024-10-20T00:00:00Z',
    achievements: [
      { id: 'ach_13_1', type: 'belt-grading', date: '2024-10-15', title: 'Passed Yellow Belt Grading', beltEarned: 'yellow', pointsAwarded: 200 },
      { id: 'ach_13_2', type: 'enrollment', date: '2024-05-15', title: 'Joined SKF Karate', pointsAwarded: 50 }
    ],
    pointsHistory: []
  },
  {
    id: 'athlete_14',
    skfId: 'SKF16SK005',
    firstName: 'Sanjay',
    lastName: 'Bhat',
    dateOfBirth: '1990-11-12',
    gender: 'male',
    photoUrl: '',
    branchName: 'Rajajinagar',
    currentBelt: 'black-3rd-dan',
    joinDate: '2016-02-10',
    status: 'active',
    pointsBalance: 5200,
    pointsLifetime: 8500,
    isPublic: true,
    isFeatured: true,
    createdAt: '2016-02-10T00:00:00Z',
    updatedAt: '2024-11-12T00:00:00Z',
    achievements: [
      { id: 'ach_14_1', type: 'birthday-bonus', date: '2024-11-12', title: 'Birthday Bonus 2024', pointsAwarded: 100 },
      { id: 'ach_14_2', type: 'tournament-gold', date: '2024-08-20', title: 'Gold Medal — International Open', tournamentLevel: 'international', pointsAwarded: 3000 },
      { id: 'ach_14_3', type: 'belt-grading', date: '2023-12-10', title: 'Passed Black Belt — 3rd Dan Grading', beltEarned: 'black-3rd-dan', pointsAwarded: 200 }
    ],
    pointsHistory: []
  },
  {
    id: 'athlete_15',
    skfId: 'SKF22RJ234',
    firstName: 'Neha',
    lastName: 'Desai',
    dateOfBirth: '2006-04-05',
    gender: 'female',
    photoUrl: '',
    branchName: 'Malleshwaram',
    currentBelt: 'brown',
    joinDate: '2022-09-01',
    status: 'active',
    pointsBalance: 750,
    pointsLifetime: 1350,
    isPublic: true,
    isFeatured: false,
    createdAt: '2022-09-01T00:00:00Z',
    updatedAt: '2024-10-05T00:00:00Z',
    achievements: [
      { id: 'ach_15_1', type: 'belt-grading', date: '2024-10-01', title: 'Passed Brown Belt Grading', beltEarned: 'brown', pointsAwarded: 200 },
      { id: 'ach_15_2', type: 'tournament-bronze', date: '2024-06-15', title: 'Bronze Medal — State Championship', tournamentLevel: 'state', pointsAwarded: 600 },
      { id: 'ach_15_3', type: 'birthday-bonus', date: '2024-04-05', title: 'Birthday Bonus 2024', pointsAwarded: 100 },
      { id: 'ach_15_4', type: 'belt-grading', date: '2023-11-10', title: 'Passed Blue Belt Grading', beltEarned: 'blue', pointsAwarded: 200 }
    ],
    pointsHistory: []
  },
  {
    id: 'athlete_16',
    skfId: 'SKF23HE001',
    firstName: 'Krishna',
    lastName: 'C',
    dateOfBirth: '2005-10-22',
    gender: 'male',
    photoUrl: '',
    branchName: 'Sunkadakatte',
    currentBelt: 'brown',
    joinDate: '2023-06-01',
    status: 'active',
    pointsBalance: 1850,
    pointsLifetime: 2750,
    isPublic: true,
    isFeatured: true,
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2026-04-10T00:00:00Z',
    achievements: [
      { id: 'ach_16_1', type: 'enrollment', date: '2023-06-01', title: 'Joined SKF Karate', pointsAwarded: 50 },
      { id: 'ach_16_2', type: 'belt-grading', date: '2023-08-15', title: 'Passed Yellow Belt Grading', beltEarned: 'yellow', pointsAwarded: 200 },
      { id: 'ach_16_3', type: 'attendance-milestone', date: '2023-11-20', title: '50 Classes Attended', pointsAwarded: 50 },
      { id: 'ach_16_4', type: 'belt-grading', date: '2024-01-20', title: 'Passed Orange Belt Grading', beltEarned: 'orange', pointsAwarded: 200 },
      { id: 'ach_16_5', type: 'tournament-silver', date: '2024-03-10', title: 'Silver Medal — Inter-Branch Tournament', tournamentLevel: 'district', pointsAwarded: 400 },
      { id: 'ach_16_6', type: 'belt-grading', date: '2024-05-18', title: 'Passed Green Belt Grading', beltEarned: 'green', pointsAwarded: 200 },
      { id: 'ach_16_7', type: 'attendance-milestone', date: '2024-07-01', title: '150 Classes Attended', pointsAwarded: 100 },
      { id: 'ach_16_8', type: 'tournament-gold', date: '2024-08-25', title: 'Gold Medal — State Karate Championship', tournamentLevel: 'state', pointsAwarded: 800, filter: 'competitions', meta: ['68.00', 'Male Kumite -61 kg'] },
      { id: 'ach_16_9', type: 'birthday-bonus', date: '2024-10-22', title: 'Birthday Bonus 2024', pointsAwarded: 100 },
      { id: 'ach_16_10', type: 'belt-grading', date: '2024-11-10', title: 'Passed Blue Belt Grading', beltEarned: 'blue', pointsAwarded: 200 },
      { id: 'ach_16_11', type: 'tournament-gold', date: '2025-02-15', title: 'Gold Medal — SKF Open Championship', tournamentLevel: 'state', pointsAwarded: 1000, filter: 'competitions', meta: ['72.00', 'Male Kumite -61 kg'] },
      { id: 'ach_16_12', type: 'belt-grading', date: '2025-06-20', title: 'Passed Purple Belt Grading', beltEarned: 'purple', pointsAwarded: 200 },
      { id: 'ach_16_13', type: 'attendance-milestone', date: '2025-09-01', title: '300 Classes Attended', pointsAwarded: 100 },
      { id: 'ach_16_14', type: 'tournament-bronze', date: '2025-11-08', title: 'Bronze Medal — National Karate Cup', tournamentLevel: 'national', pointsAwarded: 600, filter: 'competitions', meta: ['75.00', 'Male Kumite -61 kg'] },
      { id: 'ach_16_15', type: 'belt-grading', date: '2026-02-15', title: 'Passed Brown Belt Grading', beltEarned: 'brown', pointsAwarded: 200 },
      { id: 'ach_16_16', type: 'special-award', date: '2026-03-15', title: 'Most Dedicated Student Award 2026', awardedBy: 'Sensei Rajesh Kumar', pointsAwarded: 150 }
    ],
    pointsHistory: []
  }
];

let athletesLoadedFromDisk = false;

function cloneAthleteData(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureAthletesLoaded() {
  if (athletesLoadedFromDisk) return;
  athletesLoadedFromDisk = true;

  try {
    const stored = readJsonArray(ATHLETES_DATA_FILE);
    if (Array.isArray(stored) && stored.length > 0) {
      mockAthletes = stored as typeof mockAthletes
    }
  } catch (error) {
    console.error('Failed to load athlete store:', error);
  }
}

function persistAthletes() {
  ensureAthletesLoaded();
  writeJsonAtomically(ATHLETES_DATA_FILE, mockAthletes);
}

function withInitialWhiteBeltAchievement(athlete: AthleteRecord): AthleteRecord {
  return {
    ...athlete,
    achievements: ensureInitialWhiteBeltAchievement(athlete.achievements, {
      joinDate: athlete.joinDate,
      branchName: athlete.branchName,
    }),
  };
}

export function getAllAthletes() {
  ensureAthletesLoaded();
  return cloneAthleteData(mockAthletes.map(withInitialWhiteBeltAchievement));
}

export function getAthleteBySkfId(skfId) {
  ensureAthletesLoaded();
  const normalized = normaliseSkfId(skfId);
  const athlete = mockAthletes.find(s => s.skfId.toUpperCase() === normalized.toUpperCase()) || null;
  return athlete ? cloneAthleteData(withInitialWhiteBeltAchievement(athlete)) : null;
}

export function getAthleteById(id) {
  ensureAthletesLoaded();
  const athlete = mockAthletes.find(s => s.id === id) || null;
  return athlete ? cloneAthleteData(withInitialWhiteBeltAchievement(athlete)) : null;
}

export function getAthletesByBranch(branch) {
  ensureAthletesLoaded();
  return cloneAthleteData(
    mockAthletes
      .filter(s => s.branchName.toLowerCase() === branch.toLowerCase())
      .map(withInitialWhiteBeltAchievement)
  );
}

export function getFeaturedAthletes() {
  ensureAthletesLoaded();
  return cloneAthleteData(
    mockAthletes
      .filter(s => s.isFeatured && s.isPublic && s.status === 'active')
      .map(withInitialWhiteBeltAchievement)
  );
}

export function getNextSequenceNumber(year, branchName = 'MP') {
  ensureAthletesLoaded();
  const branchCode = getBranchCode(branchName);
  const seqs = mockAthletes
    .map(s => parseSkfId(String(s.skfId || '')))
    .filter(parts => parts && parts.year === year && (parts.branchCode === branchCode || (parts.legacy && branchCode === 'MP')))
    .map(parts => parts?.sequence || 0)
    .filter(value => Number.isFinite(value));
  return seqs.length > 0 ? Math.max(...seqs) + 1 : 1;
}

export function hasAthleteSkfId(skfId, excludeId = null) {
  ensureAthletesLoaded();
  const normalized = normaliseSkfId(skfId);

  return mockAthletes.some((athlete) => {
    return (
      athlete.skfId.toUpperCase() === normalized.toUpperCase() &&
      athlete.id !== excludeId
    );
  });
}

export function searchAthletesByName(query) {
  ensureAthletesLoaded();
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  return mockAthletes
    .filter(s =>
      s.isPublic &&
      (s.firstName.toLowerCase().includes(lowerQuery) ||
        s.lastName.toLowerCase().includes(lowerQuery) ||
        s.skfId.toLowerCase().includes(lowerQuery))
    )
    .map(s => ({
      skfId: s.skfId,
      firstName: s.firstName,
      lastName: s.lastName,
      branchName: s.branchName,
      currentBelt: s.currentBelt,
      photoUrl: s.photoUrl
    }));
}

export function getRankSnapshots() {
  ensureAthletesLoaded();
  const results = buildCompetitionResultsFromAthletes(mockAthletes);
  return calculateAllRanks(mockAthletes, results, new Date());
}

export function getAthleteRank(athleteId) {
  ensureAthletesLoaded();
  const results = buildCompetitionResultsFromAthletes(mockAthletes);
  const rankInfo = getAthleteRankEntry(athleteId, mockAthletes, results);
  if (!rankInfo) return null;
  return {
    branchRank: rankInfo.branchRank,
    overallRank: rankInfo.overallRank,
    totalPoints: rankInfo.totalPoints,
    rankingCategory: rankInfo.rankingCategory,
  };
}

function normaliseAthletePayload(
  input: AthletePayload = {},
  existing: AthletePayload | null = null
) {
  const now = new Date().toISOString();
  const joinDate = input.joinDate || existing?.joinDate || new Date().toISOString().split('T')[0];
  const joinYear = Number.parseInt(String(joinDate).slice(0, 4), 10) || new Date().getFullYear();
  const requestedSkfId = input.skfId
    ? normaliseSkfId(input.skfId)
    : '';
  const branchName = input.branchName || existing?.branchName || 'Sunkadakatte';
  const achievements = Array.isArray(input.achievements) ? input.achievements : existing?.achievements || [];
  const skfId =
    existing?.skfId ||
    requestedSkfId ||
    generateSkfId(joinYear, branchName, getNextSequenceNumber(joinYear, branchName));

  return {
    id: existing?.id || input.id || `athlete_${randomUUID()}`,
    skfId,
    firstName: input.firstName?.trim() || existing?.firstName || '',
    lastName: input.lastName?.trim() || existing?.lastName || '',
    dateOfBirth: input.dateOfBirth || existing?.dateOfBirth || '',
    gender: input.gender || existing?.gender || 'male',
    photoUrl: input.photoUrl || existing?.photoUrl || '',
    branchName: input.branchName || existing?.branchName || 'Sunkadakatte',
    currentBelt: input.currentBelt || existing?.currentBelt || 'white',
    joinDate,
    status: input.status || existing?.status || 'active',
    parentName: input.parentName || existing?.parentName || '',
    phone: input.phone || existing?.phone || '',
    email: input.email || existing?.email || '',
    batch: input.batch || existing?.batch || '',
    monthlyFee: Number.isFinite(input.monthlyFee) ? input.monthlyFee : existing?.monthlyFee || 0,
    photoConsent:
      typeof input.photoConsent === 'boolean'
        ? input.photoConsent
        : existing?.photoConsent ?? false,
    consentGivenAt:
      input.consentGivenAt === null
        ? null
        : input.consentGivenAt || existing?.consentGivenAt || null,
    isPublic: typeof input.isPublic === 'boolean' ? input.isPublic : existing?.isPublic ?? true,
    isFeatured: typeof input.isFeatured === 'boolean' ? input.isFeatured : existing?.isFeatured ?? false,
    achievements: ensureInitialWhiteBeltAchievement(achievements, {
      joinDate,
      branchName,
    }),
    pointsHistory: Array.isArray(input.pointsHistory) ? input.pointsHistory : existing?.pointsHistory || [],
    pointsBalance: Number.isFinite(input.pointsBalance) ? input.pointsBalance : existing?.pointsBalance || 0,
    pointsLifetime: Number.isFinite(input.pointsLifetime) ? input.pointsLifetime : existing?.pointsLifetime || 0,
    createdAt: existing?.createdAt || input.createdAt || now,
    updatedAt: now,
  };
}

export function createAthlete(input) {
  ensureAthletesLoaded();
  const athlete = normaliseAthletePayload(input);

  if (hasAthleteSkfId(athlete.skfId)) {
    throw new ApiError(409, 'An athlete with this SKF ID already exists.');
  }

  mockAthletes = [athlete, ...mockAthletes];
  persistAthletes();
  return cloneAthleteData(athlete);
}

export function updateAthlete(id, input) {
  ensureAthletesLoaded();
  const index = mockAthletes.findIndex((athlete) => athlete.id === id);
  if (index === -1) return null;

  const updatedAthlete = normaliseAthletePayload(input, mockAthletes[index]);

  if (hasAthleteSkfId(updatedAthlete.skfId, id)) {
    throw new ApiError(409, 'An athlete with this SKF ID already exists.');
  }

  mockAthletes[index] = updatedAthlete;
  persistAthletes();
  return cloneAthleteData(updatedAthlete);
}

export function replaceAllAthletes(nextAthletes) {
  ensureAthletesLoaded();
  mockAthletes = cloneAthleteData(nextAthletes);
  persistAthletes();
  return cloneAthleteData(mockAthletes);
}
