"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";

export function ActivityTimerButton({ startedAt, disabled = false, onToggle }: { startedAt?: string; disabled?: boolean; onToggle: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  const running = Boolean(startedAt);

  useEffect(() => {
    if (!startedAt) return;
    const update = () => setNow(Date.now());
    update();
    const interval = window.setInterval(update, 15_000);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  const startMilliseconds = startedAt ? Date.parse(startedAt) : Number.NaN;
  const elapsedMinutes = running && Number.isFinite(startMilliseconds) ? Math.max(0, Math.floor((now - startMilliseconds) / 60_000)) : 0;
  const elapsedLabel = !Number.isFinite(startMilliseconds) && running ? "time unavailable" : elapsedMinutes < 1 ? "<1m" : `${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`;
  const label = running ? `Stop · ${elapsedLabel}` : disabled ? "Another timer is running" : "Start timer";

  return (
    <button
      type="button"
      className={`activity-timer-button ${running ? "running" : ""}`}
      onClick={onToggle}
      disabled={disabled}
      aria-label={running ? `Stop timer, ${elapsedLabel} elapsed` : disabled ? "Another timer is running" : "Start timer"}
    >
      <Icon name={running ? "check" : "clock"} size={13}/>{label}
    </button>
  );
}
