"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { AppState } from "@/features/app/use-app-state";
import { getCurrentMonthDates, getCurrentMonthWeeks, getCurrentWeekDates, getStudioIncomeForecast } from "@/features/finances/studio-income";

const formatCurrency = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

export function FinancesPage({ app }: { app: AppState }) {
  const {
    transactions, financeFilter, expectedClassIncome, receivedClassIncome, setFinanceFilter,
    emis, setEmis, addEmi, openTransactionForm, removeTransaction,
  } = app;
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [emiTitle, setEmiTitle] = useState("");
  const [emiAmount, setEmiAmount] = useState("");
  const [emiDueDay, setEmiDueDay] = useState(String(app.today.getDate()));
  const [emiMonths, setEmiMonths] = useState("12");
  const [emiStartDate, setEmiStartDate] = useState(dateKey(app.today));
  const [editingEmiId, setEditingEmiId] = useState<string | null>(null);
  const selectedDates = period === "week" ? getCurrentWeekDates(app.today) : getCurrentMonthDates(app.today);
  const startKey = dateKey(selectedDates[0]);
  const endKey = dateKey(selectedDates[selectedDates.length - 1]);
  const periodTransactions = transactions.filter(item => {
    const key = item.dateKey ?? legacyTransactionDate(item.date, app.today.getFullYear());
    return key >= startKey && key <= endKey;
  });
  const visibleTransactions = periodTransactions.filter(item => financeFilter === "All activity" || item.type === financeFilter.toLowerCase().replace(/s$/, ""));
  const incomeTotal = periodTransactions.filter(item => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenseEntries = periodTransactions.filter(item => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const savingsTotal = periodTransactions.filter(item => item.type === "saving").reduce((sum, item) => sum + item.amount, 0);
  const classIncome = periodTransactions.filter(item => item.type === "income" && item.category === "Music classes").reduce((sum, item) => sum + item.amount, 0);
  const emiInstallments = emis.flatMap(emi => getEmiInstallments(emi).map(dueDate => ({ emi, dueDate, paid: emi.paidDates.includes(dueDate) }))).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const visibleInstallments = emiInstallments.filter(item => item.dueDate >= dateKey(app.today) || !item.paid).slice(0, 8);
  const emiDueThisPeriod = emiInstallments.filter(item => item.dueDate >= startKey && item.dueDate <= endKey);
  const emiTotal = emiDueThisPeriod.reduce((sum, item) => sum + item.emi.amount, 0);
  const expenseTotal = expenseEntries + emiTotal;

  const emergencySaving = transactions.filter(item => item.type === "saving" && item.category === "Emergency fund").reduce((sum, item) => sum + item.amount, 0);
  const personalSaving = transactions.filter(item => item.type === "saving" && item.category === "Personal goal").reduce((sum, item) => sum + item.amount, 0);
  const expensesByCategory = periodTransactions.filter(item => item.type === "expense").reduce<Record<string, number>>((groups, item) => {
    groups[item.category] = (groups[item.category] ?? 0) + item.amount;
    return groups;
  }, {});
  const categories = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const filters = ["All activity", "Income", "Expenses", "Savings"] as const;
  const weekForecast = getStudioIncomeForecast(app.students, app.plannerEvents, getCurrentWeekDates(app.today));
  const monthForecast = getStudioIncomeForecast(app.students, app.plannerEvents, getCurrentMonthDates(app.today));
  const monthWeeks = getCurrentMonthWeeks(app.today);

  function submitEmi(event: React.FormEvent<HTMLFormElement>) {
    const details = { title: emiTitle, amount: Number(emiAmount), dueDay: Number(emiDueDay), startDate: emiStartDate, months: Number(emiMonths) };
    if (editingEmiId) {
      event.preventDefault();
      setEmis(current => current.map(emi => emi.id === editingEmiId ? { ...emi, ...details } : emi));
    } else addEmi(event, details);
    setEmiTitle(""); setEmiAmount(""); setEmiDueDay(String(app.today.getDate())); setEmiMonths("12"); setEmiStartDate(dateKey(app.today)); setEditingEmiId(null);
  }

  function editEmi(emi: typeof emis[number]) {
    setEditingEmiId(emi.id); setEmiTitle(emi.title); setEmiAmount(String(emi.amount)); setEmiDueDay(String(emi.dueDay)); setEmiMonths(String(emi.months)); setEmiStartDate(emi.startDate);
  }

  function toggleInstallmentPaid(emiId: string, dueDate: string) {
    setEmis(current => current.map(emi => emi.id !== emiId ? emi : {
      ...emi, paidDates: emi.paidDates.includes(dueDate) ? emi.paidDates.filter(date => date !== dueDate) : [...emi.paidDates, dueDate],
    }));
  }

  return (
    <>
      <div className="welcome-row finance-welcome">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot"/> YOUR MONEY, IN ONE PLACE</div>
          <h1>Feel good about <em>your finances.</em></h1>
          <p className="welcome-sub">A clear picture of what comes in, goes out, and stays for you.</p>
        </div>
        <button className="primary-button" onClick={() => openTransactionForm("income")}><Icon name="plus" size={17}/> Add activity</button>
      </div>

      <div className="finance-period-switch" role="group" aria-label="Finance period">
        <button className={period === "week" ? "selected" : ""} onClick={() => setPeriod("week")}>This week</button>
        <button className={period === "month" ? "selected" : ""} onClick={() => setPeriod("month")}>This month</button>
        <span>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(selectedDates[0])} – {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(selectedDates[selectedDates.length - 1])}</span>
      </div>

      <div className="finance-stats">
        <article className="finance-stat income-stat">
          <div className="finance-stat-head"><span className="stat-icon mint"><Icon name="arrow" size={17}/></span><span className="finance-period">THIS {period.toUpperCase()}</span></div>
          <div className="finance-label">TOTAL EARNINGS</div><b>{formatCurrency(incomeTotal)}</b><small>{period === "week" ? "Money earned this week" : "Money earned this month"}</small>
          <div className="finance-mini-bars income-bars">{Array.from({ length: 12 }, (_, index) => <i key={index}/>)}</div>
        </article>
        <article className="finance-stat expense-stat">
          <div className="finance-stat-head"><span className="stat-icon peach"><Icon name="arrow" size={17}/></span><span className="finance-period">THIS {period.toUpperCase()}</span></div>
          <div className="finance-label">TOTAL EXPENSES</div><b>{formatCurrency(expenseTotal)}</b><small>Daily expenses + scheduled EMIs</small>
          <div className="finance-mini-bars expense-bars">{Array.from({ length: 12 }, (_, index) => <i key={index}/>)}</div>
        </article>
        <article className="finance-stat saving-stat">
          <div className="finance-stat-head"><span className="stat-icon lilac"><Icon name="target" size={17}/></span><span className="finance-period">THIS {period.toUpperCase()}</span></div>
          <div className="finance-label">SAVED SO FAR</div><b>{formatCurrency(savingsTotal)}</b><small>For this {period}</small>
          <div className="savings-progress"><span style={{ width: `${Math.min(100, savingsTotal / 15000 * 100)}%` }}/></div>
          <div className="savings-caption">{formatCurrency(savingsTotal)} <span>of ₹15,000 monthly target</span></div>
        </article>
        <article className="finance-stat balance-stat">
          <div className="finance-stat-head"><span className="stat-icon sand"><Icon name="spark" size={17}/></span><span className="finance-period">THIS {period.toUpperCase()}</span></div>
          <div className="finance-label">LEFT AFTER SPENDING</div><b>{formatCurrency(incomeTotal - expenseTotal - savingsTotal)}</b><small>Earnings minus expenses and savings</small>
          <div className="balance-note"><span className="status-dot green"/> You’re giving your money a plan</div>
        </article>
      </div>

      <section className="panel class-income-panel">
        <div className="panel-heading"><div><div className="section-kicker">MUSIC CLASSES</div><h2>Teaching income</h2></div><button className="text-button" onClick={() => app.setSection("Students")}>Manage students <Icon name="arrow" size={14}/></button></div>
        <div className="class-income-grid">
          <div><small>MUSIC EARNINGS THIS {period.toUpperCase()}</small><b>{formatCurrency(classIncome)}</b></div>
          <div><small>FEES RECEIVED</small><b>{formatCurrency(receivedClassIncome)}</b></div>
          <div><small>STILL DUE</small><b>{formatCurrency(expectedClassIncome - receivedClassIncome)}</b></div>
        </div>
        <p>Mark a student’s cycle fee as paid in Your Studio to add it to received income and your earnings.</p>
      </section>

      <div className="finance-tools-grid">
        <section className="panel finance-expense-planner">
          <div className="panel-heading"><div><div className="section-kicker">DAILY EXPENSE PLANNER</div><h2>Expenses for this {period}</h2></div><button className="primary-button small-primary" onClick={() => openTransactionForm("expense")}><Icon name="plus" size={14}/> Add expense</button></div>
          <p className="finance-helper">Add each expense on the day it happens. It rolls into both weekly and monthly totals automatically.</p>
          <div className="transaction-list">
            {periodTransactions.filter(item => item.type === "expense").map(item => <article className="transaction-row" key={item.id}>
              <span className="transaction-icon expense"><Icon name="arrow" size={15}/></span>
              <span className="transaction-description"><b>{item.title}</b><small>{item.category} · {item.dateKey ?? item.date}</small></span>
              <span className="transaction-amount expense">−{formatCurrency(item.amount)}</span>
              <button className="student-edit-button" onClick={() => openTransactionForm("expense", item)}>Edit</button>
              <button className="row-action danger-action" onClick={() => removeTransaction(item)} aria-label={`Remove ${item.title}`}><Icon name="close" size={14}/></button>
            </article>)}
            {periodTransactions.every(item => item.type !== "expense") && <div className="empty-transactions">No daily expenses recorded for this {period} yet.</div>}
          </div>
        </section>

        <section className="panel emi-panel">
          <div className="panel-heading"><div><div className="section-kicker">RECURRING PAYMENTS</div><h2>EMIs</h2></div><span className="emi-period-total">{formatCurrency(emiTotal)} this {period}</span></div>
          <p className="finance-helper">Set the installment amount, first due date, and term. Every monthly installment is added to expenses until the term ends.</p>
          <form className="emi-add-form" onSubmit={submitEmi}>
            <label>EMI name (optional)<input value={emiTitle} onChange={event => setEmiTitle(event.target.value)} placeholder="e.g. Keyboard loan"/></label>
            <label>Amount per month<input required type="number" min="1" value={emiAmount} onChange={event => setEmiAmount(event.target.value)} placeholder="₹"/></label>
            <label>First payment date<input required type="date" value={emiStartDate} onChange={event => { setEmiStartDate(event.target.value); setEmiDueDay(String(Number(event.target.value.slice(-2)) || 1)); }}/></label>
            <label>Number of months<input required type="number" min="1" max="600" value={emiMonths} onChange={event => setEmiMonths(event.target.value)}/></label>
            <button className="primary-button small-primary" type="submit"><Icon name="plus" size={14}/> {editingEmiId ? "Save EMI changes" : "Add monthly EMI"}</button>
          </form>
          <div className="emi-list"><div className="section-kicker">PAYMENT SCHEDULE</div>{visibleInstallments.map(item => <article className="emi-row" key={`${item.emi.id}-${item.dueDate}`}><span><b>{item.emi.title || "EMI"} · {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${item.dueDate}T12:00:00`))}</b><small>₹{item.emi.amount.toLocaleString("en-IN")} {item.paid ? "· Paid" : "· Due"}</small></span><button className={`student-edit-button ${item.paid ? "emi-paid-button" : ""}`} onClick={() => toggleInstallmentPaid(item.emi.id, item.dueDate)}>{item.paid ? "Mark due" : "Mark paid"}</button></article>)}{emis.length === 0 && <div className="empty-transactions">Add an EMI to include it in your planned expenses.</div>}{emis.length > 0 && visibleInstallments.length === 0 && <div className="empty-transactions">All EMI payments are complete.</div>}</div>
          <div className="emi-list emi-contract-list">{emis.map(emi => <article className="emi-row" key={emi.id}><span><b>{emi.title || "EMI"}</b><small>₹{emi.amount.toLocaleString("en-IN")} × {emi.months} months</small></span><button className="student-edit-button" onClick={() => editEmi(emi)}>Edit</button><button className="row-action danger-action" onClick={() => setEmis(current => current.filter(item => item.id !== emi.id))} aria-label={`Remove ${emi.title || "EMI"}`}><Icon name="close" size={14}/></button></article>)}</div>
        </section>
      </div>

      <section className="panel class-income-panel schedule-income-panel">
        <div className="panel-heading"><div><div className="section-kicker">BASED ON YOUR WEEKLY SCHEDULE</div><h2>Class income forecast</h2></div><span className="roster-note">Cycle fee ÷ {"8 or 12 classes"}</span></div>
        <div className="schedule-forecast-grid">
          <IncomeForecast label="This week" forecast={weekForecast}/>
          <IncomeForecast label="This month" forecast={monthForecast}/>
        </div>
        <div className="month-week-strip-heading"><b>Week by week</b><span>Scroll sideways to see every week this month</span></div>
        <div className="month-week-strip" role="region" aria-label="Weekly class income forecasts for this month" tabIndex={0}>
          {monthWeeks.map((dates, index) => {
            const forecast = getStudioIncomeForecast(app.students, app.plannerEvents, dates);
            const dateRange = `${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(dates[0])}–${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(dates[dates.length - 1])}`;
            return <IncomeForecast key={dateRange} label={`Week ${index + 1} · ${dateRange}`} forecast={forecast}/>;
          })}
        </div>
        <p>Forecast subtracts missed classes. Scheduled sessions count as received income only after you mark the student’s cycle fee paid.</p>
      </section>

      <div className="finance-layout">
        <section className="panel transactions-panel">
          <div className="panel-heading">
            <div><div className="section-kicker">YOUR MONEY STORY</div><h2>Recent activity</h2></div>
            <button className="primary-button small-primary" onClick={() => openTransactionForm("income")}><Icon name="plus" size={15}/> Add activity</button>
          </div>
          <div className="finance-filters">
            {filters.map(filter => <button key={filter} className={financeFilter === filter ? "active" : ""} onClick={() => setFinanceFilter(filter)}>{filter}</button>)}
          </div>
          <div className="transaction-list">
            {visibleTransactions.map(item => (
              <article className="transaction-row" key={item.id}>
                <span className={`transaction-icon ${item.type}`}>
                  {item.type === "income" ? <Icon name="arrow" size={16}/> : item.type === "saving" ? <Icon name="target" size={16}/> : <Icon name="arrow" size={16}/>}
                </span>
                <span className="transaction-description"><b>{item.title}</b><small>{item.category} · {item.date}</small></span>
                <span className={`transaction-amount ${item.type}`}>{item.type === "income" ? "+" : item.type === "saving" ? "↗ " : "−"}{formatCurrency(item.amount)}</span>
                <button className="student-edit-button" onClick={() => openTransactionForm(item.type, item)}>Edit</button>
                <button className="row-action danger-action" onClick={() => removeTransaction(item)} aria-label={`Remove ${item.title}`}><Icon name="close" size={14}/></button>
              </article>
            ))}
            {visibleTransactions.length === 0 && <div className="empty-transactions">Nothing here yet. Add an activity to start tracking.</div>}
          </div>
        </section>

        <div className="finance-side">
          <section className="panel savings-panel">
            <div className="panel-heading"><div><div className="section-kicker">FUTURE YOU SAYS THANKS</div><h2>Savings goals</h2></div><button className="icon-button" onClick={() => openTransactionForm("saving")} aria-label="Add to savings"><Icon name="plus" size={16}/></button></div>
            <SavingsGoal title="Rainy day fund" category="Emergency fund" amount={emergencySaving} target={20000} tint="lavender" icon="✦"/>
            <SavingsGoal title="New keyboard" category="Personal goal" amount={personalSaving} target={30000} tint="mint" icon="♫"/>
            <button className="add-goal-link" onClick={() => openTransactionForm("saving")}><Icon name="plus" size={15}/> Add to savings</button>
          </section>
          <section className="panel spending-panel">
            <div className="section-kicker">A LITTLE SPENDING CHECK-IN</div><h2>Where it goes</h2>
            {categories.map(([category, amount], index) => <div className="spend-category" key={category}><span className={`spend-dot ${["food", "travel", "other"][index]}`}/><span>{category}</span><b>{formatCurrency(amount)}</b></div>)}
            <div className="spend-total"><span>Your spending</span><b>{formatCurrency(expenseTotal)}</b></div>
          </section>
        </div>
      </div>
    </>
  );
}

function IncomeForecast({ label, forecast }: { label: string; forecast: ReturnType<typeof getStudioIncomeForecast> }) {
  return (
    <article className="schedule-forecast-card">
      <h3>{label}</h3>
      <div className="schedule-forecast-stats">
        <div><small>SCHEDULED</small><b>{forecast.scheduledClasses}</b></div>
        <div><small>COMPLETED</small><b>{forecast.completedClasses}</b></div>
        <div className="missed-forecast"><small>MISSED</small><b>{forecast.missedClasses}</b></div>
      </div>
      <div className="forecast-money-row"><span>Scheduled value</span><b>{formatCurrency(forecast.scheduledValue)}</b></div>
      <div className="forecast-money-row missed-forecast"><span>Missed value</span><b>−{formatCurrency(forecast.missedValue)}</b></div>
      <div className="forecast-money-row forecast-total"><span>Projected class income</span><b>{formatCurrency(forecast.projectedValue)}</b></div>
    </article>
  );
}

function SavingsGoal({ title, category, amount, target, tint, icon }: { title: string; category: string; amount: number; target: number; tint: "lavender" | "mint"; icon: string }) {
  return (
    <article className="saving-goal">
      <div className="saving-goal-top"><span className={`goal-icon ${tint}`}>{icon}</span><span className="saving-goal-name"><b>{title}</b><small>{category}</small></span><b className="saving-amount">{formatCurrency(amount)}</b></div>
      <div className="goal-bar"><span className={tint} style={{ width: `${Math.min(100, amount / target * 100)}%` }}/></div>
      <div className="saving-goal-foot"><span>Goal {formatCurrency(target)}</span><span>{amount >= target ? "Goal reached" : "Keep going"}</span></div>
    </article>
  );
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getEmiInstallments(emi: { startDate: string; dueDay: number; months: number }) {
  const [year, month] = emi.startDate.split("-").map(Number);
  return Array.from({ length: Math.max(1, emi.months) }, (_, index) => {
    const dueMonth = month - 1 + index;
    const lastDay = new Date(year, dueMonth + 1, 0).getDate();
    return dateKey(new Date(year, dueMonth, Math.min(emi.dueDay, lastDay)));
  });
}

function legacyTransactionDate(value: string, year: number) {
  const parsed = new Date(/\d{4}/.test(value) ? value : `${value} ${year}`);
  return Number.isNaN(parsed.getTime()) ? "0000-00-00" : dateKey(parsed);
}
