"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { AppState } from "@/features/app/use-app-state";

export function RhythmCard({ app }: { app: AppState }) {
  const { sleepRecord, clockLabel, openSleepForm, toggleSleepTimer } = app;
  const [now, setNow] = useState(() => Date.now());
  const isTracking = Boolean(sleepRecord.startedAt);
  const hasSleepLog = sleepRecord.minutes > 0 && !isTracking;
  const awakeMinutes = hasSleepLog ? Math.max(0, 1440 - sleepRecord.minutes) : 0;
  const elapsedMinutes = isTracking ? Math.max(0, Math.floor((now - Date.parse(sleepRecord.startedAt!)) / 60000)) : 0;

  useEffect(() => {
    if (!sleepRecord.startedAt) return;
    const update = () => setNow(Date.now());
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, [sleepRecord.startedAt]);

  return (
    <section className="panel rhythm-panel">
      <div className="panel-heading"><div><div className="section-kicker">A CHECK-IN WITH YOURSELF</div><h2>Your rhythm</h2></div><button className="icon-button" onClick={openSleepForm} aria-label="Update sleep log"><Icon name="more"/></button></div>
      <div className="rhythm-chart">
        {isTracking
          ? <div className="sleep-summary sleep-summary-active"><span><Icon name="moon" size={14}/> Sleep timer running</span><b>{clockLabel(sleepRecord.bed)} – now</b><small>Sleeping for {formatDuration(elapsedMinutes)}</small></div>
          : hasSleepLog
          ? <div className="sleep-summary"><span><Icon name="moon" size={14}/> Sleep period</span><b>{clockLabel(sleepRecord.bed)} – {clockLabel(sleepRecord.wake)}</b><small>Your saved sleep log</small></div>
          : <div className="rhythm-empty">Add a sleep log to see your rest and awake time here.</div>}
      </div>
      <button type="button" className={`sleep-timer-button ${isTracking ? "active" : ""}`} onClick={toggleSleepTimer}>
        <Icon name={isTracking ? "check" : "moon"} size={15}/>{isTracking ? "Stop sleep timer" : "Start sleep timer"}
      </button>
      <div className="rhythm-foot"><span><i className="sleep-key"/> Sleep <b>{isTracking ? `In progress · ${formatDuration(elapsedMinutes)}` : hasSleepLog ? formatDuration(sleepRecord.minutes) : "Not logged"}</b></span><span><i className="awake-key"/> Awake <b>{hasSleepLog ? formatDuration(awakeMinutes) : "—"}</b></span></div>
    </section>
  );
}

function formatDuration(minutes: number) {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
