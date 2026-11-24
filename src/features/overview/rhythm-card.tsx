import { Icon } from "@/components/ui/icon";
import type { AppState } from "@/features/app/use-app-state";

export function RhythmCard({ app }: { app: AppState }) {
  const { sleepRecord, clockLabel, openSleepForm, flash } = app;
  const hasSleepLog = sleepRecord.minutes > 0;
  const awakeMinutes = hasSleepLog ? 1440 - sleepRecord.minutes : 0;

  return (
    <section className="panel rhythm-panel">
      <div className="panel-heading"><div><div className="section-kicker">A CHECK-IN WITH YOURSELF</div><h2>Your rhythm</h2></div><button className="icon-button" onClick={openSleepForm} aria-label="Update sleep log"><Icon name="more"/></button></div>
      <div className="rhythm-chart"><div className="chart-y-labels"><span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>12am</span></div><div className="chart-area"><div className="chart-grid-lines"><i/><i/><i/><i/><i/></div><div className="sleep-block"><span><Icon name="moon" size={13}/> Rest</span><b>{hasSleepLog ? `${clockLabel(sleepRecord.bed)} – ${clockLabel(sleepRecord.wake)}` : "Add a sleep log to see your rhythm"}</b></div><div className="routine-line"><i/><i/><i/><i/><i/><i/><i/></div></div></div>
      <div className="rhythm-foot"><span><i className="sleep-key"/> Sleep <b>{hasSleepLog ? `${Math.floor(sleepRecord.minutes / 60)}h ${sleepRecord.minutes % 60}m` : "Not logged"}</b></span><span><i className="awake-key"/> Awake <b>{hasSleepLog ? `${Math.floor(awakeMinutes / 60)}h ${awakeMinutes % 60}m` : "—"}</b></span><button onClick={() => flash("Keep logging your sleep to see your rhythm")}>See your week <Icon name="arrow" size={13}/></button></div>
    </section>
  );
}
