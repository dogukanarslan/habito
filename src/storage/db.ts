import fs from "node:fs";
import { createClient, type Client } from "@libsql/client";
import {
  type Completion,
  type Habit,
  type HabitId,
  type ISODate,
  type NewHabit
} from "../core/types.js";
import { dataDir, dataFilePath } from "./path.js";

const ensureDataDir = (): void => {
  const dir = dataDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createDbClient = (): Client => {
  ensureDataDir();

  return createClient({
    url: `file:${dataFilePath()}`
  });
};

const initializeDb = async (client: Client): Promise<void> => {
  await client.execute("PRAGMA foreign_keys = ON");
  await client.execute(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS completions (
      habit_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      PRIMARY KEY (habit_id, date),
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    )
  `);
};

export const listHabits = async (): Promise<Habit[]> => {
  const client = createDbClient();

  try {
    await initializeDb(client);

    const result = await client.execute(
      "SELECT id, name, created_at FROM habits ORDER BY created_at ASC, id ASC"
    );

    return result.rows.map((row) => {
      const habitRow = row as Record<string, unknown>;

      return {
        id: Number(habitRow.id),
        name: String(habitRow.name),
        createdAt: String(habitRow.created_at)
      };
    });
  } finally {
    client.close();
  }
};

export const listCompletions = async (): Promise<Completion[]> => {
  const client = createDbClient();

  try {
    await initializeDb(client);

    const result = await client.execute(
      "SELECT habit_id, date, notes FROM completions ORDER BY date ASC, habit_id ASC"
    );

    return result.rows.map((row) => {
      const completionRow = row as Record<string, unknown>;

      return {
        habitId: Number(completionRow.habit_id),
        date: String(completionRow.date) as ISODate,
        notes:
          completionRow.notes == null ? undefined : String(completionRow.notes)
      };
    });
  } finally {
    client.close();
  }
};

export const insertHabit = async (habit: NewHabit): Promise<Habit> => {
  const client = createDbClient();

  try {
    await initializeDb(client);

    const result = await client.execute({
      sql: `
        INSERT INTO habits (name)
        VALUES (?)
      `,
      args: [habit.name]
    });
    const habitId = result.lastInsertRowid;

    if (habitId == null) {
      throw new Error("Failed to create habit");
    }

    const insertedHabit = await client.execute({
      sql: `
        SELECT id, name, created_at
        FROM habits
        WHERE id = ?
        LIMIT 1
      `,
      args: [Number(habitId)]
    });
    const row = insertedHabit.rows[0];

    if (row == null) {
      throw new Error("Failed to load created habit");
    }

    const habitRow = row as Record<string, unknown>;

    return {
      id: Number(habitRow.id),
      name: String(habitRow.name),
      createdAt: String(habitRow.created_at)
    };
  } finally {
    client.close();
  }
};

export const insertCompletion = async (
  habitId: HabitId,
  date: ISODate,
  notes?: string
): Promise<void> => {
  const client = createDbClient();

  try {
    await initializeDb(client);

    const habitResult = await client.execute({
      sql: "SELECT id FROM habits WHERE id = ? LIMIT 1",
      args: [habitId]
    });

    if (habitResult.rows.length === 0) {
      throw new Error(`Habit not found: ${habitId}`);
    }

    try {
      await client.execute({
        sql: `
          INSERT INTO completions (habit_id, date, notes)
          VALUES (?, ?, ?)
        `,
        args: [habitId, date, notes ?? null]
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("SQLITE_CONSTRAINT")) {
        throw new Error("Already completed for this date");
      }
      throw error;
    }
  } finally {
    client.close();
  }
};

export const updateHabitName = async (
  habitId: HabitId,
  name: string
): Promise<void> => {
  const client = createDbClient();

  try {
    await initializeDb(client);

    const result = await client.execute({
      sql: `
        UPDATE habits
        SET name = ?
        WHERE id = ?
      `,
      args: [name, habitId]
    });

    if (result.rowsAffected === 0) {
      throw new Error(`Habit not found: ${habitId}`);
    }
  } finally {
    client.close();
  }
};

export const deleteHabitById = async (habitId: HabitId): Promise<void> => {
  const client = createDbClient();

  try {
    await initializeDb(client);

    const result = await client.execute({
      sql: "DELETE FROM habits WHERE id = ?",
      args: [habitId]
    });

    if (result.rowsAffected === 0) {
      throw new Error(`Habit not found: ${habitId}`);
    }
  } finally {
    client.close();
  }
};
