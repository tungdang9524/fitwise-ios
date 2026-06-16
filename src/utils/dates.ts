// Date formatting helpers for Fitwise
export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (dateStr: string): string => {
  try {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
};

export const getDayOfWeekName = (dayIndex: number): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayIndex] || '';
};

export const calculateStreak = (
  workoutDates: string[],
  foodDates: string[]
): number => {
  const activeDates = new Set<string>([...workoutDates, ...foodDates]);
  if (activeDates.size === 0) return 0;

  const todayStr = getLocalDateString();
  
  // Calculate yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  // If neither today nor yesterday is active, streak is broken (0)
  if (!activeDates.has(todayStr) && !activeDates.has(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  const checkDate = new Date(); // Start checking from today backward

  // If today is not active but yesterday is, we start checking from yesterday backward
  if (!activeDates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const checkStr = getLocalDateString(checkDate);
    if (activeDates.has(checkStr)) {
      streak++;
      // Move back 1 day
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};
