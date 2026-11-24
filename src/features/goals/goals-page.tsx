import { Icon } from '@/components/ui/icon';
import type { AppState } from '@/features/app/use-app-state';
import type { GoalPeriod } from '@/types/app';

const periods: GoalPeriod[] = ['Today', 'This week', 'This month'];
const formatTime = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

export function GoalsPage({ app }: { app: AppState }) {
  const {
    goalProgress,
    goalPeriod,
    setGoalPeriod,
    openGoalForm,
    editGoal,
    progressGoal,
    removeGoal,
    updateGoalManualProgress,
    projectProgress,
    openProjectForm,
    editProject,
    removeProject,
    updateProjectManualProgress,
  } = app;
  const visibleGoals = goalProgress.filter((goal) => goal.period === goalPeriod);

  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" /> YOUR INTENTIONS
          </div>
          <h1>
            Progress at <em>your pace.</em>
          </h1>
          <p className="welcome-sub">
            Plan learning time, track completed sessions, and build projects steadily.
          </p>
        </div>
        <button className="primary-button" onClick={openGoalForm}>
          <Icon name="plus" size={17} /> Add a goal
        </button>
      </div>

      <section className="panel full-list-panel">
        <div className="panel-heading">
          <div>
            <div className="section-kicker">LEARNING & PERSONAL GOALS</div>
            <h2>{visibleGoals.length} goals</h2>
          </div>
          <span className="roster-note">Planner sessions update progress automatically</span>
        </div>
        <div className="goal-period-tabs">
          {periods.map((period) => (
            <button
              className={goalPeriod === period ? 'active' : ''}
              key={period}
              onClick={() => setGoalPeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>
        <div className="goal-list full-goal-list">
          {visibleGoals.map((goal) => (
            <article className="goal-item expanded-goal-item" key={goal.id ?? goal.title}>
              <div className={`goal-icon ${goal.tint}`}>{goal.icon}</div>
              <div className="goal-main">
                <div className="goal-title-row">
                  <b>{goal.title}</b>
                  <span>
                    {formatTime(goal.done)} / {formatTime(goal.total)}
                  </span>
                </div>
                <div className="goal-meta">
                  {goal.category} ·{' '}
                  {goal.durationDays
                    ? `${goal.durationDays}-day plan · ${formatTime(goal.dailyTargetMinutes ?? 0)} daily`
                    : `${goal.done} of ${goal.total} min`}
                </div>
                <div className="goal-bar">
                  <span
                    className={goal.tint}
                    style={{
                      width: `${goal.total ? Math.min(100, (goal.done / goal.total) * 100) : 0}%`,
                    }}
                  />
                </div>
                {goal.dailyTargetMinutes ? (
                  <div className="goal-period-progress">
                    <span
                      className={
                        goal.dailyMinutes >= goal.dailyTargetMinutes ? 'goal-day-complete' : ''
                      }
                    >
                      Today {formatTime(goal.dailyMinutes)} / {formatTime(goal.dailyTargetMinutes)}
                      {goal.dailyMinutes >= goal.dailyTargetMinutes ? ' · Complete' : ''}
                    </span>
                    {goal.weeklyTargetMinutes > 0 && (
                      <span>
                        This week {formatTime(goal.weeklyMinutes)} /{' '}
                        {formatTime(goal.weeklyTargetMinutes)}
                      </span>
                    )}
                    {goal.monthlyTargetMinutes > 0 && (
                      <span>
                        This month {formatTime(goal.monthlyMinutes)} /{' '}
                        {formatTime(goal.monthlyTargetMinutes)}
                      </span>
                    )}
                  </div>
                ) : null}
                <label className="manual-progress-field">
                  Edit manual progress (minutes)
                  <input
                    type="number"
                    min="0"
                    max={goal.total}
                    value={goal.manualMinutes ?? goal.done}
                    onChange={(event) => updateGoalManualProgress(goal, Number(event.target.value))}
                  />
                </label>
              </div>
              {!goal.dailyTargetMinutes && (
                <button
                  className={`goal-check ${goal.done >= goal.total ? 'complete' : ''}`}
                  onClick={() => progressGoal(goal)}
                  aria-label={`Log five minutes for ${goal.title}`}
                >
                  <Icon name="check" size={15} />
                </button>
              )}
              <button className="student-edit-button" onClick={() => editGoal(goal)}>
                Edit
              </button>
              <button
                className="row-action danger-action"
                onClick={() => removeGoal(goal)}
                aria-label={`Remove ${goal.title}`}
              >
                <Icon name="close" size={15} />
              </button>
            </article>
          ))}
        </div>
        {visibleGoals.length === 0 && (
          <div className="empty-transactions">
            No goals in this period yet. Add a learning plan to get started.
          </div>
        )}
      </section>

      <section className="panel projects-panel">
        <div className="panel-heading">
          <div>
            <div className="section-kicker">BUILD & CREATE</div>
            <h2>
              Your projects <span className="count-bubble">{projectProgress.length}</span>
            </h2>
          </div>
          <button className="primary-button small-primary" onClick={openProjectForm}>
            <Icon name="plus" size={15} /> Add project
          </button>
        </div>
        <div className="project-grid">
          {projectProgress.map((project) => {
            const targetMinutes = project.targetHours * 60;
            const percentage = Math.min(
              100,
              targetMinutes ? (project.doneMinutes / targetMinutes) * 100 : 0,
            );
            return (
              <article className="project-card" key={project.id}>
                <div className="project-card-heading">
                  <div>
                    <h3>{project.title}</h3>
                    <p>{project.description || 'Project in progress'}</p>
                  </div>
                  <button
                    className="row-action danger-action"
                    onClick={() => removeProject(project.id)}
                    aria-label={`Delete ${project.title}`}
                  >
                    <Icon name="close" size={15} />
                  </button>
                </div>
                <div className="project-stack">
                  {project.techStack.length ? (
                    project.techStack.map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))
                  ) : (
                    <span>Stack not added</span>
                  )}
                </div>
                <div className="goal-title-row project-progress-label">
                  <b>{formatTime(project.doneMinutes)} logged</b>
                  <span>
                    {project.targetHours}h target · {Math.round(percentage)}%
                  </span>
                </div>
                <div className="goal-bar">
                  <span className="mint" style={{ width: `${percentage}%` }} />
                </div>
                {project.dailyTargetMinutes > 0 && (
                  <div className="goal-period-progress">
                    <span
                      className={
                        project.dailyMinutes >= project.dailyTargetMinutes
                          ? 'goal-day-complete'
                          : ''
                      }
                    >
                      Today {formatTime(project.dailyMinutes)} /{' '}
                      {formatTime(project.dailyTargetMinutes)}
                      {project.dailyMinutes >= project.dailyTargetMinutes ? ' · Complete' : ''}
                    </span>
                    {project.weeklyTargetMinutes > 0 && (
                      <span>
                        This week {formatTime(project.weeklyMinutes)} /{' '}
                        {formatTime(project.weeklyTargetMinutes)}
                      </span>
                    )}
                    {project.monthlyTargetMinutes > 0 && (
                      <span>
                        This month {formatTime(project.monthlyMinutes)} /{' '}
                        {formatTime(project.monthlyTargetMinutes)}
                      </span>
                    )}
                  </div>
                )}
                <label className="manual-progress-field">
                  Edit manual progress (minutes)
                  <input
                    type="number"
                    min="0"
                    value={project.manualMinutes}
                    onChange={(event) =>
                      updateProjectManualProgress(project.id, Number(event.target.value))
                    }
                  />
                </label>
                <button className="student-edit-button" onClick={() => editProject(project)}>
                  Edit project
                </button>
              </article>
            );
          })}
        </div>
        {projectProgress.length === 0 && (
          <div className="empty-transactions">
            Add a project such as Identera or My Drive, then link planner sessions to track its
            time.
          </div>
        )}
      </section>
    </>
  );
}
