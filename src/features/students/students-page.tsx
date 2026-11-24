"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { AppState } from "@/features/app/use-app-state";
import type { PlannerEvent, Student } from "@/types/app";
import { formatClock } from "@/lib/time-format";

const sampleStudent: Student = {
  id: "sample-student", name: "Aarav Patel", instrument: "Piano · Beginner", address: "", initials: "AP",
  color: "mint", next: "Schedule a class", fee: 6000, cycleCount: 8, paid: false, initialClasses: 1,
  weeklyClasses: [{ id: "sample-mon", day: 0, start: 16, duration: 1 }, { id: "sample-thu", day: 3, start: 17, duration: 1 }],
};
const sampleClassLogs: PlannerEvent[] = [
  { id: "sample-log-1", day: 0, date: "2026-11-09", start: 16, duration: 1, title: "Piano class", studentId: sampleStudent.id, status: "completed", kind: "lesson" },
  { id: "sample-log-2", day: 3, date: "2026-11-12", start: 17, duration: 1, title: "Piano class", studentId: sampleStudent.id, status: "completed", kind: "lesson" },
  { id: "sample-log-3", day: 0, date: "2026-11-16", start: 16, duration: 1, title: "Piano class", studentId: sampleStudent.id, status: "completed", kind: "lesson" },
  { id: "sample-log-4", day: 3, date: "2026-11-19", start: 17, duration: 1, title: "Piano class", studentId: sampleStudent.id, status: "completed", kind: "lesson" },
];

