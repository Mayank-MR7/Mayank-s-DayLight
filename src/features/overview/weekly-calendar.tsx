import { Icon } from "@/components/ui/icon";
import { weekdays } from "@/data/initial-data";
import type { AppState } from "@/features/app/use-app-state";
import { formatClock } from "@/lib/time-format";
import { getEventsForDate } from "@/lib/planner-dates";

export function WeeklyCalendar({ app }: { app: AppState }) {
  const { calendarMode, setCalendarMode, setWeekOffset, weekRangeLabel, weekOffset, weekDates, dateNumbers, todayDayIndex, plannerEvents, students, monthDates, today, monthLabel, openEventForm, flash } = app;

  return (
    <section className="panel calendar-panel">
      <div className="panel-heading">
        <div>
          <div className="section-kicker">MAKE ROOM FOR YOUR DAY</div>
          <h2>{calendarMode === "Week" ? <>Your week <span className="muted-heading">· {weekRangeLabel}</span></> : <>Your month <span className="muted-heading">· {monthLabel}</span></>}</h2>
        </div>
        <div className="calendar-controls">
          <button className="subtle-button" onClick={() => openEventForm(today)}><Icon name="plus" size={13}/> Event</button>
          <div className="segmented"><button className={calendarMode === "Week" ? "selected" : ""} onClick={() => setCalendarMode("Week")}>Week</button><button className={calendarMode === "Month" ? "selected" : ""} onClick={() => setCalendarMode("Month")}>Month</button></div>
          <button className="icon-button calendar-next" aria-label="Next week" onClick={() => setWeekOffset(offset => offset + 1)}><Icon name="chevron" size={16}/></button>
        </div>
      </div>

      {calendarMode === "Week" ? (
        <div className="week-calendar">
          <div className="time-column"><div className="day-spacer"/>{Array.from({ length: 10 }, (_, index) => index + 8).map(hour => <div className="time-label" key={hour}>{hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}</div>)}</div>
          <div className="days-grid">
            {weekdays.map((day, dayIndex) => (
              <div className={`day-column ${weekOffset === 0 && dayIndex === todayDayIndex ? "today-column" : ""}`} key={day}>
                <div className="day-header"><span>{day}</span><b>{dateNumbers[dayIndex]}</b></div>
                <div className="day-slots">
                  {Array.from({ length: 10 }, (_, index) => <div className="hour-slot" key={index}/>) }
                  {getEventsForDate(plannerEvents, weekDates[dayIndex]).map(event => {
                    const student = students.find(item => (item.id ?? item.name) === event.studentId);
                    return <div className={`event-block ${event.kind} task-${event.status ?? "scheduled"}`} key={`${event.id ?? `${event.title}-${event.day}`}-${weekDates[dayIndex].toISOString()}`} style={{ top: `${(event.start - 8) * 25 + 4}px`, height: `${Math.max(18, event.duration * 25 - 4)}px` }}>
                      <b>{student ? `${student.name} · ${event.title}` : event.title}</b><small>{formatClock(event.start)} – {formatClock(event.start + event.duration)}{event.status === "completed" ? " · Done" : ""}</small>
                    </div>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="month-view">
          <div className="month-weekdays">{weekdays.map(day => <span key={day}>{day}</span>)}</div>
          <div className="month-grid">
            {monthDates.map(date => {
              const events = getEventsForDate(plannerEvents, date);
              const hasEvents = events.length > 0;
              return <button className={`month-date ${date.toDateString() === today.toDateString() ? "month-today" : ""} ${date.getMonth() !== today.getMonth() ? "outside" : ""}`} key={date.toISOString()} onClick={() => flash(`${new Intl.DateTimeFormat("en", { month: "long", day: "numeric" }).format(date)}: ${events.length} plans`)}>{date.getDate()}{hasEvents && <i/>}</button>;
            })}
          </div>
        </div>
      )}
      <div className="calendar-legend"><span><i className="legend-dot focus-dot"/> Focus time</span><span><i className="legend-dot lesson-dot"/> Music lessons</span><span><i className="legend-dot personal-dot"/> For you</span><button onClick={() => app.setSection("Planner")}>View full planner <Icon name="arrow" size={14}/></button></div>
    </section>
  );
}
