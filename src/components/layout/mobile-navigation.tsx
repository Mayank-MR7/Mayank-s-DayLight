"use client";

import { Icon } from "@/components/ui/icon";
import type { AppSection, IconName } from "@/types/app";

interface MobileNavigationProps {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
}

const items: { label: AppSection; icon: IconName }[] = [
  { label: "Overview", icon: "grid" }, { label: "Planner", icon: "calendar" },
  { label: "My goals", icon: "target" }, { label: "Students", icon: "music" },
  { label: "Finances", icon: "chart" },
];

export function MobileNavigation({ activeSection, onNavigate }: MobileNavigationProps) {
  return (
    <nav className="mobile-nav" aria-label="Main navigation">
      {items.map(item => (
        <button className={activeSection === item.label ? "active" : ""} key={item.label} onClick={() => onNavigate(item.label)}>
          <Icon name={item.icon} size={19}/><span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
