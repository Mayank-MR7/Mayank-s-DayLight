"use client";

import { useEffect, useMemo, useState } from "react";
import { initialGoals, initialPlannerEvents, initialSleepRecord, initialStudents, initialTransactions, weekdays } from "@/data/initial-data";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { normalizePlannerEvents } from "@/features/planner/normalize-planner-events";
import { normalizeStudents } from "@/features/students/normalize-students";
import { toDateKey } from "@/lib/planner-dates";
import { normalizeGoals, normalizeSleepRecord, normalizeTransactions } from "@/features/app/normalize-app-data";
import type { AppSection, Emi, EventKind, FinanceFilter, Goal, GoalPeriod, LessonStatus, PlannerEvent, Project, Student, Transaction, TransactionType, WeeklyClass } from "@/types/app";

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useAppState() {
  const [section, setSection] = useState<AppSection>("Overview");
  const [calendarMode, setCalendarMode] = useState<"Week" | "Month">("Week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [plannerView, setPlannerView] = useState<"Day" | "Week" | "Month">("Day");
  const [selectedPlannerDate, setSelectedPlannerDate] = useState(() => new Date());
  const [goalPeriod, setGoalPeriod] = useState<GoalPeriod>("Today");
  const [financeFilter, setFinanceFilter] = useState<FinanceFilter>("All activity");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const [goals, setGoals] = usePersistentState("daylight-goals", initialGoals, normalizeGoals);
  const [projects, setProjects] = usePersistentState<Project[]>("daylight-projects", []);
  const [students, setStudents] = usePersistentState("daylight-students", initialStudents, normalizeStudents);
  const [transactions, setTransactions] = usePersistentState("daylight-finances", initialTransactions, normalizeTransactions);
  const [emis, setEmis] = usePersistentState<Emi[]>("daylight-emis", [], normalizeEmis);
  const [storedPlannerEvents, setPlannerEvents] = usePersistentState("daylight-events", initialPlannerEvents, normalizePlannerEvents);
  const [sleepRecord, setSleepRecord] = usePersistentState("daylight-sleep", initialSleepRecord, normalizeSleepRecord);

  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentInstrument, setStudentInstrument] = useState("");
  const [studentFee, setStudentFee] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [studentCycleCount, setStudentCycleCount] = useState<8 | 12>(8);
  const [studentInitialClasses, setStudentInitialClasses] = useState("0");
  const [studentWeeklyClasses, setStudentWeeklyClasses] = useState<WeeklyClass[]>([{ id: "new-class-1", day: (new Date().getDay() + 6) % 7, start: 16, duration: 1 }]);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalDailyHours, setGoalDailyHours] = useState("3");
  const [goalDurationDays, setGoalDurationDays] = useState("7");
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectTechStack, setProjectTechStack] = useState("");
  const [projectTargetHours, setProjectTargetHours] = useState("40");
  const [projectDailyHours, setProjectDailyHours] = useState("2");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>("expense");
  const [transactionTitle, setTransactionTitle] = useState("");
  const [transactionCategory, setTransactionCategory] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(() => toDateKey(new Date()));
  const [editingTransactionId, setEditingTransactionId] = useState<string | number | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState(() => toDateKey(new Date()));
  const [eventStartTime, setEventStartTime] = useState("10:00");
  const [eventEndTime, setEventEndTime] = useState("11:00");
  const [eventDetails, setEventDetails] = useState("");
  const [eventStudentId, setEventStudentId] = useState("");
  const [eventGoalId, setEventGoalId] = useState("");
  const [eventProjectId, setEventProjectId] = useState("");
  const [eventError, setEventError] = useState("");
  const [eventKind, setEventKind] = useState<EventKind>("personal");
  const [showSleepForm, setShowSleepForm] = useState(false);
  const [sleepBedInput, setSleepBedInput] = useState(initialSleepRecord.bed);
  const [sleepWakeInput, setSleepWakeInput] = useState(initialSleepRecord.wake);

  const today = new Date();
  const plannerEvents = useMemo(() => {
    const recurringStudentClasses: PlannerEvent[] = students.flatMap(student => (student.weeklyClasses ?? []).map(weeklyClass => ({
      id: `student-class-${student.id}-${weeklyClass.id}`,
      title: `${student.instrument.split(" · ")[0]} class`,
      day: weeklyClass.day,
      start: weeklyClass.start,
      duration: weeklyClass.duration,
      studentId: student.id ?? student.name,
      status: "scheduled" as const,
      kind: "lesson" as const,
      studentSchedule: true,
    })));
    const unrelatedEvents = storedPlannerEvents.filter(event => event.date || !students.some(student =>
      (student.id ?? student.name) === event.studentId && student.weeklyClasses.some(weeklyClass => weeklyClass.day === event.day && weeklyClass.start === event.start),
    ));
    return [...unrelatedEvents, ...recurringStudentClasses];
  }, [storedPlannerEvents, students]);
  const todayDayIndex = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - todayDayIndex + weekOffset * 7);
  const weekDates = weekdays.map((_, index) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index));
  const dateNumbers = weekDates.map(date => date.getDate());
  const weekRangeLabel = `${new Intl.DateTimeFormat("en", { month: "long", day: "numeric" }).format(weekDates[0])} – ${new Intl.DateTimeFormat("en", { month: "long", day: "numeric" }).format(weekDates[6])}`;
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthOffset = (monthStart.getDay() + 6) % 7;
  const monthDates = Array.from({ length: 42 }, (_, index) => new Date(today.getFullYear(), today.getMonth(), 1 - monthOffset + index));
  const monthLabel = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(today);
  const selectedPlannerDay = (selectedPlannerDate.getDay() + 6) % 7;
  const plannerWeekStart = new Date(selectedPlannerDate);
  plannerWeekStart.setDate(selectedPlannerDate.getDate() - selectedPlannerDay);
  const plannerWeekDates = weekdays.map((_, index) => new Date(plannerWeekStart.getFullYear(), plannerWeekStart.getMonth(), plannerWeekStart.getDate() + index));
  const plannerWeekLabel = `${new Intl.DateTimeFormat("en", { month: "long", day: "numeric" }).format(plannerWeekDates[0])} – ${new Intl.DateTimeFormat("en", { month: "long", day: "numeric" }).format(plannerWeekDates[6])}`;
  const plannerMonthStart = new Date(selectedPlannerDate.getFullYear(), selectedPlannerDate.getMonth(), 1);
  const plannerMonthOffset = (plannerMonthStart.getDay() + 6) % 7;
  const plannerMonthDates = Array.from({ length: 42 }, (_, index) => new Date(selectedPlannerDate.getFullYear(), selectedPlannerDate.getMonth(), 1 - plannerMonthOffset + index));
  const plannerMonthLabel = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(selectedPlannerDate);
  const dateLabel = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(today);
  const remainingHours = Math.max(0, (23 - today.getHours()) + (60 - today.getMinutes()) / 60);

  const filteredStudents = useMemo(
    () => students.filter(student => `${student.name} ${student.instrument}`.toLowerCase().includes(query.toLowerCase())),
    [students, query],
  );
  const incomeTotal = transactions.filter(item => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenseTotal = transactions.filter(item => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const savingsTotal = transactions.filter(item => item.type === "saving").reduce((sum, item) => sum + item.amount, 0);
  const visibleTransactions = transactions.filter(item => financeFilter === "All activity" || item.type === financeFilter.toLowerCase().replace(/s$/, ""));
  const expectedClassIncome = students.reduce((sum, student) => sum + student.fee, 0);
  const receivedClassIncome = students.filter(student => student.paid).reduce((sum, student) => sum + student.fee, 0);
  const goalProgress = goals.map(goal => {
    const sessions = plannerEvents.filter(event => event.goalId === goal.id && event.status === "completed" && isDateInGoalPlan(event.date, goal, today));
    const sessionMinutes = sessions.reduce((total, event) => total + Math.round(event.duration * 60), 0);
    const dailyMinutes = sumSessionsForDate(sessions, toDateKey(today));
    const weekDatesForProgress = getWeekDates(today);
    const monthDatesForProgress = getMonthDates(today);
    const weeklyMinutes = sessions.filter(event => event.date && weekDatesForProgress.includes(event.date)).reduce((total, event) => total + Math.round(event.duration * 60), 0);
    const monthlyMinutes = sessions.filter(event => event.date && monthDatesForProgress.includes(event.date)).reduce((total, event) => total + Math.round(event.duration * 60), 0);
    const dailyTarget = goal.dailyTargetMinutes ?? 0;
    return {
      ...goal,
      done: Math.min(goal.total, goal.done + sessionMinutes),
      mins: goal.mins + sessionMinutes,
      manualMinutes: goal.done,
      dailyMinutes,
      weeklyMinutes,
      monthlyMinutes,
      activeToday: isDateInGoalPlan(toDateKey(today), goal, today),
      weeklyTargetMinutes: dailyTarget * countPlanDays(weekDatesForProgress, goal, today),
      monthlyTargetMinutes: dailyTarget * countPlanDays(monthDatesForProgress, goal, today),
    };
  });
  const projectProgress = projects.map(project => {
    const sessions = plannerEvents.filter(event => event.projectId === project.id && event.status === "completed" && event.date && event.date >= project.createdAt);
    const loggedMinutes = sessions.reduce((total, event) => total + Math.round(event.duration * 60), 0);
    const weeklyDates = getWeekDates(today);
    const monthlyDates = getMonthDates(today);
    const dailyTarget = project.dailyTargetMinutes ?? 0;
    return {
      ...project,
      doneMinutes: project.manualMinutes + loggedMinutes,
      dailyMinutes: sumSessionsForDate(sessions, toDateKey(today)),
      weeklyMinutes: sessions.filter(event => event.date && weeklyDates.includes(event.date)).reduce((total, event) => total + Math.round(event.duration * 60), 0),
      monthlyMinutes: sessions.filter(event => event.date && monthlyDates.includes(event.date)).reduce((total, event) => total + Math.round(event.duration * 60), 0),
      weeklyTargetMinutes: dailyTarget * weeklyDates.filter(date => date >= project.createdAt).length,
      monthlyTargetMinutes: dailyTarget * monthlyDates.filter(date => date >= project.createdAt).length,
      activeToday: project.createdAt <= toDateKey(today),
    };
  });

  useEffect(() => {
    setDarkMode(window.localStorage.getItem("daylight-theme") !== "light");
  }, []);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function toggleTheme() {
    setDarkMode(current => {
      const next = !current;
      window.localStorage.setItem("daylight-theme", next ? "dark" : "light");
      return next;
    });
  }

  function addStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studentName.trim()) return;
    const initials = studentName.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase();
    const existingStudent = students.find(student => (student.id ?? student.name) === editingStudentId);
    const loggedClassCount = existingStudent ? storedPlannerEvents.filter(event => event.kind === "lesson" && event.status === "completed" && event.date && event.studentId === (existingStudent.id ?? existingStudent.name)).length : 0;
    const studentData = {
      name: studentName.trim(), instrument: studentInstrument.trim() || "Music · Student", address: studentAddress.trim(), initials,
      fee: Number(studentFee) || 0, cycleCount: studentCycleCount, weeklyClasses: studentWeeklyClasses,
      initialClasses: Math.max(0, Math.floor(Number(studentInitialClasses) || 0) - loggedClassCount),
    };
    if (editingStudentId) {
      setStudents(current => current.map(student => student.id === editingStudentId ? { ...student, ...studentData } : student));
      const editedStudent = students.find(student => student.id === editingStudentId);
      if (editedStudent?.paid && editedStudent.paymentTransactionId) {
        setTransactions(current => current.map(transaction => String(transaction.id) === editedStudent.paymentTransactionId
          ? { ...transaction, title: `${studentData.name} · ${studentData.cycleCount}-class fee`, amount: studentData.fee }
          : transaction));
      }
      flash("Student details updated");
    } else {
      setStudents(current => [...current, {
        id: createId(), ...studentData, color: "mint", next: "See planner for schedule", paid: false,
      }]);
      flash("Student added to your studio");
    }
    resetStudentForm();
  }

  function resetStudentForm() {
    setStudentName(""); setStudentInstrument(""); setStudentAddress(""); setStudentFee(""); setStudentCycleCount(8); setStudentInitialClasses("0");
    setStudentWeeklyClasses([{ id: createId(), day: (new Date().getDay() + 6) % 7, start: 16, duration: 1 }]);
    setEditingStudentId(null); setShowStudentForm(false);
  }

  function openStudentForm() {
    setStudentName(""); setStudentInstrument(""); setStudentAddress(""); setStudentFee(""); setStudentCycleCount(8); setStudentInitialClasses("0");
    setStudentWeeklyClasses([{ id: createId(), day: (new Date().getDay() + 6) % 7, start: 16, duration: 1 }]);
    setEditingStudentId(null); setShowStudentForm(true);
  }

  function editStudent(student: Student) {
    setEditingStudentId(student.id ?? student.name);
    setStudentName(student.name); setStudentInstrument(student.instrument); setStudentAddress(student.address);
    setStudentFee(String(student.fee)); setStudentCycleCount(student.cycleCount);
    const loggedClassCount = storedPlannerEvents.filter(event => event.kind === "lesson" && event.status === "completed" && event.date && event.studentId === (student.id ?? student.name)).length;
    setStudentInitialClasses(String((student.initialClasses ?? 0) + loggedClassCount));
    setStudentWeeklyClasses(student.weeklyClasses.length ? student.weeklyClasses : [{ id: createId(), day: 0, start: 16, duration: 1 }]);
    setShowStudentForm(true);
  }

  function addStudentClassTime() {
    if (studentWeeklyClasses.length >= 3) return;
    setStudentWeeklyClasses(current => [...current, { id: createId(), day: current[0]?.day ?? 0, start: 16, duration: 1 }]);
  }

  function removeStudentClassTime(id: string) {
    setStudentWeeklyClasses(current => current.filter(item => item.id !== id));
  }

  function addGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!goalName.trim()) return;
    const dailyTargetMinutes = Math.round((Number(goalDailyHours) || 0) * 60);
    const durationDays = Math.max(1, Number(goalDurationDays) || 1);
    const period = durationDays <= 7 ? "This week" : "This month";
    if (editingGoalId) {
      setGoals(current => current.map(goal => (goal.id ?? goal.title) === editingGoalId ? {
        ...goal, title: goalName.trim(), dailyTargetMinutes, durationDays, total: dailyTargetMinutes * durationDays,
      } : goal));
      flash("Goal updated");
    } else {
      setGoals(current => [...current, {
        id: createId(), title: goalName.trim(), category: "Learning", done: 0, total: dailyTargetMinutes * durationDays,
        tint: "lavender", icon: "✦", mins: 0, period, dailyTargetMinutes, durationDays, startDate: toDateKey(new Date()),
      }]);
      setGoalPeriod(period);
      flash("Learning goal added");
    }
    resetGoalForm();
  }

  function resetGoalForm() {
    setGoalName(""); setGoalDailyHours("3"); setGoalDurationDays("7"); setEditingGoalId(null); setShowGoalForm(false);
  }

  function openGoalForm() {
    setGoalName(""); setGoalDailyHours("3"); setGoalDurationDays("7"); setEditingGoalId(null); setShowGoalForm(true);
  }

  function editGoal(goal: Goal) {
    setEditingGoalId(goal.id ?? goal.title);
    setGoalName(goal.title);
    setGoalDailyHours(String((goal.dailyTargetMinutes ?? goal.total) / 60));
    setGoalDurationDays(String(goal.durationDays ?? 1));
    setShowGoalForm(true);
  }

  function updateGoalManualProgress(goal: Goal, minutes: number) {
    const safeMinutes = Math.max(0, Math.min(goal.total, Math.round(minutes || 0)));
    setGoals(current => current.map(item => item.id === goal.id ? { ...item, done: safeMinutes, mins: safeMinutes } : item));
  }

  function saveProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectTitle.trim()) return;
    const projectData = {
      title: projectTitle.trim(), description: projectDescription.trim(),
      techStack: projectTechStack.split(",").map(item => item.trim()).filter(Boolean),
      targetHours: Math.max(1, Number(projectTargetHours) || 1),
      dailyTargetMinutes: Math.round((Number(projectDailyHours) || 0) * 60),
    };
    if (editingProjectId) {
      setProjects(current => current.map(project => project.id === editingProjectId ? { ...project, ...projectData } : project));
      flash("Project updated");
    } else {
      setProjects(current => [...current, { id: createId(), ...projectData, manualMinutes: 0, createdAt: toDateKey(new Date()) }]);
      flash("Project added");
    }
    resetProjectForm();
  }

  function resetProjectForm() {
    setProjectTitle(""); setProjectDescription(""); setProjectTechStack(""); setProjectTargetHours("40"); setProjectDailyHours("2"); setEditingProjectId(null); setShowProjectForm(false);
  }

  function openProjectForm() {
    resetProjectForm(); setShowProjectForm(true);
  }

  function editProject(project: Project) {
    setEditingProjectId(project.id); setProjectTitle(project.title); setProjectDescription(project.description);
    setProjectTechStack(project.techStack.join(", ")); setProjectTargetHours(String(project.targetHours)); setShowProjectForm(true);
    setProjectDailyHours(String((project.dailyTargetMinutes ?? 120) / 60));
  }

  function updateProjectManualProgress(projectId: string, minutes: number) {
    setProjects(current => current.map(project => project.id === projectId ? { ...project, manualMinutes: Math.max(0, Math.round(minutes || 0)) } : project));
  }

  function removeProject(projectId: string) {
    setProjects(current => current.filter(project => project.id !== projectId));
  }

  function addTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!transactionTitle.trim() || !Number(transactionAmount)) return;
    const date = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${transactionDate}T12:00:00`));
    const transaction = {
      id: editingTransactionId ?? createId(), title: transactionTitle.trim(),
      category: transactionCategory || (transactionType === "income" ? "Other income" : transactionType === "saving" ? "Savings goal" : "Other expense"),
      amount: Number(transactionAmount), type: transactionType, date, dateKey: transactionDate,
    };
    if (editingTransactionId !== null) setTransactions(current => current.map(item => item.id === editingTransactionId ? transaction : item));
    else setTransactions(current => [transaction, ...current]);
    setTransactionTitle(""); setTransactionCategory(""); setTransactionAmount(""); setTransactionDate(toDateKey(new Date())); setEditingTransactionId(null); setShowTransactionForm(false);
    flash(editingTransactionId !== null ? "Finance activity updated" : "Finance activity added");
  }

  function openTransactionForm(type: TransactionType = "expense", transaction?: Transaction) {
    setTransactionType(transaction?.type ?? type);
    setTransactionTitle(transaction?.title ?? ""); setTransactionCategory(transaction?.category ?? "");
    setTransactionAmount(transaction ? String(transaction.amount) : "");
    const legacyDate = transaction ? (/\d{4}/.test(transaction.date) ? transaction.date : `${transaction.date} ${new Date().getFullYear()}`) : "";
    setTransactionDate(transaction?.dateKey ?? (transaction ? toDateKey(new Date(legacyDate)) : toDateKey(new Date()))); setEditingTransactionId(transaction?.id ?? null);
    setShowTransactionForm(true);
  }

  function addEmi(event: React.FormEvent<HTMLFormElement>, details: Omit<Emi, "id" | "paidDates">) {
    event.preventDefault();
    if (details.amount <= 0 || details.months <= 0 || !details.startDate) return;
    setEmis(current => [...current, { ...details, id: createId(), title: details.title.trim() || "EMI", dueDay: Math.max(1, Math.min(31, details.dueDay)), months: Math.max(1, Math.floor(details.months)), paidDates: [] }]);
    flash("EMI payment schedule added");
  }

  function addPlannerEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!eventTitle.trim()) return;
    const startMinutes = timeToMinutes(eventStartTime);
    const endMinutes = timeToMinutes(eventEndTime);
    if (endMinutes <= startMinutes) {
      setEventError("End time needs to be later than start time. Events can’t cross midnight yet.");
      return;
    }
    const selectedStudent = students.find(student => (student.id ?? student.name) === eventStudentId);
    if (eventKind === "lesson" && !selectedStudent) {
      setEventError("Add a music student before scheduling a lesson.");
      return;
    }
    const date = new Date(`${eventDate}T12:00:00`);
    setPlannerEvents(current => [...current, {
      id: createId(), title: eventTitle.trim(), date: eventDate, day: (date.getDay() + 6) % 7, start: startMinutes / 60,
      duration: (endMinutes - startMinutes) / 60, details: eventDetails.trim() || undefined,
      studentId: eventKind === "lesson" ? (selectedStudent?.id ?? selectedStudent?.name) : undefined,
      goalId: eventKind === "focus" || eventKind === "music" ? eventGoalId || undefined : undefined,
      projectId: eventKind === "focus" || eventKind === "music" ? eventProjectId || undefined : undefined,
      status: "scheduled",
      kind: eventKind,
    }]);
    setEventTitle(""); setEventDetails(""); setEventError(""); setShowEventForm(false);
    flash(eventKind === "lesson" ? `Lesson scheduled for ${selectedStudent?.name}` : "Added to your planner");
  }

  function openEventForm(date = selectedPlannerDate) {
    setEventDate(toDateKey(date));
    if (!goals.some(goal => goal.id === eventGoalId)) setEventGoalId(goals[0]?.id ?? "");
    if (!projects.some(project => project.id === eventProjectId)) setEventProjectId("");
    if (!students.some(student => (student.id ?? student.name) === eventStudentId)) {
      const firstStudent = students[0];
      setEventStudentId(firstStudent ? firstStudent.id ?? firstStudent.name : "");
    }
    setEventError("");
    setShowEventForm(true);
  }

  function timeToMinutes(value: string) {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function openSleepForm() {
    setSleepBedInput(sleepRecord.bed); setSleepWakeInput(sleepRecord.wake); setShowSleepForm(true);
  }

  function saveSleepRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const [bedHour, bedMinute] = sleepBedInput.split(":").map(Number);
    const [wakeHour, wakeMinute] = sleepWakeInput.split(":").map(Number);
    const minutes = ((wakeHour * 60 + wakeMinute) - (bedHour * 60 + bedMinute) + 1440) % 1440;
    if (minutes < 60) { flash("Please enter a sleep period of at least one hour"); return; }
    setSleepRecord({ bed: sleepBedInput, wake: sleepWakeInput, minutes });
    setShowSleepForm(false); flash("Last night’s rest is updated");
  }

  function clockLabel(time: string) {
    const [hour, minute] = time.split(":").map(Number);
    return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
  }

  function toggleStudentPaid(student: Student) {
    if (student.paid) {
      setStudents(current => current.map(item => item.id === student.id ? { ...item, paid: false, paymentTransactionId: undefined } : item));
      if (student.paymentTransactionId) setTransactions(current => current.filter(item => String(item.id) !== student.paymentTransactionId));
      flash(`${student.name}: payment marked due`);
      return;
    }
    const transactionId = createId();
    setTransactions(current => [{
      id: transactionId, title: `${student.name} · ${student.cycleCount}-class fee`, category: "Music classes",
      amount: student.fee, type: "income", date: new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date()), dateKey: toDateKey(new Date()),
    }, ...current]);
    setStudents(current => current.map(item => item.id === student.id ? { ...item, paid: true, paymentTransactionId: transactionId } : item));
    flash(`${student.name}: fee received and added to income`);
  }

  function setStudentClassCount(student: Student, total: number, loggedCount: number) {
    const safeTotal = Math.max(loggedCount, Math.floor(Number(total) || 0));
    setStudents(current => current.map(item => (item.id ?? item.name) === (student.id ?? student.name)
      ? { ...item, initialClasses: safeTotal - loggedCount }
      : item));
  }

  function removeStudent(student: Student) {
    setStudents(current => current.filter(item => student.id ? item.id !== student.id : item.name !== student.name));
    setPlannerEvents(current => current.filter(event => event.studentId !== (student.id ?? student.name)));
    flash(`${student.name} removed`);
  }

  function removeGoal(goal: Goal) {
    setGoals(current => current.filter(item => goal.id ? item.id !== goal.id : item.title !== goal.title)); flash("Goal removed");
  }

  function removeTransaction(transaction: Transaction) {
    setTransactions(current => current.filter(item => item.id !== transaction.id)); flash("Finance activity removed");
  }

  function removePlannerEvent(plannerEvent: PlannerEvent) {
    setPlannerEvents(current => current.filter(item => plannerEvent.id ? item.id !== plannerEvent.id : item.title !== plannerEvent.title || item.day !== plannerEvent.day || item.start !== plannerEvent.start)); flash("Event removed from your planner");
  }

  function updateEventStatus(plannerEvent: PlannerEvent, status: LessonStatus, occurrenceDate = selectedPlannerDate) {
    setPlannerEvents(current => {
      if (plannerEvent.date) return current.map(item => item.id === plannerEvent.id ? { ...item, status } : item);
      const date = toDateKey(occurrenceDate);
      const existing = current.find(item => item.date === date && item.templateId === plannerEvent.id);
      if (existing) return current.map(item => item.id === existing.id ? { ...item, status } : item);
      return [...current, { ...plannerEvent, id: createId(), date, templateId: plannerEvent.id, status }];
    });
    flash(status === "completed" ? "Task marked complete" : status === "incomplete" ? "Task marked incomplete" : "Task returned to scheduled");
  }

  function progressGoal(goal: Goal) {
    setGoals(current => current.map(item => (goal.id ? item.id === goal.id : item.title === goal.title)
      ? { ...item, done: Math.min(item.done + 5, item.total), mins: item.mins + 5 }
      : item));
  }

  return {
    section, setSection, calendarMode, setCalendarMode, weekOffset, setWeekOffset, plannerView, setPlannerView,
    selectedPlannerDate, setSelectedPlannerDate, selectedPlannerDay, plannerWeekDates, plannerWeekLabel, plannerMonthDates, plannerMonthLabel,
    goalPeriod, setGoalPeriod,
    financeFilter, setFinanceFilter, query, setQuery, toast, darkMode, toggleTheme,
    goals, goalProgress, setGoals, projects, projectProgress, students, transactions, plannerEvents, setPlannerEvents, sleepRecord,
    showStudentForm, setShowStudentForm, studentName, setStudentName, studentInstrument, setStudentInstrument, studentFee, setStudentFee, studentInitialClasses, setStudentInitialClasses,
    studentAddress, setStudentAddress, studentCycleCount, setStudentCycleCount, studentWeeklyClasses, setStudentWeeklyClasses,
    editingStudentId, resetStudentForm, openStudentForm, editStudent, addStudentClassTime, removeStudentClassTime,
    showGoalForm, setShowGoalForm, resetGoalForm, openGoalForm, editGoal, goalName, setGoalName,
    goalDailyHours, setGoalDailyHours, goalDurationDays, setGoalDurationDays, editingGoalId, updateGoalManualProgress,
    showProjectForm, setShowProjectForm, resetProjectForm, openProjectForm, editProject, saveProject,
    projectTitle, setProjectTitle, projectDescription, setProjectDescription, projectTechStack, setProjectTechStack,
    projectTargetHours, setProjectTargetHours, projectDailyHours, setProjectDailyHours, editingProjectId, updateProjectManualProgress, removeProject,
    showTransactionForm, setShowTransactionForm, transactionType, setTransactionType, transactionTitle, setTransactionTitle,
    transactionCategory, setTransactionCategory, transactionAmount, setTransactionAmount, transactionDate, setTransactionDate, editingTransactionId,
    emis, setEmis, openTransactionForm, addEmi,
    showEventForm, setShowEventForm, openEventForm, eventTitle, setEventTitle, eventDate, setEventDate,
    eventStartTime, setEventStartTime, eventEndTime, setEventEndTime, eventDetails, setEventDetails, eventStudentId, setEventStudentId, eventGoalId, setEventGoalId,
    eventError, setEventError, eventKind, setEventKind, eventProjectId, setEventProjectId,
    showSleepForm, setShowSleepForm, sleepBedInput, setSleepBedInput, sleepWakeInput, setSleepWakeInput,
    today, todayDayIndex, dateLabel, dateNumbers, weekDates, weekRangeLabel, monthDates, monthLabel, remainingHours,
    filteredStudents, incomeTotal, expenseTotal, savingsTotal, visibleTransactions, expectedClassIncome, receivedClassIncome,
    flash, addStudent, addGoal, addTransaction, addPlannerEvent, openSleepForm, saveSleepRecord, clockLabel,
    toggleStudentPaid, setStudentClassCount, removeStudent, removeGoal, removeTransaction, removePlannerEvent, updateEventStatus, progressGoal,
  };
}

function isDateInGoalPeriod(dateKey: string | undefined, period: GoalPeriod, today: Date) {
  if (!dateKey) return false;
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  if (period === "Today") return toDateKey(date) === toDateKey(today);
  if (period === "This month") return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();

  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return date >= weekStart && date < weekEnd;
}

function isDateInGoalPlan(dateKey: string | undefined, goal: Goal, today: Date) {
  if (!dateKey) return false;
  if (!goal.startDate || !goal.durationDays) return isDateInGoalPeriod(dateKey, goal.period, today);
  const start = new Date(`${goal.startDate}T12:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + goal.durationDays);
  const date = new Date(`${dateKey}T12:00:00`);
  return date >= start && date < end;
}

