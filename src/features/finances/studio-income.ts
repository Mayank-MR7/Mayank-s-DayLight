import { getEventsForDate } from "@/lib/planner-dates";
import type { PlannerEvent, Student } from "@/types/app";

export interface StudioIncomeForecast {
  scheduledClasses: number;
  completedClasses: number;
  missedClasses: number;
  scheduledValue: number;
  missedValue: number;
  projectedValue: number;
}

function emptyForecast(): StudioIncomeForecast {
  return { scheduledClasses: 0, completedClasses: 0, missedClasses: 0, scheduledValue: 0, missedValue: 0, projectedValue: 0 };
}

export function getStudioIncomeForecast(students: Student[], plannerEvents: PlannerEvent[], dates: Date[]): StudioIncomeForecast {
  const forecast = dates.reduce((total, date) => {
    const sessions = getEventsForDate(plannerEvents, date).filter(event => event.kind === "lesson");
    sessions.forEach(session => {
      const studentIds = session.studentIds ?? (session.studentId ? [session.studentId] : []);
      studentIds.forEach(studentId => {
        const student = students.find(item => (item.id ?? item.name) === studentId);
        if (!student || student.cycleCount <= 0) return;
        const status = session.studentStatuses?.[studentId] ?? session.status ?? "scheduled";
        if (status === "rescheduled") return;

        const classValue = student.fee / student.cycleCount;
        total.scheduledClasses += 1;
        total.scheduledValue += classValue;
        if (status === "completed") total.completedClasses += 1;
        if (status === "incomplete" || status === "cancelled") {
          total.missedClasses += 1;
          total.missedValue += classValue;
        }
      });
    });
    return total;
  }, emptyForecast());
  forecast.projectedValue = forecast.scheduledValue - forecast.missedValue;
  return forecast;
}

export function getCurrentWeekDates(referenceDate: Date): Date[] {
  const monday = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index));
}

export function getCurrentMonthDates(referenceDate: Date): Date[] {
  const lastDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0).getDate();
  return Array.from({ length: lastDay }, (_, index) => new Date(referenceDate.getFullYear(), referenceDate.getMonth(), index + 1));
}

export function getCurrentMonthWeeks(referenceDate: Date): Date[][] {
  const firstOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const firstMonday = new Date(firstOfMonth);
  firstMonday.setDate(firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7));
  const weeks: Date[][] = [];

  for (let week = 0; week < 6; week += 1) {
    const dates = Array.from({ length: 7 }, (_, day) => new Date(firstMonday.getFullYear(), firstMonday.getMonth(), firstMonday.getDate() + week * 7 + day))
      .filter(date => date.getMonth() === referenceDate.getMonth());
    if (dates.length === 0) break;
    weeks.push(dates);
  }

  return weeks;
}
