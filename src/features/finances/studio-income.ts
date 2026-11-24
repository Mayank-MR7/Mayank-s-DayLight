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
  return dates.reduce((forecast, date) => {
    const sessions = getEventsForDate(plannerEvents, date).filter(event => event.kind === "lesson" && event.studentSchedule);
    sessions.forEach(session => {
      const student = students.find(item => (item.id ?? item.name) === session.studentId);
      if (!student || student.cycleCount <= 0) return;

      const classValue = student.fee / student.cycleCount;
      forecast.scheduledClasses += 1;
      forecast.scheduledValue += classValue;
      if (session.status === "completed") forecast.completedClasses += 1;
      if (session.status === "incomplete") {
        forecast.missedClasses += 1;
        forecast.missedValue += classValue;
      }
    });
    return forecast;
  }, emptyForecast());
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
