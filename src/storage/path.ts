import os from "node:os";
import path from "node:path";

export const dataDir = (): string => {
  return path.join(os.homedir(), ".habito");
};

export const dataFilePath = (): string => {
  return path.join(dataDir(), "habito.db");
};
