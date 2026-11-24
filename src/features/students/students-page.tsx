"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { AppState } from "@/features/app/use-app-state";
import { formatClock } from "@/lib/time-format";
import type { PlannerEvent, Student } from "@/types/app";

export function StudentsPage({ app }: { app: AppState }) {
  const { students, filteredStudents, plannerEvents, openStudentForm, editStudent, toggleStudentPaid, removeStudent, query } = app;
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const completedLessons = plannerEvents.flatMap(event => {
    if (event.kind !== "lesson" || !event.date) return [];
    const studentIds = event.studentIds ?? (event.studentId ? [event.studentId] : []);
    return studentIds.filter(studentId => (event.studentStatuses?.[studentId] ?? event.status) === "completed")
      .map(studentId => ({ event, studentId }));
  }).sort((a, b) => (b.event.date ?? "").localeCompare(a.event.date ?? "") || b.event.start - a.event.start);

  function getCompletedCount(studentId: string) {
    return completedLessons.filter(item => item.studentId === studentId).length;
  }
  const selectedStudent = students.find(student => (student.id ?? student.name) === selectedStudentId);
  const selectedLogs = selectedStudent
    ? completedLessons.filter(item => item.studentId === (selectedStudent.id ?? selectedStudent.name))
    : [];
  const displayLogs = selectedLogs;

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
          <div className="roster-note-actions"><span className="roster-note">Tap a fee status to update payment</span></div>
        </div>
        <div className="full-student-list">
          {filteredStudents.map(student => (
            <article className="student-row full-student-row" key={student.id ?? student.name}>
              <div className={`student-avatar ${student.color}`}>{student.initials}</div>
              <div className="student-info"><button type="button" className="student-name-button" onClick={() => setSelectedStudentId(student.id ?? student.name)}>{student.name}</button><span>{student.instrument} · ₹{student.fee.toLocaleString("en-IN")} / {student.cycleCount}-class cycle</span></div>
              <div className="student-next"><small>WEEKLY CLASSES</small><b>{getWeeklySchedule(student.id ?? student.name, student.weeklyClasses, plannerEvents) || "Not scheduled"}</b></div>
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
        {completedLessons.map(({ event, studentId }) => {
          const student = students.find(item => (item.id ?? item.name) === studentId);
          if (!student) return null;
          return <article className="completed-session-row" key={`${event.id ?? `${event.day}-${event.start}-${event.title}`}-${studentId}`}>
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
          <div className="section-kicker">STUDENT CLASS LOG</div><h2 id="student-history-title">{selectedStudent.name}</h2>
          <p>{selectedStudent.instrument} · {getWeeklyClassCount(selectedStudent.id ?? selectedStudent.name, selectedStudent.weeklyClasses, plannerEvents)} classes per week</p>
          <div className="class-count-editor"><span><b>Classes taken so far</b><small>Based on the saved starting count and completed class log.</small></span><strong>{(selectedStudent.initialClasses ?? 0) + selectedLogs.length}</strong></div>
          <div className="student-history-list" aria-label="Completed class sessions">
            {displayLogs.map(({ event, studentId }) => <article className="completed-session-row" key={`${event.id ?? `${event.date}-${event.start}-${event.title}`}-${studentId}`}>
              <span className="student-avatar music-session-avatar">{selectedStudent.initials}</span>
              <span className="transaction-description"><b>{selectedStudent.name}</b><small>{event.title}{event.details ? ` · ${event.details}` : ""}</small></span>
              <span className="session-date">{new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date(`${event.date}T12:00:00`))} · {formatClock(event.start)}</span>
            </article>)}
            {displayLogs.length === 0 && <div className="empty-transactions">No completed class logs yet.</div>}
          </div>
        </section>
      </div>}
    </>
  );
}

function getWeeklySchedule(studentId: string, privateClasses: Student["weeklyClasses"], plannerEvents: PlannerEvent[]) {
  const privateTimes = privateClasses.map(item => `${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][item.day]} ${formatClock(item.start)}`);
  const groupTimes = plannerEvents.filter(event => !event.date && event.kind === "lesson" && event.studentIds?.includes(studentId))
    .map(event => `${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][event.day]} ${formatClock(event.start)}${(event.studentIds?.length ?? 0) > 1 ? " group" : " class"}`);
  return [...privateTimes, ...groupTimes].join(" · ");
}

function getWeeklyClassCount(studentId: string, privateClasses: Student["weeklyClasses"], plannerEvents: PlannerEvent[]) {
  return privateClasses.length + plannerEvents.filter(event => !event.date && event.kind === "lesson" && event.studentIds?.includes(studentId)).length;
}
