import { Icon } from "@/components/ui/icon";
import { TimePicker } from "@/components/ui/time-picker";
import type { AppState } from "@/features/app/use-app-state";

export function AppModals({ app }: { app: AppState }) {
  const {
    showStudentForm, resetStudentForm, addStudent, editingStudentId, studentName, setStudentName, studentInstrument, setStudentInstrument, studentFee, setStudentFee,
    studentAddress, setStudentAddress, studentCycleCount, setStudentCycleCount, studentWeeklyClasses, setStudentWeeklyClasses, addStudentClassTime, removeStudentClassTime,
    studentInitialClasses, setStudentInitialClasses,
    showGoalForm, resetGoalForm, addGoal, editingGoalId, goalName, setGoalName, goalDailyHours, setGoalDailyHours, goalDurationDays, setGoalDurationDays,
    showProjectForm, resetProjectForm, saveProject, editingProjectId, projectTitle, setProjectTitle, projectDescription, setProjectDescription,
    projectTechStack, setProjectTechStack, projectTargetHours, setProjectTargetHours, projectDailyHours, setProjectDailyHours,
    showTransactionForm, setShowTransactionForm, addTransaction, transactionType, setTransactionType, transactionTitle, setTransactionTitle,
    transactionCategory, setTransactionCategory, transactionAmount, setTransactionAmount, transactionDate, setTransactionDate, editingTransactionId,
    showEventForm, setShowEventForm, addPlannerEvent, eventTitle, setEventTitle, eventDate, setEventDate,
    eventStartTime, setEventStartTime, eventEndTime, setEventEndTime, eventDetails, setEventDetails,
    eventStudentId, setEventStudentId, eventGoalId, setEventGoalId, eventProjectId, setEventProjectId, eventError, setEventError, eventKind, setEventKind, students, goals, projects,
    showSleepForm, setShowSleepForm, saveSleepRecord, sleepBedInput, setSleepBedInput, sleepWakeInput, setSleepWakeInput,
  } = app;

  return (
    <>
      {showStudentForm && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) resetStudentForm(); }}>
        <form className="modal-card student-modal-card" onSubmit={addStudent}>
          <button type="button" className="modal-close" onClick={resetStudentForm}><Icon name="close"/></button>
          <div className="modal-icon music"><Icon name="music" size={20}/></div><div className="section-kicker">GROW YOUR STUDIO</div><h2>{editingStudentId ? "Update student" : "Add a student"}</h2><p>Set their cycle fee and weekly lesson times.</p>
          <label>Student name<input autoFocus required value={studentName} onChange={event => setStudentName(event.target.value)} placeholder="Student name"/></label>
          <label>Instrument<input required value={studentInstrument} onChange={event => setStudentInstrument(event.target.value)} placeholder="e.g. Piano"/></label>
          <label>Address<textarea rows={2} required value={studentAddress} onChange={event => setStudentAddress(event.target.value)} placeholder="Student address"/></label>
          <div className="modal-inline-fields">
            <label>Fee cycle<select value={studentCycleCount} onChange={event => setStudentCycleCount(Number(event.target.value) as 8 | 12)}><option value={8}>8 classes</option><option value={12}>12 classes</option></select></label>
            <label>Total fee (₹)<input type="number" min="0" required value={studentFee} onChange={event => setStudentFee(event.target.value)} placeholder="e.g. 6400"/></label>
          </div>
          <label>Classes already taken<input type="number" min="0" step="1" value={studentInitialClasses} onChange={event => setStudentInitialClasses(event.target.value)} placeholder="0"/><small>Starting count before detailed attendance logs.</small></label>
          <div className="student-class-editor-heading"><b>Weekly class schedule</b><small>{studentWeeklyClasses.length} of 3 classes per week</small></div>
          {studentWeeklyClasses.map((weeklyClass, index) => <div className="student-class-editor" key={weeklyClass.id}>
            <label>Day<select value={weeklyClass.day} onChange={event => setStudentWeeklyClasses(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, day: Number(event.target.value) } : item))}>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, dayIndex) => <option key={day} value={dayIndex}>{day}</option>)}</select></label>
            <label>Time<TimePicker ariaLabel={`Weekly class ${index + 1} time`} value={`${String(Math.floor(weeklyClass.start)).padStart(2, "0")}:${String(Math.round((weeklyClass.start % 1) * 60)).padStart(2, "0")}`} onChange={value => { const [hour, minute] = value.split(":").map(Number); setStudentWeeklyClasses(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, start: hour + minute / 60 } : item)); }}/></label>
            {studentWeeklyClasses.length > 1 && <button type="button" className="row-action danger-action" onClick={() => removeStudentClassTime(weeklyClass.id)} aria-label={`Remove weekly class ${index + 1}`}><Icon name="close" size={14}/></button>}
          </div>)}
          {studentWeeklyClasses.length < 3 && <button type="button" className="add-class-time" onClick={addStudentClassTime}><Icon name="plus" size={14}/> Add another weekly class</button>}
          <button className="primary-button modal-submit" type="submit">{editingStudentId ? "Save student" : "Add to my studio"} <Icon name="arrow" size={15}/></button>
        </form>
      </div>}

      {showGoalForm && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) resetGoalForm(); }}>
        <form className="modal-card" onSubmit={addGoal}>
          <button type="button" className="modal-close" onClick={resetGoalForm}><Icon name="close"/></button>
          <div className="modal-icon goal"><Icon name="target" size={20}/></div><div className="section-kicker">MAKE A LITTLE SPACE</div><h2>{editingGoalId ? "Update a learning goal" : "Plan a learning goal"}</h2><p>Set a daily learning target and the number of days you want to follow it.</p>
          <label>Goal<input autoFocus required value={goalName} onChange={event => setGoalName(event.target.value)} placeholder="e.g. Learn GitHub"/></label>
          <div className="modal-inline-fields">
            <label>Hours per day<input type="number" min="0.25" step="0.25" required value={goalDailyHours} onChange={event => setGoalDailyHours(event.target.value)}/></label>
            <label>Plan duration (days)<input type="number" min="1" step="1" required value={goalDurationDays} onChange={event => setGoalDurationDays(event.target.value)}/></label>
          </div>
          <button className="primary-button modal-submit" type="submit">{editingGoalId ? "Save goal" : "Add goal"} <Icon name="arrow" size={15}/></button>
        </form>
      </div>}

      {showProjectForm && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) resetProjectForm(); }}>
        <form className="modal-card project-modal-card" onSubmit={saveProject}>
          <button type="button" className="modal-close" onClick={resetProjectForm}><Icon name="close"/></button>
          <div className="modal-icon goal"><Icon name="spark" size={20}/></div><div className="section-kicker">MAKE SOMETHING YOU CARE ABOUT</div><h2>{editingProjectId ? "Update project" : "Add a project"}</h2><p>Track your build time, stack, and progress in one place.</p>
          <label>Project name<input autoFocus required value={projectTitle} onChange={event => setProjectTitle(event.target.value)} placeholder="e.g. Identera"/></label>
          <label>What are you making?<textarea rows={3} value={projectDescription} onChange={event => setProjectDescription(event.target.value)} placeholder="A short project description"/></label>
          <label>Tech stack<input value={projectTechStack} onChange={event => setProjectTechStack(event.target.value)} placeholder="e.g. Next.js, TypeScript, Supabase"/><small className="field-hint">Separate technologies with commas.</small></label>
          <div className="modal-inline-fields">
            <label>Hours per day<input type="number" min="0.25" step="0.25" required value={projectDailyHours} onChange={event => setProjectDailyHours(event.target.value)}/></label>
            <label>Total target hours<input type="number" min="1" step="1" required value={projectTargetHours} onChange={event => setProjectTargetHours(event.target.value)}/></label>
          </div>
          <button className="primary-button modal-submit" type="submit">{editingProjectId ? "Save project" : "Add project"} <Icon name="arrow" size={15}/></button>
        </form>
      </div>}

      {showTransactionForm && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowTransactionForm(false); }}>
        <form className="modal-card" onSubmit={addTransaction}>
          <button type="button" className="modal-close" onClick={() => setShowTransactionForm(false)}><Icon name="close"/></button>
          <div className="modal-icon finance-modal-icon"><Icon name="chart" size={20}/></div><div className="section-kicker">KEEP YOUR MONEY IN VIEW</div><h2>{editingTransactionId !== null ? "Edit finance activity" : "Add finance activity"}</h2><p>Track earnings, expenses, or money you’re setting aside.</p>
          <div className="transaction-type-tabs">{(["income", "expense", "saving"] as const).map(type => <button type="button" key={type} className={transactionType === type ? `active ${type}` : ""} onClick={() => setTransactionType(type)}>{type === "income" ? "Earning" : type === "expense" ? "Expense" : "Saving"}</button>)}</div>
          <label>Description<input autoFocus required value={transactionTitle} onChange={event => setTransactionTitle(event.target.value)} placeholder={transactionType === "income" ? "e.g. Piano lesson" : transactionType === "saving" ? "e.g. Emergency fund" : "e.g. Groceries"}/></label>
          <label>Category<input value={transactionCategory} onChange={event => setTransactionCategory(event.target.value)} placeholder={transactionType === "income" ? "Teaching" : transactionType === "saving" ? "Savings goal" : "Food & groceries"}/></label>
          <label>Amount (₹)<input type="number" min="1" required value={transactionAmount} onChange={event => setTransactionAmount(event.target.value)} placeholder="0"/></label>
          <label>Date<input type="date" required value={transactionDate} onChange={event => setTransactionDate(event.target.value)}/></label>
          <button className="primary-button modal-submit" type="submit">{editingTransactionId !== null ? "Update activity" : "Save activity"} <Icon name="arrow" size={15}/></button>
        </form>
      </div>}

      {showEventForm && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowEventForm(false); }}>
        <form className="modal-card event-modal-card" onSubmit={addPlannerEvent}>
          <button type="button" className="modal-close" onClick={() => setShowEventForm(false)}><Icon name="close"/></button>
          <div className="modal-icon goal"><Icon name="calendar" size={20}/></div><div className="section-kicker">MAKE SPACE FOR IT</div><h2>Add a planner event</h2><p>Lessons, appointments, or time set aside for yourself.</p>
          <label>Event name<input autoFocus required value={eventTitle} onChange={event => setEventTitle(event.target.value)} placeholder="e.g. Piano lesson"/></label>
          <label>Date<input type="date" required value={eventDate} onChange={event => setEventDate(event.target.value)}/></label>
          <div className="modal-inline-fields">
            <label>From<TimePicker ariaLabel="Event start time" value={eventStartTime} onChange={value => { setEventStartTime(value); setEventError(""); }}/></label>
            <label>To<TimePicker ariaLabel="Event end time" value={eventEndTime} onChange={value => { setEventEndTime(value); setEventError(""); }}/></label>
          </div>
          {eventError && <p className="form-error" role="alert">{eventError}</p>}
          <label>Details <span className="optional-label">Optional</span><textarea rows={3} value={eventDetails} onChange={event => setEventDetails(event.target.value)} placeholder="Add a location, preparation note, or anything else to remember"/></label>
          <label>Type<select value={eventKind} onChange={event => { setEventKind(event.target.value as typeof eventKind); setEventError(""); }}><option value="personal">Personal</option><option value="focus">Study</option><option value="lesson">Music lesson</option><option value="music">Practice</option></select></label>
          {eventKind === "lesson" && <label>Student<select required value={eventStudentId} onChange={event => setEventStudentId(event.target.value)}>{students.length === 0 && <option value="">Add a student first</option>}{students.map(student => <option key={student.id ?? student.name} value={student.id ?? student.name}>{student.name} · {student.instrument}</option>)}</select>{students.length === 0 && <small className="field-hint">Add a student in Your Studio before scheduling a class.</small>}</label>}
          {(eventKind === "focus" || eventKind === "music") && <label>Goal to update<select value={eventGoalId} onChange={event => setEventGoalId(event.target.value)}><option value="">No linked goal</option>{goals.map(goal => <option key={goal.id ?? goal.title} value={goal.id ?? ""}>{goal.title} · {goal.period}</option>)}</select><small className="field-hint">Completing this session adds its scheduled minutes to the linked goal.</small></label>}
          {(eventKind === "focus" || eventKind === "music") && <label>Project to update<select value={eventProjectId} onChange={event => setEventProjectId(event.target.value)}><option value="">No linked project</option>{projects.map(project => <option key={project.id} value={project.id}>{project.title}</option>)}</select><small className="field-hint">Completed session time adds to the project progress.</small></label>}
          <button className="primary-button modal-submit" type="submit">Add to planner <Icon name="arrow" size={15}/></button>
        </form>
      </div>}

      {showSleepForm && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowSleepForm(false); }}>
        <form className="modal-card" onSubmit={saveSleepRecord}>
          <button type="button" className="modal-close" onClick={() => setShowSleepForm(false)}><Icon name="close"/></button>
          <div className="modal-icon"><Icon name="moon" size={20}/></div><div className="section-kicker">A LITTLE REST COUNTS</div><h2>Log last night’s sleep</h2><p>Enter when you went to bed and when you woke up.</p>
          <div className="modal-inline-fields"><label>Bedtime<TimePicker ariaLabel="Bedtime" value={sleepBedInput} onChange={setSleepBedInput}/></label><label>Wake time<TimePicker ariaLabel="Wake time" value={sleepWakeInput} onChange={setSleepWakeInput}/></label></div>
          <button className="primary-button modal-submit" type="submit">Save sleep log <Icon name="arrow" size={15}/></button>
        </form>
      </div>}
    </>
  );
}
