"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { AppSection } from "@/types/app";

interface AppHeaderProps {
  section: AppSection;
  query: string;
  darkMode: boolean;
  onQueryChange: (query: string) => void;
  onToggleTheme: () => void;
  onNotifications: () => void;
  userEmail: string;
  onSignOut: () => Promise<void>;
}

export function AppHeader({ section, query, darkMode, onQueryChange, onToggleTheme, onNotifications, userEmail, onSignOut }: AppHeaderProps) {
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  async function signOut() {
    setSigningOut(true);
    setSignOutError("");
    try {
      await onSignOut();
    } catch {
      setSignOutError("Sign out failed. Please try again.");
      setSigningOut(false);
    }
  }

  return (
    <header className="topbar">
      <div className="breadcrumb">Your space <Icon name="chevron" size={14}/> <b>{section}</b></div>
      <div className="top-actions">
        <label className="search-box">
          <Icon name="search" size={16}/>
          <input placeholder="Search anything..." value={query} onChange={event => onQueryChange(event.target.value)}/>
          <kbd>⌘ K</kbd>
        </label>
        <button className="icon-button theme-toggle" onClick={onToggleTheme} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} title={darkMode ? "Light mode" : "Dark mode"}>
          <Icon name={darkMode ? "sun" : "moon"} size={17}/>
        </button>
        <button className="icon-button notification" onClick={onNotifications} aria-label="Notifications"><Icon name="bell" size={18}/><i/></button>
        <div className="top-account">
          <div className="top-account-copy"><small>Signed in as</small><span title={userEmail}>{userEmail}</span></div>
          <button className="account-signout" onClick={() => void signOut()} disabled={signingOut}>
            <Icon name="logout" size={15}/><span>{signingOut ? "Signing out…" : "Sign out"}</span>
          </button>
        </div>
      </div>
      {signOutError && <span className="signout-error" role="alert">{signOutError}</span>}
    </header>
  );
}
