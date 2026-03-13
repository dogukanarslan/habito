import { Completion, Habit, ISODate } from "./types.js";
import { addDays } from "../utils/date.js";

export type HabitStats = {
  habit: Habit;
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: ISODate;
};

const uniqueDates = (completions: Completion[]): ISODate[] => {
  const set = new Set<ISODate>();
  for (const completion of completions) {
    set.add(completion.date);
  }
  return Array.from(set).sort();
};

export const buildStats = (
  habit: Habit,
  completions: Completion[]
): HabitStats => {
  const dates = uniqueDates(completions);
  const totalCompletions = dates.length;

  let longestStreak = 0;
  let currentStreak = 0;
  let lastCompletedDate: ISODate | undefined;

  if (dates.length > 0) {
    lastCompletedDate = dates[dates.length - 1];
  }

  let streak = 0;
  for (let i = 0; i < dates.length; i += 1) {
    if (i === 0) {
      streak = 1;
    } else {
      const expected = addDays(dates[i - 1], 1);
      if (dates[i] === expected) {
        streak += 1;
      } else {
        streak = 1;
      }
    }

    if (streak > longestStreak) {
      longestStreak = streak;
    }
  }

  if (dates.length > 0) {
    let idx = dates.length - 1;
    currentStreak = 1;
    while (idx > 0) {
      const expected = addDays(dates[idx - 1], 1);
      if (dates[idx] === expected) {
        currentStreak += 1;
        idx -= 1;
      } else {
        break;
      }
    }
  }

  return {
    habit,
    totalCompletions,
    currentStreak,
    longestStreak,
    lastCompletedDate
  };
};
