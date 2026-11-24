import type { Goal, PlannerEvent, SleepRecord, Student, Transaction } from "@/types/app";

// First-run records start empty.
export const initialGoals: Goal[] = [];
export const initialStudents: Student[] = [];
export const initialTransactions: Transaction[] = [];
export const initialPlannerEvents: PlannerEvent[] = [];
export const initialSleepRecord: SleepRecord = { bed: "", wake: "", minutes: 0 };

export const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
