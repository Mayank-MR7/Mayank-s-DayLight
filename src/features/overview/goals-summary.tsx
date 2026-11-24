import { Icon } from "@/components/ui/icon";
import type { AppState } from "@/features/app/use-app-state";
import type { GoalPeriod } from "@/types/app";

const goalPeriods: GoalPeriod[] = ["Today", "This week", "This month"];

export function GoalsSummary({ app }: { app: AppState }) {
  const { goals, goalProgress, goalPeriod, setGoalPeriod, openGoalForm, progressGoal, setSection } = app;
  const activeGoals = goalProgress.filter(goal => goal.period === goalPeriod).slice(0, 4);

  return (
    <section className="panel goals-panel">
      <div className="panel-heading"><div><div className="section-kicker">SMALL STEPS ADD UP</div><h2>Your goals</h2></div><button className="text-button" onClick={() => setSection("My goals")}>See all <Icon name="arrow" size={14}/></button></div>
      <div className="goal-tabs">{goalPeriods.map(period => <button className={goalPeriod === period ? "active" : ""} key={period} onClick={() => setGoalPeriod(period)}>{period} <span>{goals.filter(goal => goal.period === period).length}</span></button>)}</div>
      <div className="goal-list">
        {activeGoals.map(goal => <article className="goal-item" key={goal.id ?? goal.title}>
          <div className={`goal-icon ${goal.tint}`}>{goal.icon}</div>
          <div className="goal-main"><div className="goal-title-row"><b>{goal.title}</b><span>{goal.mins}m</span></div><div className="goal-meta">{goal.category} · {goal.done} of {goal.total} min</div><div className="goal-bar"><span className={goal.tint} style={{ width: `${Math.min(100, goal.done / goal.total * 100)}%` }}/></div></div>
          <button className={`goal-check ${goal.done >= goal.total ? "complete" : ""}`} onClick={() => progressGoal(goal)} aria-label={`Log five minutes for ${goal.title}`}><Icon name="check" size={15}/></button>
        </article>)}
        {activeGoals.length === 0 && <div className="empty-transactions">Nothing on this list yet.</div>}
      </div>
      <button className="add-goal-link" onClick={openGoalForm}><Icon name="plus" size={15}/> Add a goal</button>
    </section>
  );
}
