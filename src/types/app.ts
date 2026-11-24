export type IconName =
  | "grid" | "calendar" | "target" | "music" | "chart" | "settings"
  | "search" | "plus" | "chevron" | "sun" | "moon" | "clock"
  | "check" | "more" | "arrow" | "spark" | "bell" | "close" | "logout";

export type AppSection = "Overview" | "Planner" | "My goals" | "Finances" | "Students" | "Insights";
export type GoalPeriod = "Today" | "This week" | "This month";
export type FinanceFilter = "All activity" | "Income" | "Expenses" | "Savings";
export type TransactionType = "income" | "expense" | "saving";
export type FinancePeriod = "week" | "month";
export type EventKind = "personal" | "focus" | "lesson" | "music";
export type LessonStatus = "scheduled" | "completed" | "incomplete" | "cancelled" | "rescheduled";

export interface Goal {
  id?: string;
  title: string;
  category: string;
  done: number;
  total: number;
  tint: "lavender" | "mint" | "peach";
  icon: string;
  mins: number;
  period: GoalPeriod;
  dailyTargetMinutes?: number;
  durationDays?: number;
  startDate?: string;
  /** ISO timestamp while a goal timer is running. */
  timerStartedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  targetHours: number;
  dailyTargetMinutes: number;
  manualMinutes: number;
  createdAt: string;
  /** ISO timestamp while a project timer is running. */
  timerStartedAt?: string;
}

export interface Student {
  id?: string;
  name: string;
  instrument: string;
  address: string;
  initials: string;
  color: "rose" | "blue" | "gold" | "mint";
  next: string;
  fee: number;
  cycleCount: 8 | 12;
  paid: boolean;
  paymentTransactionId?: string;
  weeklyClasses: WeeklyClass[];
  /** Manually entered classes before detailed attendance logging began. */
  initialClasses?: number;
}

export interface WeeklyClass {
  id: string;
  day: number;
  start: number;
  duration: number;
}

export interface Transaction {
  id: string | number;
  title: string;
  category: string;
  amount: number;
  type: TransactionType;
  date: string;
  dateKey?: string;
}

export interface Emi {
  id: string;
  title: string;
  amount: number;
  dueDay: number;
  startDate: string;
  months: number;
  paidDates: string[];
}

export interface PlannerEvent {
  id?: string;
  day: number;
  /** Local calendar date for a one-off session; absent means a legacy weekly repeat. */
  date?: string;
  templateId?: string;
  start: number;
  duration: number;
  title: string;
  details?: string;
  studentId?: string;
  /** Students attending a shared lesson. Their attendance is tracked individually. */
  studentIds?: string[];
  /** Attendance overrides for a dated occurrence of a group lesson. */
  studentStatuses?: Record<string, LessonStatus>;
  goalId?: string;
  projectId?: string;
  studentSchedule?: boolean;
  status?: LessonStatus;
  kind: EventKind;
}

export interface SleepRecord {
  bed: string;
  wake: string;
  minutes: number;
  /** ISO timestamp while the sleep timer is running. */
  startedAt?: string;
}
