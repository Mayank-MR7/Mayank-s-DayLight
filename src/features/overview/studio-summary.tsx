import { Icon } from "@/components/ui/icon";
import type { AppState } from "@/features/app/use-app-state";
import { getEventsForDate } from "@/lib/planner-dates";

export function StudioSummary({ app }: { app: AppState }) {
  const { students, filteredStudents, plannerEvents, plannerWeekDates, setSection, openStudentForm, toggleStudentPaid } = app;
  const lessonsThisWeek = plannerWeekDates.reduce((count, date) => count + getEventsForDate(plannerEvents, date).filter(event => event.kind === "lesson").length, 0);
  const teachingIncome = app.receivedClassIncome;

  return (
    <section className="panel studio-panel">
      <div className="panel-heading"><div><div className="section-kicker">YOUR LITTLE MUSIC STUDIO</div><h2>Students <span className="count-bubble">{students.length}</span></h2></div><button className="primary-button small-primary" onClick={openStudentForm}><Icon name="plus" size={15}/> Add student</button></div>
      <div className="studio-summary"><div><span className="summary-label">PAID FEES</span><b>₹{teachingIncome.toLocaleString("en-IN")}</b></div><div className="summary-divider"/><div><span className="summary-label">LESSONS THIS WEEK</span><b>{lessonsThisWeek} <small>lessons</small></b></div><button className="summary-arrow" onClick={() => setSection("Insights")} aria-label="Studio insights"><Icon name="arrow" size={15}/></button></div>
      <div className="student-list">
        {filteredStudents.slice(0, 3).map(student => <article className="student-row" key={student.id ?? student.name}>
          <div className={`student-avatar ${student.color}`}>{student.initials}</div>
          <div className="student-info"><b>{student.name}</b><span>{student.instrument}</span></div>
          <div className="student-next"><small>NEXT CLASS</small><b>{student.next}</b></div>
          <button className={`fee-state ${student.paid ? "paid" : "due"}`} onClick={() => toggleStudentPaid(student)}>{student.paid ? "Paid" : "Due · mark paid"}</button>
        </article>)}
      </div>
      <button className="studio-footer-link" onClick={() => setSection("Students")}>Manage your studio <Icon name="arrow" size={14}/></button>
    </section>
  );
}
