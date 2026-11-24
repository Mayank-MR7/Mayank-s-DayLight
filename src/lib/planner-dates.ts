import type { PlannerEvent } from "@/types/app";

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Mix exact-date sessions with legacy weekly repeats, suppressing a repeat when it has a dated instance. */
export function getEventsForDate(events: PlannerEvent[], date: Date): PlannerEvent[] {
  const dateKey = toDateKey(date);
  const weekday = (date.getDay() + 6) % 7;
  const datedEvents = events.filter(event => event.date === dateKey);
  const completedRepeats = new Set(datedEvents.map(event => event.templateId).filter((id): id is string => Boolean(id)));
  const recurringEvents = events.filter(event => !event.date && event.day === weekday && (!event.id || !completedRepeats.has(event.id)));

  return [...recurringEvents, ...datedEvents].sort((a, b) => a.start - b.start);
}
