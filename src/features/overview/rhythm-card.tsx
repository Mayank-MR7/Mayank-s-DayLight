import { Icon } from "@/components/ui/icon";
import type { AppState } from "@/features/app/use-app-state";

export function RhythmCard({ app }: { app: AppState }) {
  const { sleepRecord, clockLabel, openSleepForm, flash } = app;
  const hasSleepLog = sleepRecord.minutes > 0;
  const awakeMinutes = hasSleepLog ? 1440 - sleepRecord.minutes : 0;

  return (
    <section className="panel rhythm-panel">
      <div className="panel-heading"><div><div className="section-kicker">A CHECK-IN WITH YOURSELF</div><h2>Your rhythm</h2></div><button className="icon-button" onClick={openSleepForm} aria-label="Update sleep log"><Icon name="more"/></button></div>
      <div className="rhythm-chart">
        {hasSleepLog
          ? <div className="sleep-summary"><span><Icon name="moon" size={14}/> Sleep period</span><b>{clockLabel(sleepRecord.bed)} – {clockLabel(sleepRecord.wake)}</b><small>Your saved sleep log</small></div>
          : <div className="rhythm-empty">Add a sleep log to see your rest and awake time here.</div>}
      </div>
      <div className="rhythm-foot"><span><i className="sleep-key"/> Sleep <b>{hasSleepLog ? `${Math.floor(sleepRecord.minutes / 60)}h ${sleepRecord.minutes % 60}m` : "Not logged"}</b></span><span><i className="awake-key"/> Awake <b>{hasSleepLog ? `${Math.floor(awakeMinutes / 60)}h ${awakeMinutes % 60}m` : "—"}</b></span><button onClick={() => flash("Keep logging your sleep to see your rhythm")}>See your week <Icon name="arrow" size={13}/></button></div>
    </section>
  );
}
