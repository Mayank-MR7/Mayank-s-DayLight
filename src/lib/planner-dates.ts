import type { PlannerEvent } from "@/types/app";

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Expand weekly templates for a date and merge that date's saved attendance or exception. */
export function getEventsForDate(events: PlannerEvent[], date: Date): PlannerEvent[] {
  const dateKey = toDateKey(date);
  const weekday = (date.getDay() + 6) % 7;
  const datedEvents = events.filter(event => event.date === dateKey);
  const recurringEvents = events.filter(event => !event.date && event.day === weekday).map(event => {
    const override = datedEvents.find(item => item.templateId === event.id);
    return {
      ...event,
      ...override,
      id: event.id,
      date: dateKey,
      templateId: event.id,
      status: override?.status ?? event.status ?? "scheduled",
      studentStatuses: override?.studentStatuses,
    };
  });
  const oneOffEvents = datedEvents.filter(event => !event.templateId);

  return [...recurringEvents, ...oneOffEvents].sort((a, b) => a.start - b.start);
}
