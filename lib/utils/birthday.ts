import type { Athlete } from '@/data/types'
import { DEFAULT_POINTS } from './points';

export function getAthletesWithBirthdayToday(athletes: Athlete[]) {
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  return athletes.filter(athlete => {
    if (athlete.status !== 'active') return false;
    const dob = new Date(athlete.dateOfBirth);
    return dob.getMonth() + 1 === todayMonth && dob.getDate() === todayDay;
  });
}

export function hasReceivedBirthdayBonusThisYear(athlete: Athlete) {
  const thisYear = new Date().getFullYear().toString();
  return athlete.achievements.some(
    a => a.type === 'birthday-bonus' && a.date.startsWith(thisYear)
  );
}

export function buildBirthdayAchievement(athlete: Athlete) {
  const year = new Date().getFullYear();
  return {
    id: `birthday-${athlete.id}-${year}`,
    type: 'birthday-bonus',
    date: new Date().toISOString().split('T')[0],
    title: `Birthday Bonus ${year}`,
    description: `Happy Birthday from SKF Karate! Enjoy your points. Oss!`,
    pointsAwarded: DEFAULT_POINTS['birthday-bonus'],
  };
}
