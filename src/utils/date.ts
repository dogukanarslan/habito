import { ISODate } from "../core/types.js";

export const toISODate = (input: string | Date): ISODate => {
  if (input instanceof Date) {
    return input.toISOString().slice(0, 10);
  }

  const trimmed = input.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error("Date must be in YYYY-MM-DD format");
  }

  const [y, m, d] = trimmed.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() + 1 !== m ||
    date.getUTCDate() !== d
  ) {
    throw new Error("Invalid calendar date");
  }

  return trimmed as ISODate;
};

export const todayISO = (): ISODate => {
  return toISODate(new Date());
};

export const addDays = (date: ISODate, days: number): ISODate => {
  const [y, m, d] = date.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10) as ISODate;
};
