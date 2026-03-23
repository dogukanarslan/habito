import {
  deleteHabitById,
  insertCompletion,
  insertHabit,
  listCompletions,
  listHabits,
  updateHabitName
} from "../storage/db.js";
import {
  createHabit,
  habitCompletions
} from "../core/habits.js";
import { buildStats } from "../core/streaks.js";
import { printHabits, printStats } from "./print.js";
import { toISODate, todayISO } from "../utils/date.js";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

const run = async (): Promise<void> => {
  await yargs(hideBin(process.argv))
    .scriptName("habito")
    .usage("Usage: $0 <command> [options]")
    .command(
      "add",
      "Add a new habit",
      (args) =>
        args.option("name", {
          type: "string",
          demandOption: true,
          describe: "Habit name",
        }),
      async (args) => {
        const habit = createHabit(args.name);
        const createdHabit = await insertHabit(habit);
        console.log(`Added habit: ${habit.name}`);
        console.log(`Habit id: ${createdHabit.id}`);
      },
    )
    .command(
      "list",
      "List habits",
      () => undefined,
      async () => {
        const habits = await listHabits();
        printHabits(habits);
      },
    )
    .command(
      "done",
      "Mark habit as completed",
      (args) =>
        args
          .option("id", {
            type: "number",
            demandOption: true,
            describe: "Habit id",
          })
          .option("date", {
            type: "string",
            describe: "Completion date (YYYY-MM-DD)",
          })
          .option("notes", {
            type: "string",
            describe: "Optional notes",
          }),
      async (args) => {
        const date = args.date ? toISODate(args.date as string) : todayISO();
        const notes = args.notes ? (args.notes as string) : undefined;
        await insertCompletion(args.id as number, date, notes);
        console.log("Marked complete.");
      },
    )
    .command(
      "stats",
      "Show habit stats",
      () => undefined,
      async () => {
        const [habits, completions] = await Promise.all([
          listHabits(),
          listCompletions()
        ]);

        const stats = habits.map((habit) =>
          buildStats(habit, habitCompletions(completions, habit.id))
        );
        printStats(stats);
      },
    )
    .command(
      "delete",
      "Delete a habit",
      (args) =>
        args.option("id", {
          type: "number",
          demandOption: true,
          describe: "Habit id",
        }),
      async (args) => {
        await deleteHabitById(args.id as number);
        console.log("Habit deleted.");
      },
    )
    .command(
      "update",
      "Update a habit",
      (args) =>
        args
          .option("id", {
            type: "number",
            demandOption: true,
            describe: "Habit id",
          })
          .option("name", {
            type: "string",
            demandOption: true,
            describe: "New habit name",
          }),
      async (args) => {
        const habit = createHabit(args.name as string);
        await updateHabitName(args.id as number, habit.name);
        console.log("Habit updated.");
      },
    )
    .strict()
    .help()
    .fail((message, error, yargsInstance) => {
      if (error) {
        throw error;
      }
      console.error(message);
      yargsInstance.showHelp();
      process.exit(1);
    })
    .parseAsync();
};

try {
  await run();
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exit(1);
}
