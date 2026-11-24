import { Icon } from "@/components/ui/icon";
import type { AppState } from "@/features/app/use-app-state";

const formatCurrency = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

export function InsightsPage({ app }: { app: AppState }) {
  const { students, goalProgress, receivedClassIncome, setSection, toggleStudentPaid } = app;
  const paidTotal = receivedClassIncome;
  const dueStudents = students.filter(student => !student.paid);
  const dueTotal = dueStudents.reduce((sum, student) => sum + student.fee, 0);
  const activeGoals = goalProgress.filter(goal => goal.done < goal.total).length;

  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"/> A MOMENT TO REFLECT</div>
          <h1>See how your <em>studio is growing.</em></h1>
          <p className="welcome-sub">A simple view of teaching income and student payments.</p>
        </div>
        <button className="primary-button" onClick={() => setSection("Finances")}><Icon name="chart" size={16}/> Open finances</button>
      </div>

      <div className="finance-stats">
        <article className="finance-stat income-stat"><div className="finance-label">CYCLE FEES RECEIVED</div><b>{formatCurrency(paidTotal)}</b><small>Marked paid by your students</small></article>
        <article className="finance-stat expense-stat"><div className="finance-label">CYCLE FEES DUE</div><b>{formatCurrency(dueTotal)}</b><small>{dueStudents.length} student payments due</small></article>
        <article className="finance-stat saving-stat"><div className="finance-label">ACTIVE STUDENTS</div><b>{students.length}</b><small>In your music studio</small></article>
        <article className="finance-stat balance-stat"><div className="finance-label">GOALS IN PROGRESS</div><b>{activeGoals}</b><small>Keep showing up for yourself</small></article>
      </div>

      <section className="panel full-list-panel">
        <div className="panel-heading"><div><div className="section-kicker">STUDIO CHECK-IN</div><h2>Payments to follow up</h2></div><button className="text-button" onClick={() => setSection("Students")}>Manage students <Icon name="arrow" size={14}/></button></div>
        {dueStudents.map(student => (
          <article className="student-row" key={student.id ?? student.name}>
            <div className={`student-avatar ${student.color}`}>{student.initials}</div>
            <div className="student-info"><b>{student.name}</b><span>{student.instrument}</span></div>
            <span className="student-next"><small>FEE / CLASS</small><b>{formatCurrency(student.fee)}</b></span>
            <button className="fee-state due fee-action" onClick={() => toggleStudentPaid(student)}>Mark paid</button>
          </article>
        ))}
        {dueStudents.length === 0 && <div className="empty-transactions">All student payments are up to date. Lovely work.</div>}
      </section>
    </>
  );
}
