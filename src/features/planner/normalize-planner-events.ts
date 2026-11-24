import { initialPlannerEvents, initialStudents } from "@/data/initial-data";
import type { EventKind, LessonStatus, PlannerEvent } from "@/types/app";

const eventKinds: EventKind[] = ["personal", "focus", "lesson", "music"];
const lessonStatuses: LessonStatus[] = ["scheduled", "completed", "incomplete"];

export function normalizePlannerEvents(value: unknown): PlannerEvent[] {
  if (!Array.isArray(value)) return initialPlannerEvents;

  return value.flatMap((entry, index): PlannerEvent[] => {
    if (typeof entry !== "object" || entry === null) return [];

    const candidate = entry as Partial<PlannerEvent>;
    if (
      typeof candidate.title !== "string" ||
      typeof candidate.day !== "number" || candidate.day < 0 || candidate.day > 6 ||
      typeof candidate.start !== "number" || candidate.start < 0 || candidate.start >= 24 ||
      typeof candidate.duration !== "number" || candidate.duration <= 0 ||
      typeof candidate.kind !== "string" || !eventKinds.includes(candidate.kind as EventKind)
    ) return [];

    const kind = candidate.kind as EventKind;
    const associatedStudent = kind === "lesson"
      ? initialStudents.find(student => candidate.title?.includes(student.name))
      : undefined;
    const status = lessonStatuses.includes(candidate.status as LessonStatus)
      ? candidate.status
      : "scheduled";

    return [{
      id: candidate.id ?? `legacy-event-${index}`,
      title: candidate.title,
      day: candidate.day,
      date: typeof candidate.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(candidate.date) ? candidate.date : undefined,
      templateId: typeof candidate.templateId === "string" ? candidate.templateId : undefined,
      start: candidate.start,
      duration: candidate.duration,
      details: candidate.details,
      studentId: candidate.studentId ?? associatedStudent?.id,
      goalId: candidate.goalId,
      projectId: candidate.projectId,
      studentSchedule: Boolean(candidate.studentSchedule),
      status,
      kind,
    }];
  });
}
