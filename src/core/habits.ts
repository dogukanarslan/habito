import { Completion, HabitId, NewHabit } from "./types.js";

export const createHabit = (name: string): NewHabit => {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new Error("Habit name cannot be empty");
  }

  return {
    name: trimmed
  };
};

export const habitCompletions = (
  completions: Completion[],
  habitId: HabitId
): Completion[] => {
  return completions.filter((completion) => completion.habitId === habitId);
};
