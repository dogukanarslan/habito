import { Completion, DataFile, Habit, HabitId, ISODate } from "./types.js";
import { todayISO } from "../utils/date.js";

export const createHabit = (name: string): Habit => {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new Error("Habit name cannot be empty");
  }

  return {
    id: crypto.randomUUID(),
    name: trimmed,
    createdAt: new Date().toISOString()
  };
};

export const addHabit = (data: DataFile, habit: Habit): DataFile => {
  return {
    ...data,
    habits: [...data.habits, habit]
  };
};

export const listHabits = (data: DataFile): Habit[] => {
  return [...data.habits];
};

export const findHabit = (data: DataFile, id: HabitId): Habit => {
  const habit = data.habits.find((item) => item.id === id);
  if (!habit) {
    throw new Error(`Habit not found: ${id}`);
  }
  return habit;
};

export const completeHabit = (
  data: DataFile,
  habitId: HabitId,
  date?: ISODate,
  notes?: string
): DataFile => {
  findHabit(data, habitId);

  const completionDate = date ?? todayISO();
  const exists = data.completions.some(
    (completion) => completion.habitId === habitId && completion.date === completionDate
  );
  if (exists) {
    throw new Error("Already completed for this date");
  }

  const completion: Completion = {
    habitId,
    date: completionDate,
    notes
  };

  return {
    ...data,
    completions: [...data.completions, completion]
  };
};

export const deleteHabit = (data: DataFile, habitId: HabitId): DataFile => {
  findHabit(data, habitId);

  return {
    ...data,
    habits: data.habits.filter((habit) => habit.id !== habitId),
    completions: data.completions.filter((completion) => completion.habitId !== habitId)
  };
};

export const updateHabit = (
  data: DataFile,
  habitId: HabitId,
  name: string
): DataFile => {
  const habit = findHabit(data, habitId);
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new Error("Habit name cannot be empty");
  }

  return {
    ...data,
    habits: data.habits.map((item) =>
      item.id === habit.id ? { ...item, name: trimmed } : item
    )
  };
};

export const habitCompletions = (
  data: DataFile,
  habitId: HabitId
): Completion[] => {
  return data.completions.filter((completion) => completion.habitId === habitId);
};