export function StudentsPage({ app }: { app: AppState }) {
  const { students, filteredStudents, plannerEvents, openStudentForm, editStudent, toggleStudentPaid, removeStudent, query } = app;
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const completedLessons = plannerEvents
    .filter(event => event.kind === "lesson" && event.status === "completed" && event.studentId && event.date)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || b.start - a.start);

  function getCompletedCount(studentId: string) {
    return completedLessons.filter(event => event.studentId === studentId).length;
  }
  const isSamplePreview = selectedStudentId === sampleStudent.id;
  const selectedStudent = isSamplePreview ? sampleStudent : students.find(student => (student.id ?? student.name) === selectedStudentId);
  const selectedLogs = selectedStudent ? isSamplePreview ? [...sampleClassLogs].reverse() : completedLessons.filter(event => event.studentId === (selectedStudent.id ?? selectedStudent.name)) : [];
  const previewLogs = selectedStudent && selectedLogs.length < 4
    ? createPreviewLogs(selectedStudent, selectedLogs, 4 - selectedLogs.length)
    : [];
  const displayLogs = [...selectedLogs, ...previewLogs].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || b.start - a.start);

  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"/> YOUR MUSIC STUDIO</div>
          <h1>Your students, <em>your rhythm.</em></h1>
          <p className="welcome-sub">Keep track of lessons, fees, and who’s ready for their next class.</p>
        </div>
        <button className="primary-button" onClick={openStudentForm}><Icon name="plus" size={17}/> Add student</button>
      </div>

      <section className="panel full-list-panel">
        <div className="panel-heading">
          <div><div className="section-kicker">STUDENT ROSTER</div><h2>{students.length} students</h2></div>
          <div className="roster-note-actions"><span className="roster-note">Tap a fee status to update payment</span><button className="student-edit-button" onClick={() => setSelectedStudentId(sampleStudent.id!)}>View sample log</button></div>
        </div>
        <div className="full-student-list">
          {filteredStudents.map(student => (
            <article className="student-row full-student-row" key={student.id ?? student.name}>
              <div className={`student-avatar ${student.color}`}>{student.initials}</div>
              <div className="student-info"><button type="button" className="student-name-button" onClick={() => setSelectedStudentId(student.id ?? student.name)}>{student.name}</button><span>{student.instrument} · ₹{student.fee.toLocaleString("en-IN")} / {student.cycleCount}-class cycle</span></div>
              <div className="student-next"><small>WEEKLY CLASSES</small><b>{student.weeklyClasses.map(item => `${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][item.day]} ${formatClock(item.start)}`).join(" · ") || "Not scheduled"}</b></div>
              <div className="student-classes"><small>COMPLETED</small><b>{(student.initialClasses ?? 0) + getCompletedCount(student.id ?? student.name)} classes</b></div>
              <button className={`fee-state ${student.paid ? "paid" : "due"} fee-action`} onClick={() => toggleStudentPaid(student)}>
                {student.paid ? "Paid · mark due" : "Payment due · mark paid"}
              </button>
              <button className="student-edit-button" onClick={() => editStudent(student)}>Edit</button>
              <button className="row-action danger-action" onClick={() => removeStudent(student)} aria-label={`Remove ${student.name}`}><Icon name="close" size={15}/></button>
            </article>
          ))}
        </div>
        {filteredStudents.length === 0 && <div className="empty-transactions">No students match “{query}”.</div>}
      </section>

      <section className="panel class-history-panel">
        <div className="panel-heading"><div><div className="section-kicker">MUSIC STUDIO</div><h2>Completed class sessions</h2></div><span className="roster-note">Completed sessions are counted in each student’s record.</span></div>
        {completedLessons.map(event => {
          const student = students.find(item => (item.id ?? item.name) === event.studentId);
          if (!student) return null;
          return <article className="completed-session-row" key={event.id ?? `${event.studentId}-${event.day}-${event.start}-${event.title}`}>
            <span className="student-avatar music-session-avatar">{student.initials}</span>
            <span className="transaction-description"><button type="button" className="student-name-button" onClick={() => setSelectedStudentId(student.id ?? student.name)}>{student.name}</button><small>{event.title}{event.details ? ` · ${event.details}` : ""}</small></span>
            <span className="session-date">{new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${event.date}T12:00:00`))} · {formatClock(event.start)}</span>
            <span className="fee-state paid">Complete</span>
          </article>;
        })}
        {completedLessons.length === 0 && <div className="empty-transactions">Completed lesson sessions will appear here and count toward each student’s total.</div>}
      </section>
      {selectedStudent && <div className="modal-backdrop student-history-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setSelectedStudentId(null); }}>
        <section className="modal-card student-history-modal" role="dialog" aria-modal="true" aria-labelledby="student-history-title">
          <button type="button" className="modal-close" onClick={() => setSelectedStudentId(null)} aria-label="Close class history"><Icon name="close"/></button>
          <div className="section-kicker">{isSamplePreview ? "SAMPLE CLASS LOG · PREVIEW ONLY" : previewLogs.length ? "STUDENT CLASS LOG · SAMPLE ENTRIES MARKED" : "STUDENT CLASS LOG"}</div><h2 id="student-history-title">{selectedStudent.name}</h2>
          <p>{selectedStudent.instrument} · {selectedStudent.weeklyClasses.length} classes per week</p>
          <div className="class-count-editor"><span><b>Classes taken so far</b><small>{previewLogs.length ? "Includes sample preview entries shown below." : "Based on the saved starting count and completed class log."}</small></span><strong>{(selectedStudent.initialClasses ?? 0) + selectedLogs.length + previewLogs.length}</strong></div>
          <div className="student-history-list" aria-label="Completed class sessions">
            {displayLogs.map(event => <article className="completed-session-row" key={event.id ?? `${event.date}-${event.start}-${event.title}`}>
              <span className="student-avatar music-session-avatar">{selectedStudent.initials}</span>
              <span className="transaction-description"><b>{selectedStudent.name}</b><small>{event.title}{event.details ? ` · ${event.details}` : ""}{event.id?.startsWith("preview-") ? " · Sample preview" : ""}</small></span>
              <span className="session-date">{new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date(`${event.date}T12:00:00`))} · {formatClock(event.start)}</span>
            </article>)}
            {selectedLogs.length === 0 && displayLogs.length === 0 && <div className="empty-transactions">No completed class logs yet.</div>}
          </div>
        </section>
      </div>}
    </>
  );
}

function createPreviewLogs(student: Student, existingLogs: PlannerEvent[], amount: number): PlannerEvent[] {
  const schedule = student.weeklyClasses.length ? student.weeklyClasses : [{ id: "preview-default", day: 0, start: 16, duration: 1 }];
  const recorded = new Set(existingLogs.map(event => `${event.date}-${event.start}`));
  const previews: PlannerEvent[] = [];
  const now = new Date();
  for (let offset = 1; offset <= 120 && previews.length < amount; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const day = (date.getDay() + 6) % 7;
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    for (const weeklyClass of schedule.filter(item => item.day === day)) {
      if (previews.length >= amount) break;
      if (recorded.has(`${dateKey}-${weeklyClass.start}`)) continue;
      previews.push({
        id: `preview-${student.id ?? student.name}-${dateKey}-${weeklyClass.id}`,
        date: dateKey, day, start: weeklyClass.start, duration: weeklyClass.duration,
        title: `${student.instrument.split(" · ")[0]} class`, studentId: student.id ?? student.name,
        status: "completed", kind: "lesson",
      });
    }
  }
  return previews;
}
