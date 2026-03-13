import { loadData, saveData } from "../storage/file.js";
import {
  createHabit,
  addHabit,
  listHabits,
  completeHabit,
  deleteHabit,
  habitCompletions,
} from "../core/habits.js";
import { buildStats } from "../core/streaks.js";
import { printHabits, printStats } from "./print.js";
import { toISODate } from "../utils/date.js";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

const run = (): void => {
  const data = loadData();

  yargs(hideBin(process.argv))
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
      (args) => {
        const habit = createHabit(args.name);
        const next = addHabit(data, habit);
        saveData(next);
        console.log(`Added habit: ${habit.name}`);
      },
    )
    .command(
      "list",
      "List habits",
      () => undefined,
      (args) => {
        const habits = listHabits(data);
        printHabits(habits);
      },
    )
    .command(
      "done",
      "Mark habit as completed",
      (args) =>
        args
          .option("id", {
            type: "string",
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
      (args) => {
        const date = args.date ? toISODate(args.date as string) : undefined;
        const notes = args.notes ? (args.notes as string) : undefined;
        const next = completeHabit(data, args.id as string, date, notes);
        saveData(next);
        console.log("Marked complete.");
      },
    )
    .command(
      "stats",
      "Show habit stats",
      () => undefined,
      () => {
        const habits = listHabits(data);
        const stats = habits.map((habit) =>
          buildStats(habit, habitCompletions(data, habit.id)),
        );
        printStats(stats);
      },
    )
    .command(
      "delete",
      "Delete a habit",
      (args) =>
        args.option("id", {
          type: "string",
          demandOption: true,
          describe: "Habit id",
        }),
      (args) => {
        const next = deleteHabit(data, args.id as string);
        saveData(next);
        console.log("Habit deleted.");
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
    .parse();
};

try {
  run();
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exit(1);
}
