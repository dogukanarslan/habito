export type ISODate = string;

export type HabitId = number;

export type Habit = {
  id: HabitId;
  name: string;
  createdAt: string;
};

export type NewHabit = Pick<Habit, "name">;

export type Completion = {
  habitId: HabitId;
  date: ISODate;
  notes?: string;
};
