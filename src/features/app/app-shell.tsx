"use client";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { FinancesPage } from "@/features/finances/finances-page";
import { GoalsPage } from "@/features/goals/goals-page";
import { InsightsPage } from "@/features/insights/insights-page";
import { OverviewPage } from "@/features/overview/overview-page";
import { PlannerPage } from "@/features/planner/planner-page";
import { StudentsPage } from "@/features/students/students-page";
import { AppModals } from "@/features/app/app-modals";
import { useAppState } from "@/features/app/use-app-state";
import { Icon } from "@/components/ui/icon";
import { AuthScreen } from "@/features/auth/auth-screen";
import { useAuth } from "@/features/auth/auth-provider";

export function AppShell() {
  const auth = useAuth();
  if (auth.configured && auth.loading) return <main className="auth-screen dark-theme"><div className="auth-card">Loading your studio…</div></main>;
  if (!auth.configured || !auth.user) return <AuthScreen/>;
  return <AuthenticatedAppShell/>;
}

function AuthenticatedAppShell() {
  const auth = useAuth();
  const app = useAppState();
  return (
    <main className={`app-shell ${app.darkMode ? "dark-theme" : ""}`}>
      <AppSidebar
        activeSection={app.section}
        studentCount={app.students.length}
        userEmail={auth.user?.email ?? ""}
        onNavigate={app.setSection}
        onTakeMoment={() => app.flash("Take a slow breath. You’re doing well.")}
      />

      <section className="main-area">
        <AppHeader
          section={app.section}
          query={app.query}
          darkMode={app.darkMode}
          onQueryChange={app.setQuery}
          onToggleTheme={app.toggleTheme}
          onNotifications={() => app.flash("You’re all caught up")}
          userEmail={auth.user?.email ?? ""}
          onSignOut={auth.signOut}
        />
        <div className="content">
          <div className={`data-sync-banner ${auth.syncMessage.includes("needs setup") ? "sync-error" : ""}`}>
            <span>{auth.configured ? auth.syncMessage || "Connecting cloud storage…" : "Local-only mode: add Supabase settings to sync and protect your studio data."}</span>
          </div>
          {app.section === "Overview" && <OverviewPage app={app}/>}
          {app.section === "Planner" && <PlannerPage app={app}/>}
          {app.section === "My goals" && <GoalsPage app={app}/>}
          {app.section === "Finances" && <FinancesPage app={app}/>}
          {app.section === "Students" && <StudentsPage app={app}/>}
          {app.section === "Insights" && <InsightsPage app={app}/>}
          {app.section !== "Overview" && <footer className="page-footer"><span>Made with care, for your one precious life <span className="heart">♥</span></span><span>Keep showing up for yourself.</span></footer>}
        </div>
      </section>

      <MobileNavigation activeSection={app.section} onNavigate={app.setSection}/>
      {app.toast && <div className="toast"><span><Icon name="check" size={15}/></span>{app.toast}</div>}
      <AppModals app={app}/>
    </main>
  );
}
