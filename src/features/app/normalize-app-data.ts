import { initialGoals, initialSleepRecord, initialTransactions } from "@/data/initial-data";
import type { Goal, SleepRecord, Transaction } from "@/types/app";

const legacyDemoGoalIds = new Set(["goal-piano", "goal-reading", "goal-movement"]);
const legacyDemoTransactionIds = new Set([1, 2, 3, 4, 5, 6]);

export function normalizeGoals(value: unknown): Goal[] {
  if (!Array.isArray(value)) return initialGoals;
  return value.filter((entry): entry is Goal => {
    if (typeof entry !== "object" || entry === null) return false;
    return !legacyDemoGoalIds.has(String((entry as Partial<Goal>).id ?? ""));
  });
}

export function normalizeTransactions(value: unknown): Transaction[] {
  if (!Array.isArray(value)) return initialTransactions;
  return value.filter((entry): entry is Transaction => {
    if (typeof entry !== "object" || entry === null) return false;
    return !legacyDemoTransactionIds.has(Number((entry as Partial<Transaction>).id));
  });
}

export function normalizeSleepRecord(value: unknown): SleepRecord {
  if (typeof value !== "object" || value === null) return initialSleepRecord;
  const record = value as Partial<SleepRecord>;
  if (record.bed === "22:48" && record.wake === "06:30" && record.minutes === 462) return initialSleepRecord;
  if (typeof record.bed !== "string" || typeof record.wake !== "string" || typeof record.minutes !== "number") return initialSleepRecord;
  return { bed: record.bed, wake: record.wake, minutes: Math.max(0, Math.floor(record.minutes)) };
}
