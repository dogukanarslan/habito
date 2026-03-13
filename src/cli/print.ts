import { Habit, ISODate } from "../core/types.js";
import { HabitStats } from "../core/streaks.js";

const formatDate = (date?: ISODate): string => {
  return date ?? "-";
};

export const printHabits = (habits: Habit[]): void => {
  if (habits.length === 0) {
    console.log("No habits yet. Add one with: habito add --name \"Habit name\"");
    return;
  }

  for (const habit of habits) {
    console.log(`${habit.id}  ${habit.name}`);
  }
};

export const printStats = (stats: HabitStats[]): void => {
  if (stats.length === 0) {
    console.log("No habits to show stats for.");
    return;
  }

  for (const entry of stats) {
    const { habit, totalCompletions, currentStreak, longestStreak, lastCompletedDate } = entry;
    console.log(`${habit.id}  ${habit.name}`);
    console.log(`  Total: ${totalCompletions}`);
    console.log(`  Current streak: ${currentStreak}`);
    console.log(`  Longest streak: ${longestStreak}`);
    console.log(`  Last completed: ${formatDate(lastCompletedDate)}`);
  }
};
