import { initialStudents } from "@/data/initial-data";
import type { Student } from "@/types/app";

const avatarColors: Student["color"][] = ["rose", "blue", "gold", "mint"];

export function normalizeStudents(value: unknown): Student[] {
  if (!Array.isArray(value)) return initialStudents;

  return value.flatMap((entry): Student[] => {
    if (typeof entry !== "object" || entry === null) return [];
    const candidate = entry as Partial<Student>;
    if (["student-ananya", "student-ishaan", "student-mira", "sample-student"].includes(String(candidate.id ?? ""))) return [];
    if (typeof candidate.name !== "string" || !candidate.name.trim()) return [];

    const starterStudent = initialStudents.find(student => student.name === candidate.name);
    const normalizedName = candidate.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const initials = candidate.initials || candidate.name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase();
    const cycleCount: 8 | 12 = candidate.cycleCount === 12 ? 12 : 8;
    const weeklyClasses = Array.isArray(candidate.weeklyClasses)
      ? candidate.weeklyClasses.flatMap((weeklyClass, index) => {
        if (!weeklyClass || typeof weeklyClass !== "object") return [];
        const item = weeklyClass as Partial<Student["weeklyClasses"][number]>;
        if (typeof item.day !== "number" || item.day < 0 || item.day > 6 || typeof item.start !== "number" || item.start < 0 || item.start >= 24) return [];
        return [{ id: typeof item.id === "string" ? item.id : `class-${index}`, day: item.day, start: item.start, duration: typeof item.duration === "number" && item.duration > 0 ? item.duration : 1 }];
      }).slice(0, 3)
      : starterStudent?.weeklyClasses ?? [];

    return [{
      id: candidate.id ?? starterStudent?.id ?? `student-${normalizedName}`,
      name: candidate.name.trim(),
      instrument: typeof candidate.instrument === "string" ? candidate.instrument : "Music · Student",
      address: typeof candidate.address === "string" ? candidate.address : "",
      initials,
      color: avatarColors.includes(candidate.color as Student["color"]) ? candidate.color as Student["color"] : starterStudent?.color ?? "mint",
      next: typeof candidate.next === "string" ? candidate.next : "Schedule a class",
      fee: typeof candidate.fee === "number" && candidate.fee >= 0 ? candidate.cycleCount ? candidate.fee : candidate.fee * cycleCount : 0,
      cycleCount,
      paid: Boolean(candidate.paid),
      paymentTransactionId: typeof candidate.paymentTransactionId === "string" ? candidate.paymentTransactionId : undefined,
      weeklyClasses,
      initialClasses: Math.max(0, Math.floor(Number(candidate.initialClasses) || 0)),
    }];
  });
}
