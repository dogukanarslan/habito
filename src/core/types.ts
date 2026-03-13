export type ISODate = string;

export type HabitId = string;

export type Habit = {
  id: HabitId;
  name: string;
  createdAt: string;
};

export type Completion = {
  habitId: HabitId;
  date: ISODate;
  notes?: string;
};

export type DataFile = {
  version: number;
  habits: Habit[];
  completions: Completion[];
};
