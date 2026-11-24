import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { weekdays } from "@/data/initial-data";
import type { AppState } from "@/features/app/use-app-state";
import { formatClock } from "@/lib/time-format";
import { getEventsForDate } from "@/lib/planner-dates";
import type { LessonStatus, PlannerEvent, Student } from "@/types/app";

const HOUR_HEIGHT = 56;

function getEventEnd(event: PlannerEvent) {
  return formatClock(event.start + event.duration);
}

export function PlannerPage({ app }: { app: AppState }) {
  const [rescheduleTarget, setRescheduleTarget] = useState<{ event: PlannerEvent; date: Date; studentId?: string } | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("10:00");
  const {
    plannerView, setPlannerView, selectedPlannerDate, setSelectedPlannerDate,
    plannerWeekDates, plannerWeekLabel, plannerMonthDates, plannerMonthLabel, plannerEvents, students,
    removePlannerEvent, updateEventStatus, rescheduleLesson, openEventForm, today,
  } = app;

  const dayEvents = getEventsForDate(plannerEvents, selectedPlannerDate);
  const weekEvents = plannerWeekDates.flatMap(date => getEventsForDate(plannerEvents, date).map(event => ({ event, date })))
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.event.start - b.event.start);

  const heading = plannerView === "Day"
    ? new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(selectedPlannerDate)
    : plannerView === "Week" ? plannerWeekLabel : plannerMonthLabel;

  function moveSelection(amount: number) {
    if (plannerView === "Day") {
      setSelectedPlannerDate(current => new Date(current.getFullYear(), current.getMonth(), current.getDate() + amount));
    } else if (plannerView === "Week") {
      setSelectedPlannerDate(current => new Date(current.getFullYear(), current.getMonth(), current.getDate() + amount * 7));
    } else {
      setSelectedPlannerDate(current => new Date(current.getFullYear(), current.getMonth() + amount, 1));
    }
  }

  function goToToday() {
    setSelectedPlannerDate(today);
  }

  function openReschedule(event: PlannerEvent, date: Date, studentId?: string) {
    setRescheduleTarget({ event, date, studentId });
    setRescheduleDate(event.date ?? toLocalDateKey(date));
    setRescheduleTime(`${String(Math.floor(event.start)).padStart(2, "0")}:${String(Math.round((event.start % 1) * 60)).padStart(2, "0")}`);
  }

  function saveReschedule(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!rescheduleTarget) return;
    const [hour, minute] = rescheduleTime.split(":").map(Number);
    rescheduleLesson(rescheduleTarget.event, rescheduleTarget.date, rescheduleDate, hour + minute / 60, rescheduleTarget.studentId);
    setRescheduleTarget(null);
  }

  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"/> MAKE SPACE FOR WHAT MATTERS</div>
          <h1>Your time, <em>thoughtfully planned.</em></h1>
          <p className="welcome-sub">Add appointments, music lessons, and blocks of time for yourself.</p>
        </div>
        <button className="primary-button" onClick={() => openEventForm(selectedPlannerDate)}><Icon name="plus" size={17}/> Add event</button>
      </div>

      <section className="panel full-list-panel planner-page-panel">
        <div className="panel-heading planner-page-heading">
          <div><div className="section-kicker">YOUR PLANNER</div><h2>{heading}</h2></div>
          <div className="planner-controls">
            <div className="planner-week-controls">
              <button className="icon-button" aria-label={`Previous ${plannerView.toLowerCase()}`} onClick={() => moveSelection(-1)}>‹</button>
              <button className="subtle-button" onClick={goToToday}>Today</button>
              <button className="icon-button" aria-label={`Next ${plannerView.toLowerCase()}`} onClick={() => moveSelection(1)}>›</button>
            </div>
            <div className="segmented">
              {(["Day", "Week", "Month"] as const).map(view => <button className={plannerView === view ? "selected" : ""} key={view} onClick={() => setPlannerView(view)}>{view}</button>)}
            </div>
          </div>
        </div>

        {plannerView === "Day" && <DayTimeline events={dayEvents} students={students} onRemove={removePlannerEvent} onStatusChange={updateEventStatus} onReschedule={openReschedule} onAddAtSlot={(event, date) => openEventForm(date, event)} date={selectedPlannerDate}/>}

        {plannerView === "Week" && (
          <div className="planner-agenda">
            {weekEvents.map(({ event, date }) => {
              return (
                <article className={`agenda-row task-${event.status ?? "scheduled"}`} key={`${event.id ?? `${event.title}-${event.day}-${event.start}`}-${date.toISOString()}`}>
                  <button className="agenda-date agenda-date-button" onClick={() => { setSelectedPlannerDate(date); setPlannerView("Day"); }} aria-label={`View ${weekdays[event.day]} ${date.getDate()}`}>
                    <b>{weekdays[event.day]}</b><small>{date.getDate()}</small>
                  </button>
                  <span className={`legend-dot ${event.kind === "lesson" ? "lesson-dot" : event.kind === "focus" ? "focus-dot" : "personal-dot"}`}/>
                  <div className="agenda-title"><b>{getDisplayTitle(event, students)}</b><small>{formatClock(event.start)} – {getEventEnd(event)}{event.details ? ` · ${event.details}` : ""}</small></div>
                  <EventAttendance event={event} students={students} onStatusChange={(status, studentId) => updateEventStatus(event, status, date, studentId)} onReschedule={studentId => openReschedule(event, date, studentId)} onAddAtSlot={() => openEventForm(date, event)}/>
                  {event.kind === "lesson" && !event.studentIds?.length && <button className="event-reschedule-button" onClick={() => openReschedule(event, date)}>Move</button>}
                  {canRemovePlannerEvent(event) && <button className="row-action danger-action" onClick={() => removePlannerEvent(event)} aria-label={event.studentSchedule && event.templateId ? `Remove weekly group schedule ${event.title}` : `Remove ${event.title}`}><Icon name="close" size={15}/></button>}
                </article>
              );
            })}
            {weekEvents.length === 0 && <div className="empty-transactions">Your week is open. Add your first event.</div>}
          </div>
        )}

        {plannerView === "Month" && (
          <div className="planner-month-list">
            <div className="month-weekdays">{weekdays.map(day => <span key={day}>{day}</span>)}</div>
            <div className="month-grid">
              {plannerMonthDates.map(date => {
                const eventsOnDate = getEventsForDate(plannerEvents, date);
                return (
                  <button
                    className={`month-date ${date.toDateString() === selectedPlannerDate.toDateString() ? "month-today" : ""} ${date.getMonth() !== selectedPlannerDate.getMonth() ? "outside" : ""}`}
                    key={date.toISOString()}
                    onClick={() => { setSelectedPlannerDate(date); setPlannerView("Day"); }}
                    aria-label={`${new Intl.DateTimeFormat("en", { month: "long", day: "numeric" }).format(date)}, ${eventsOnDate.length} events`}
                  >
                    {date.getDate()}{eventsOnDate.length > 0 && <i/>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {rescheduleTarget && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setRescheduleTarget(null); }}>
        <form className="modal-card reschedule-modal-card" onSubmit={saveReschedule}>
          <button type="button" className="modal-close" onClick={() => setRescheduleTarget(null)} aria-label="Close reschedule dialog"><Icon name="close"/></button>
          <div className="section-kicker">KEEP THE WEEKLY ROUTINE</div><h2>Reschedule this class</h2>
          <p>This moves only this occurrence. The usual weekly class stays on the planner.</p>
          <label>New date<input type="date" required value={rescheduleDate} onChange={event => setRescheduleDate(event.target.value)}/></label>
          <label>New start time<input type="time" required value={rescheduleTime} onChange={event => setRescheduleTime(event.target.value)}/></label>
          <button className="primary-button modal-submit" type="submit">Save new class time <Icon name="arrow" size={15}/></button>
        </form>
      </div>}
    </>
  );
}

function DayTimeline({ events, students, onRemove, onStatusChange, onReschedule, onAddAtSlot, date }: { events: PlannerEvent[]; students: Student[]; onRemove: (event: PlannerEvent) => void; onStatusChange: (event: PlannerEvent, status: LessonStatus, date?: Date, studentId?: string) => void; onReschedule: (event: PlannerEvent, date: Date, studentId?: string) => void; onAddAtSlot: (event: PlannerEvent, date: Date) => void; date: Date }) {
  return (
    <div className="day-timeline" aria-label="Daily schedule from midnight to midnight">
      <div className="day-hour-labels">
        {Array.from({ length: 24 }, (_, hour) => (
          <div className="day-hour-label" key={hour}><span>{formatClock(hour).replace(":00", "")}</span></div>
        ))}
        <div className="day-midnight-label">12 AM</div>
      </div>
      <div className="day-timeline-canvas">
        {events.map(event => (
          <article
            className={`day-timeline-event ${event.kind} task-${event.status ?? "scheduled"}`}
            key={event.id ?? `${event.title}-${event.day}-${event.start}`}
            style={{ top: `${event.start * HOUR_HEIGHT + 3}px`, height: `${Math.max(26, event.duration * HOUR_HEIGHT - 6)}px` }}
          >
            <div className="day-event-copy">
              <b>{getDisplayTitle(event, students)}</b>
              <span>{formatClock(event.start)} – {getEventEnd(event)}</span>
              {event.details && <small>{event.details}</small>}
            </div>
            <EventAttendance event={event} students={students} onStatusChange={(status, studentId) => onStatusChange(event, status, date, studentId)} onReschedule={studentId => onReschedule(event, date, studentId)} onAddAtSlot={() => onAddAtSlot(event, date)}/>
            {event.kind === "lesson" && !event.studentIds?.length && <button className="event-reschedule-button" onClick={() => onReschedule(event, date)}>Move</button>}
            {canRemovePlannerEvent(event) && <button className="row-action danger-action" onClick={() => onRemove(event)} aria-label={event.studentSchedule && event.templateId ? `Remove weekly group schedule ${event.title}` : `Remove ${event.title}`}><Icon name="close" size={14}/></button>}
          </article>
        ))}
        {events.length === 0 && <div className="day-empty-state">No events on this day. Leave it open or add a plan.</div>}
      </div>
    </div>
  );
}

function getDisplayTitle(event: PlannerEvent, students: Student[]) {
  if (event.studentIds?.length) {
    const names = event.studentIds.map(id => students.find(item => (item.id ?? item.name) === id)?.name).filter(Boolean);
    return `${names.join(", ")} · ${event.title}`;
  }
  const student = students.find(item => (item.id ?? item.name) === event.studentId);
  return student ? `${student.name} · ${event.title}` : event.title;
}

function canRemovePlannerEvent(event: PlannerEvent) {
  return !event.studentSchedule || Boolean(event.date && !event.templateId) || Boolean(event.studentIds?.length && event.templateId);
}

function EventAttendance({ event, students, onStatusChange, onReschedule, onAddAtSlot }: { event: PlannerEvent; students: Student[]; onStatusChange: (status: LessonStatus, studentId?: string) => void; onReschedule: (studentId?: string) => void; onAddAtSlot: () => void }) {
  if (event.studentIds?.length) return <div className="group-attendance-list">{event.studentIds.map(studentId => {
    const student = students.find(item => (item.id ?? item.name) === studentId);
    const status = event.studentStatuses?.[studentId] ?? "scheduled";
    return <div className="group-attendance-row" key={studentId}>
      <span>{student?.name ?? "Student"}</span>
      <TaskStatusSelect value={status} onChange={next => onStatusChange(next, studentId)} includeClassStatuses/>
      <button type="button" className="event-reschedule-button" onClick={() => onReschedule(studentId)}>Move</button>
      {(status === "cancelled" || status === "incomplete") && <button type="button" className="event-reschedule-button" onClick={onAddAtSlot}>Fill slot</button>}
    </div>;
  })}</div>;
  return <><TaskStatusSelect value={event.status ?? "scheduled"} onChange={onStatusChange} includeClassStatuses={event.kind === "lesson"}/>{event.kind === "lesson" && (event.status === "cancelled" || event.status === "incomplete") && <button type="button" className="event-reschedule-button" onClick={onAddAtSlot}>Fill slot</button>}</>;
}

function TaskStatusSelect({ value, onChange, includeClassStatuses = false }: { value: LessonStatus; onChange: (status: LessonStatus) => void; includeClassStatuses?: boolean }) {
  return (
    <select className={`lesson-status-select ${value}`} value={value} onChange={event => onChange(event.target.value as LessonStatus)} aria-label="Task completion status">
      <option value="scheduled">Scheduled</option>
      <option value="completed">Complete</option>
      <option value="incomplete">Incomplete</option>
      {includeClassStatuses && <option value="cancelled">Cancelled</option>}
      {includeClassStatuses && <option value="rescheduled" disabled>Rescheduled - use Move</option>}
    </select>
  );
}

function toLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
