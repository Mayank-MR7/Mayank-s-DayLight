import { Icon } from "@/components/ui/icon";
import type { AppState } from "@/features/app/use-app-state";
import { GoalsSummary } from "@/features/overview/goals-summary";
import { RhythmCard } from "@/features/overview/rhythm-card";
import { StudioSummary } from "@/features/overview/studio-summary";
import { WeeklyCalendar } from "@/features/overview/weekly-calendar";
import { getEventsForDate } from "@/lib/planner-dates";

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours ? `${hours}h ` : ""}${remainder}m`;
}

export function OverviewPage({ app }: { app: AppState }) {
  const { dateLabel, remainingHours, sleepRecord, clockLabel, plannerEvents, goalProgress, openGoalForm, openSleepForm } = app;
  const hasSleepLog = sleepRecord.minutes > 0;
  const dailyGoalMinutes = goalProgress.reduce((sum, goal) => sum + (goal.dailyTargetMinutes ? goal.activeToday ? goal.dailyMinutes : 0 : goal.period === "Today" ? goal.mins : 0), 0);
  const dailyGoalTarget = goalProgress.reduce((sum, goal) => sum + (goal.dailyTargetMinutes ? goal.activeToday ? goal.dailyTargetMinutes : 0 : goal.period === "Today" ? goal.total : 0), 0);
  const todaysLessons = getEventsForDate(plannerEvents, new Date()).filter(event => event.kind === "lesson");
  const nextLesson = todaysLessons[0];

  return (
    <>
      <div className="welcome-row">
        <div><div className="eyebrow"><span className="eyebrow-dot"/> {dateLabel}</div><h1>A little more <em>in tune.</em></h1><p className="welcome-sub">Make space for what matters today.</p></div>
        <button className="primary-button" onClick={openGoalForm}><Icon name="plus" size={17}/> Add a goal</button>
      </div>

      <div className="stats-grid">
        <article className="stat-card day-card"><div className="stat-top"><span className="stat-label">TIME LEFT IN YOUR DAY</span><span className="stat-icon sand"><Icon name="sun" size={17}/></span></div><div className="stat-value">{remainingHours.toFixed(1)}<small> hrs</small></div><div className="stat-foot"><span className="status-dot green"/> A gentle reminder to use it well</div><div className="day-progress"><span style={{ width: `${Math.max(5, (24 - remainingHours) / 24 * 100)}%` }}/></div></article>
        <article className="stat-card sleep-card"><div className="stat-top"><span className="stat-label">LAST NIGHT’S REST</span><button type="button" className="stat-icon lilac sleep-edit" onClick={openSleepForm} aria-label="Edit sleep log"><Icon name="moon" size={17}/></button></div><div className="stat-value">{hasSleepLog ? <>{Math.floor(sleepRecord.minutes / 60)}<small>h</small> {sleepRecord.minutes % 60}<small>m</small></> : <small>Not logged</small>}</div><div className="stat-foot"><span className="sleep-pill">{hasSleepLog ? "Logged" : "Add a log"}</span>{hasSleepLog && <span className="muted-foot">· Bed {clockLabel(sleepRecord.bed)}</span>}</div></article>
        <article className="stat-card focus-card"><div className="stat-top"><span className="stat-label">TIME FOR YOUR GOALS</span><span className="stat-icon mint"><Icon name="clock" size={17}/></span></div><div className="stat-value">{formatDuration(dailyGoalMinutes)}</div><div className="stat-foot"><span className="muted-foot">of {formatDuration(dailyGoalTarget)} in today’s goals</span></div><div className="tiny-progress"><span style={{ width: `${dailyGoalTarget ? Math.min(100, dailyGoalMinutes / dailyGoalTarget * 100) : 0}%` }}/></div></article>
        <article className="stat-card lesson-card"><div className="stat-top"><span className="stat-label">STUDIO TODAY</span><span className="stat-icon peach"><Icon name="music" size={17}/></span></div><div className="stat-value">{todaysLessons.length}<small> lessons</small></div><div className="stat-foot"><span className="status-dot purple"/> {nextLesson ? `Next: ${nextLesson.start > 12 ? nextLesson.start - 12 : nextLesson.start}:00 ${nextLesson.start >= 12 ? "PM" : "AM"}` : "No lessons planned today"}</div></article>
      </div>

      <div className="dashboard-grid">
        <WeeklyCalendar app={app}/>
        <GoalsSummary app={app}/>
        <StudioSummary app={app}/>
        <RhythmCard app={app}/>
      </div>
      <footer className="page-footer"><span>Made with care, for your one precious life <span className="heart">♥</span></span><span>Keep showing up for yourself.</span></footer>
    </>
  );
}
