import fs from "node:fs";
import { DataFile } from "../core/types.js";
import { dataDir, dataFilePath } from "./path.js";

const CURRENT_VERSION = 1;

const defaultData = (): DataFile => {
  return {
    version: CURRENT_VERSION,
    habits: [],
    completions: []
  };
};

export const loadData = (): DataFile => {
  const filePath = dataFilePath();
  if (!fs.existsSync(filePath)) {
    return defaultData();
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as DataFile;

  if (typeof parsed.version !== "number") {
    return defaultData();
  }

  return {
    version: parsed.version,
    habits: Array.isArray(parsed.habits) ? parsed.habits : [],
    completions: Array.isArray(parsed.completions) ? parsed.completions : []
  };
};

export const saveData = (data: DataFile): void => {
  const dir = dataDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = dataFilePath();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};
