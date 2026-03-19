import { DEFAULT_POINTS } from './points';

// Returns list of students whose birthday is today
export function getStudentsWithBirthdayToday(students) {
  const today = new Date();
  const todayMonth = today.getMonth() + 1;   // 1-indexed
  const todayDay = today.getDate();

  return students.filter(student => {
    if (student.status !== 'active') return false;
    const dob = new Date(student.dateOfBirth);
    return dob.getMonth() + 1 === todayMonth && dob.getDate() === todayDay;
  });
}

// Check if a student has already received a birthday bonus this calendar year
export function hasReceivedBirthdayBonusThisYear(student) {
  const thisYear = new Date().getFullYear().toString();
  return student.achievements.some(
    a => a.type === 'birthday-bonus' && a.date.startsWith(thisYear)
  );
}

// Build the birthday achievement object to be saved
export function buildBirthdayAchievement(student) {
  const year = new Date().getFullYear();
  return {
    id: `birthday-${student.id}-${year}`,
    type: 'birthday-bonus',
    date: new Date().toISOString().split('T')[0],
    title: `Birthday Bonus ${year}`,
    description: `Happy Birthday from SKF Karate! Enjoy your points. Oss!`,
    pointsAwarded: DEFAULT_POINTS['birthday-bonus'],
  };
}

// TODO: In production, this function is called inside a Firebase Cloud Function
// that runs daily. It should:
// 1. Call getStudentsWithBirthdayToday(allStudents)
// 2. For each: check hasReceivedBirthdayBonusThisYear()
// 3. If not yet received: save buildBirthdayAchievement() to the student record
// 4. Update pointsBalance and pointsLifetime
// 5. Send a WhatsApp/Telegram message to the student (notifications task)
