"use client";

import { formatClock } from "@/lib/time-format";

const commonTimes = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "20:00"];

export function TimePicker({ value, onChange, ariaLabel }: { value: string; onChange: (value: string) => void; ariaLabel: string }) {
  return <div className="convenient-time-picker">
    <input type="time" step="300" required value={value} aria-label={ariaLabel} onChange={event => onChange(event.target.value)}/>
    <select aria-label={`Quick select ${ariaLabel}`} value="" onChange={event => { if (event.target.value) onChange(event.target.value); }}>
      <option value="">Quick pick</option>
      {commonTimes.map(time => {
        const [hour, minute] = time.split(":").map(Number);
        return <option key={time} value={time}>{formatClock(hour + minute / 60)}</option>;
      })}
    </select>
  </div>;
}
