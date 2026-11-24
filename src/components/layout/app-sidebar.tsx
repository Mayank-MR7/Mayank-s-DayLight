"use client";

import { Icon } from "@/components/ui/icon";
import type { AppSection, IconName } from "@/types/app";

interface AppSidebarProps {
  activeSection: AppSection;
  studentCount: number;
  userEmail: string;
  onNavigate: (section: AppSection) => void;
  onTakeMoment: () => void;
}

const navigationGroups: { label: string; items: { label: AppSection; icon: IconName }[] }[] = [
  { label: "YOUR SPACE", items: [
    { label: "Overview", icon: "grid" }, { label: "Planner", icon: "calendar" },
    { label: "My goals", icon: "target" }, { label: "Finances", icon: "chart" },
  ] },
  { label: "YOUR STUDIO", items: [
    { label: "Students", icon: "music" }, { label: "Insights", icon: "chart" },
  ] },
];

export function AppSidebar({ activeSection, studentCount, userEmail, onNavigate, onTakeMoment }: AppSidebarProps) {
  const userInitial = userEmail.trim().slice(0, 1).toUpperCase() || "U";
  return (
    <aside className="sidebar">
      <a className="brand" href="#home">
        <span className="brand-mark"><Icon name="spark" size={20}/></span>
        <span>daylight<span className="brand-period">.</span></span>
      </a>

      <div className="profile-switch">
        <div className="profile-avatar">{userInitial}</div>
        <div className="profile-copy"><b>My workspace</b><small title={userEmail}>{userEmail}</small></div>
        <span className="switch-dots"><Icon name="more" size={17}/></span>
      </div>

      <div className="nav-stack">
        {navigationGroups.map(group => (
          <div className="nav-group" key={group.label}>
            <p className="nav-label">{group.label}</p>
            {group.items.map(item => (
              <button
                className={`nav-item ${activeSection === item.label ? "active" : ""}`}
                key={item.label}
                onClick={() => onNavigate(item.label)}
              >
                <Icon name={item.icon}/><span>{item.label}</span>
                {item.label === "Students" && <span className="nav-count">{studentCount}</span>}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar-bottom">
        <button className="nav-item"><Icon name="settings"/><span>Settings</span></button>
        <div className="sidebar-tip">
          <span className="tip-icon"><Icon name="spark" size={17}/></span>
          <b>A little reminder</b>
          <p>Rest is productive, too. Take a breath.</p>
          <button onClick={onTakeMoment}>A moment for me <Icon name="arrow" size={14}/></button>
        </div>
        <div className="side-footer">
          <span className="mini-avatar">{userInitial}</span>
          <span><b>Made for your rhythm</b><small>Version 0.1 · Just for you</small></span>
        </div>
      </div>
    </aside>
  );
}