function getWeekDates(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => toDateKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)));
}

function getMonthDates(date: Date) {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Array.from({ length: lastDay }, (_, index) => toDateKey(new Date(date.getFullYear(), date.getMonth(), index + 1)));
}

function countPlanDays(dates: string[], goal: Goal, today: Date) {
  return dates.filter(date => isDateInGoalPlan(date, goal, today)).length;
}

function sumSessionsForDate(sessions: PlannerEvent[], dateKey: string) {
  return sessions.filter(event => event.date === dateKey).reduce((total, event) => total + Math.round(event.duration * 60), 0);
}

function normalizeEmis(value: unknown): Emi[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry): Emi[] => {
    if (typeof entry !== "object" || entry === null) return [];
    const item = entry as Partial<Emi>;
    if (typeof item.amount !== "number" || item.amount <= 0 || typeof item.startDate !== "string") return [];
    const dueDay = typeof item.dueDay === "number" ? Math.max(1, Math.min(31, Math.floor(item.dueDay))) : Number(item.startDate.slice(-2));
    return [{
      id: typeof item.id === "string" ? item.id : createId(), title: typeof item.title === "string" ? item.title : "EMI",
      amount: item.amount, dueDay, startDate: item.startDate,
      months: typeof item.months === "number" ? Math.max(1, Math.floor(item.months)) : 12,
      paidDates: Array.isArray(item.paidDates) ? item.paidDates.filter((date): date is string => typeof date === "string") : [],
    }];
  });
}

export type AppState = ReturnType<typeof useAppState>;
