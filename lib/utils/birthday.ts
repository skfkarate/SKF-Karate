import { DEFAULT_POINTS } from './points';

// Returns list of athletes whose birthday is today
export function getAthletesWithBirthdayToday(athletes) {
  const today = new Date();
  const todayMonth = today.getMonth() + 1;   // 1-indexed
  const todayDay = today.getDate();

  return athletes.filter(athlete => {
    if (athlete.status !== 'active') return false;
    const dob = new Date(athlete.dateOfBirth);
    return dob.getMonth() + 1 === todayMonth && dob.getDate() === todayDay;
  });
}

// Check if a athlete has already received a birthday bonus this calendar year
export function hasReceivedBirthdayBonusThisYear(athlete) {
  const thisYear = new Date().getFullYear().toString();
  return athlete.achievements.some(
    a => a.type === 'birthday-bonus' && a.date.startsWith(thisYear)
  );
}

// Build the birthday achievement object to be saved
export function buildBirthdayAchievement(athlete) {
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

// TODO: In production, this function is called inside a Firebase Cloud Function
// that runs daily. It should:
// 1. Call getAthletesWithBirthdayToday(allAthletes)
// 2. For each: check hasReceivedBirthdayBonusThisYear()
// 3. If not yet received: save buildBirthdayAchievement() to the athlete record
// 4. Update pointsBalance and pointsLifetime
// 5. Send a WhatsApp/Telegram message to the athlete (notifications task)
