import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Dumbbell, Utensils, Flame, Moon, Droplets, Scale, CalendarDays,
  CheckCircle2, Plus, Trash2, RotateCcw, Trophy, Activity, Cloud,
  LogIn, LogOut, UserPlus, AlertCircle
} from "lucide-react";
import { supabase, hasSupabaseConfig } from "./supabaseClient";
import "./styles.css";

const TARGETS = { calories: [2800, 3100], protein: [140, 160], water: 3, sleep: [7, 8], startWeight: 65, goalWeight: 72 };

const MEAL_PLAN = [
  { day: "Day 1", focus: "Upper Body", meals: [["Breakfast", "Oats bowl + 4 eggs", 800, 40],["Snack", "Yogurt + apple", 250, 15],["Lunch", "Chicken rice bowl", 750, 45],["Pre/Post", "Banana + peanut butter toast", 400, 12],["Dinner", "Pasta mince", 700, 40],["Before bed", "Milk", 150, 8]] },
  { day: "Day 2", focus: "Lower Body", meals: [["Breakfast", "Eggs, toast, beans, tomato", 750, 38],["Snack", "Nuts + banana", 350, 10],["Lunch", "Beef stew + rice", 800, 45],["Post", "Recovery smoothie", 550, 25],["Dinner", "Chicken wraps", 700, 40],["Before bed", "Maas", 150, 8]] },
  { day: "Day 3", focus: "Recovery", meals: [["Breakfast", "Yogurt fruit oats bowl", 650, 30],["Snack", "Boiled eggs", 250, 18],["Lunch", "Tuna sandwich", 550, 35],["Snack", "Fruit + nuts", 350, 10],["Dinner", "Fish + sweet potato + vegetables", 750, 42],["Before bed", "Milk", 150, 8]] },
  { day: "Day 4", focus: "Upper Volume", meals: [["Breakfast", "Peanut butter toast + 4 eggs", 800, 38],["Snack", "Maas + banana", 350, 14],["Lunch", "Mince + potatoes", 850, 45],["Pre/Post", "Oats smoothie", 500, 20],["Dinner", "Chicken curry + rice", 750, 42],["Before bed", "Yogurt", 150, 8]] },
  { day: "Day 5", focus: "Lower/Athletic", meals: [["Breakfast", "Oats + eggs + fruit", 800, 40],["Snack", "Yogurt + nuts", 350, 18],["Lunch", "Pap + beef stew", 850, 45],["Post", "Banana + milk", 300, 12],["Dinner", "Pasta + chicken", 750, 42],["Before bed", "Milk", 150, 8]] },
  { day: "Day 6", focus: "Active Recovery", meals: [["Breakfast", "Full breakfast", 750, 38],["Snack", "Peanut butter sandwich", 400, 15],["Lunch", "Chicken rice bowl", 750, 45],["Snack", "Banana + peanuts", 350, 12],["Dinner", "Fish + veg + potatoes", 750, 42],["Before bed", "Maas", 150, 8]] },
  { day: "Day 7", focus: "Reset", meals: [["Breakfast", "Smoothie + eggs", 750, 35],["Snack", "Fruit + nuts", 350, 10],["Lunch", "Braai plate with rice/salad", 900, 50],["Snack", "Yogurt", 200, 12],["Dinner", "Soup/stew + bread", 650, 35],["Before bed", "Milk", 150, 8]] }
];

const WORKOUTS = [
  { day: "Day 1", title: "Upper Push", color: "red", exercises: [["Barbell Bench Press", "4", "6-8", "40-60 kg", "90-120 sec"],["Incline Dumbbell Press", "4", "8-10", "20-30 kg DBs", "90 sec"],["Overhead Press", "3", "8-10", "20-40 kg", "90 sec"],["Dumbbell Lateral Raise", "3", "12-15", "6-12 kg DBs", "60 sec"],["Dips / Cable Chest Press", "3", "10-12", "Bodyweight / light", "60 sec"],["Triceps Pushdown", "3", "10-12", "25-40 kg", "60 sec"]] },
  { day: "Day 2", title: "Lower Body", color: "blue", exercises: [["Back Squat", "4", "6-8", "60-80 kg", "2-3 min"],["Romanian Deadlift", "4", "8-10", "60-80 kg", "2 min"],["Leg Press", "4", "10-12", "120-180 kg", "90 sec"],["Walking Lunges", "3", "10 each leg", "10-20 kg DBs", "90 sec"],["Hamstring Curl", "3", "12-15", "40-60 kg", "60 sec"],["Calf Raise", "4", "12-20", "40-80 kg", "60 sec"]] },
  { day: "Day 3", title: "Upper Pull", color: "green", exercises: [["Pull-up / Lat Pulldown", "4", "6-10", "Bodyweight / 50-70 kg", "90 sec"],["Bent Over Row", "4", "6-10", "50-80 kg", "2 min"],["Seated Cable Row", "3", "10-12", "50-70 kg", "90 sec"],["Face Pull", "3", "12-15", "15-25 kg", "60 sec"],["Barbell Curl", "3", "8-12", "20-30 kg", "60 sec"],["Hammer Curl", "3", "10-12", "10-16 kg DBs", "60 sec"]] },
  { day: "Day 4", title: "Lower / Athletic + Core", color: "purple", exercises: [["Deadlift", "4", "5-6", "80-100 kg", "2-3 min"],["Front Squat / Goblet Squat", "3", "8-10", "40-60 kg / 20-30 kg", "2 min"],["Bulgarian Split Squat", "3", "10 each leg", "10-20 kg DBs", "90 sec"],["Farmer Carries", "3", "40 m", "Heavy DBs", "60 sec"],["Hanging Leg Raise", "3", "8-15", "Bodyweight", "60 sec"],["Plank", "3", "45-60 sec", "Bodyweight", "60 sec"]] }
];

const LS_KEY = "jrstrauss-app-supabase-v2";
function todayKey() { return new Date().toISOString().slice(0, 10); }
function defaultState() { return { date: todayKey(), weight: "", water: 0, sleep: "", completedMeals: {}, completedExercises: {}, customFoods: [], notes: "", weeklyWeights: [] }; }
function loadLocal() { try { return JSON.parse(localStorage.getItem(LS_KEY)) || defaultState(); } catch { return defaultState(); } }
function saveLocal(state) { localStorage.setItem(LS_KEY, JSON.stringify(state)); }

function StatCard({ icon: Icon, label, value, sub }) {
  return <div className="stat-card"><Icon size={22} /><div><div className="stat-label">{label}</div><div className="stat-value">{value}</div>{sub && <div className="stat-sub">{sub}</div>}</div></div>;
}
function ProgressBar({ value, max }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return <div className="bar"><span style={{ width: `${pct}%` }} /></div>;
}

function AuthBox({ session, setSession }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const sendPasswordReset = async () => {
    const { error } =
      await supabase.auth.resetPasswordForEmail(
        resetEmail || email,
        {
          redirectTo:
            "https://jrstrauss-personal-development.netlify.app",
        }
      );
  
    setAuthMsg(
      error
        ? error.message
        : "Password reset email sent. Check your Gmail."
    );
  };
  
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          "https://jrstrauss-personal-development.netlify.app",
      },
    });
  };
  async function submit(e) {
    e.preventDefault();
    setAuthMsg("");
    if (!hasSupabaseConfig) return setAuthMsg("Supabase is not configured yet. Add your .env values first.");
    const res = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (res.error) setAuthMsg(res.error.message);
    else {
      setAuthMsg(mode === "signup" ? "Account created. Check your email if confirmation is enabled." : "Signed in.");
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    }
  }

  if (session) {
    return <div className="authbar"><Cloud size={16}/><span>Cloud sync active: {session.user.email}</span><button onClick={() => supabase.auth.signOut()}><LogOut size={16}/> Sign out</button></div>;
  }

  return (
    <form className="authbox" onSubmit={submit}>
      <div className="auth-title">{mode === "signin" ? <LogIn/> : <UserPlus/>}<b>{mode === "signin" ? "Sign in for cloud sync" : "Create cloud sync account"}</b></div>
      {!hasSupabaseConfig && <p className="warning"><AlertCircle size={16}/> Supabase keys are missing. The app still works locally.</p>}
      <div className="auth-grid">
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email address" />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
        <button className="gold">{mode === "signin" ? "Sign in" : "Sign up"}</button>
        <button
  type="button"
  className="linkbtn"
  onClick={sendPasswordReset}
>
  Forgot password?
</button>

<button
  type="button"
  className="gold"
  onClick={signInWithGoogle}
>
  Continue with Google
</button>
      </div>
      <button type="button" className="linkbtn" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
        {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
      {authMsg && <p className="muted">{authMsg}</p>}
    </form>
  );
}

function App() {
  const [state, setState] = useState(loadLocal);
  const [tab, setTab] = useState("dashboard");
  const [planDay, setPlanDay] = useState(0);
  const [workoutDay, setWorkoutDay] = useState(0);
  const [foodName, setFoodName] = useState("");
  const [foodCalories, setFoodCalories] = useState("");
  const [foodProtein, setFoodProtein] = useState("");
  const [session, setSession] = useState(null);
  const [syncStatus, setSyncStatus] = useState("Local mode");

  useEffect(() => {
    if (!hasSupabaseConfig) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => saveLocal(state), [state]);

  useEffect(() => {
    if (!session || !hasSupabaseConfig) return;
    async function loadCloudLog() {
      setSyncStatus("Loading cloud log...");
      const { data, error } = await supabase.from("daily_logs").select("data").eq("user_id", session.user.id).eq("log_date", state.date || todayKey()).maybeSingle();
      if (error) setSyncStatus("Cloud load error: " + error.message);
      else if (data?.data) { setState({ ...defaultState(), ...data.data }); setSyncStatus("Cloud log loaded"); }
      else setSyncStatus("No cloud log yet - local data ready to sync");
    }
    loadCloudLog();
  }, [session]);

  useEffect(() => {
    if (!session || !hasSupabaseConfig) return;
    const timer = setTimeout(async () => {
      setSyncStatus("Saving...");
      const payload = { user_id: session.user.id, log_date: state.date || todayKey(), data: state };
      const { error } = await supabase.from("daily_logs").upsert(payload, { onConflict: "user_id,log_date" });
      setSyncStatus(error ? "Cloud save error: " + error.message : "Synced to cloud");
    }, 900);
    return () => clearTimeout(timer);
  }, [state, session]);

  const currentMeals = MEAL_PLAN[planDay];
  const currentWorkout = WORKOUTS[workoutDay];

  const mealTotals = useMemo(() => {
    const selected = currentMeals.meals.filter((_, i) => state.completedMeals[`${planDay}-${i}`]);
    const base = selected.reduce((a, m) => ({ calories: a.calories + m[2], protein: a.protein + m[3] }), { calories: 0, protein: 0 });
    const custom = state.customFoods.reduce((a, f) => ({ calories: a.calories + Number(f.calories || 0), protein: a.protein + Number(f.protein || 0) }), { calories: 0, protein: 0 });
    return { calories: base.calories + custom.calories, protein: base.protein + custom.protein };
  }, [state.completedMeals, state.customFoods, planDay, currentMeals]);

  const workoutDone = currentWorkout.exercises.filter((_, i) => state.completedExercises[`${workoutDay}-${i}`]).length;

  function update(patch) { setState(prev => ({ ...prev, ...patch })); }
  function toggleMeal(i) { const key = `${planDay}-${i}`; setState(prev => ({ ...prev, completedMeals: { ...prev.completedMeals, [key]: !prev.completedMeals[key] } })); }
  function toggleExercise(i) { const key = `${workoutDay}-${i}`; setState(prev => ({ ...prev, completedExercises: { ...prev.completedExercises, [key]: !prev.completedExercises[key] } })); }
  function addFood() { if (!foodName.trim()) return; setState(prev => ({ ...prev, customFoods: [...prev.customFoods, { id: crypto.randomUUID(), name: foodName, calories: foodCalories || 0, protein: foodProtein || 0 }] })); setFoodName(""); setFoodCalories(""); setFoodProtein(""); }
  function addWeeklyWeight() { if (!state.weight) return; setState(prev => ({ ...prev, weeklyWeights: [...prev.weeklyWeights, { date: todayKey(), weight: Number(prev.weight) }] })); }
  function resetToday() { setState(defaultState()); }

  return (
    <div className="app">
      <header className="hero"><div><h1>JRStrauss Personal Development</h1><p>Nutrition • Training • Recovery • Executive discipline • Cloud sync</p></div><div className="badge">Goal: {TARGETS.goalWeight}kg</div></header>
      <AuthBox session={session} setSession={setSession}/>
      <div className="sync-status"><Cloud size={15}/> {syncStatus}</div>

      <nav className="tabs">{[["dashboard", "Dashboard"], ["nutrition", "Nutrition"], ["workouts", "Workouts"], ["progress", "Progress"], ["guide", "Rules"]].map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={tab === id ? "active" : ""}>{label}</button>)}</nav>

      {tab === "dashboard" && <main className="grid">
        <StatCard icon={Flame} label="Calories today" value={`${mealTotals.calories} kcal`} sub={`Target ${TARGETS.calories[0]}-${TARGETS.calories[1]}`} />
        <StatCard icon={Utensils} label="Protein today" value={`${mealTotals.protein} g`} sub={`Target ${TARGETS.protein[0]}-${TARGETS.protein[1]}g`} />
        <StatCard icon={Droplets} label="Water" value={`${state.water.toFixed(1)} L`} sub="Target 3L" />
        <StatCard icon={Dumbbell} label="Workout progress" value={`${workoutDone}/${currentWorkout.exercises.length}`} sub={currentWorkout.title} />
        <section className="panel wide"><h2>Today’s Control Panel</h2><label>Current weight (kg)</label><input value={state.weight} onChange={e => update({ weight: e.target.value })} type="number" placeholder="Example: 65.5" /><label>Sleep last night (hours)</label><input value={state.sleep} onChange={e => update({ sleep: e.target.value })} type="number" placeholder="Example: 7" /><label>Water intake</label><div className="row"><button onClick={() => update({ water: Math.max(0, state.water - 0.5) })}>- 500ml</button><button onClick={() => update({ water: state.water + 0.5 })}>+ 500ml</button></div><ProgressBar value={state.water} max={TARGETS.water} /><button className="gold" onClick={addWeeklyWeight}>Save weight check-in</button></section>
        <section className="panel wide"><h2>Daily Focus</h2><p>Eat enough. Lift with form. Sleep earlier. Keep relationship stress from stealing recovery.</p><div className="mini-goals"><span><CheckCircle2 /> 3L water</span><span><CheckCircle2 /> 140g protein</span><span><CheckCircle2 /> Train 4x/week</span><span><CheckCircle2 /> 7-8h sleep</span></div></section>
      </main>}

      {tab === "nutrition" && <main className="panel"><div className="section-head"><h2>7-Day Meal Plan</h2><select value={planDay} onChange={e => setPlanDay(Number(e.target.value))}>{MEAL_PLAN.map((d, i) => <option key={d.day} value={i}>{d.day} - {d.focus}</option>)}</select></div><div className="target-grid"><StatCard icon={Flame} label="Target calories" value="2,800-3,100" /><StatCard icon={Utensils} label="Protein" value="140-160g" /><StatCard icon={Droplets} label="Water" value="3L" /><StatCard icon={Moon} label="Sleep" value="7-8h" /></div><div className="list">{currentMeals.meals.map((m, i) => <label className="item" key={i}><input type="checkbox" checked={!!state.completedMeals[`${planDay}-${i}`]} onChange={() => toggleMeal(i)} /><div><b>{m[0]}: {m[1]}</b><small>{m[2]} kcal • {m[3]}g protein</small></div></label>)}</div><h3>Add extra food</h3><div className="add-row"><input value={foodName} onChange={e => setFoodName(e.target.value)} placeholder="Food e.g. extra peanut butter sandwich" /><input value={foodCalories} onChange={e => setFoodCalories(e.target.value)} type="number" placeholder="kcal" /><input value={foodProtein} onChange={e => setFoodProtein(e.target.value)} type="number" placeholder="protein g" /><button onClick={addFood}><Plus size={16}/> Add</button></div>{state.customFoods.length > 0 && <div className="list">{state.customFoods.map(f => <div className="item" key={f.id}><div><b>{f.name}</b><small>{f.calories} kcal • {f.protein}g protein</small></div><button onClick={() => setState(prev => ({ ...prev, customFoods: prev.customFoods.filter(x => x.id !== f.id) }))}><Trash2 size={16}/></button></div>)}</div>}</main>}

      {tab === "workouts" && <main className="panel"><div className="section-head"><h2>Workout Plan</h2><select value={workoutDay} onChange={e => setWorkoutDay(Number(e.target.value))}>{WORKOUTS.map((d, i) => <option key={d.day} value={i}>{d.day} - {d.title}</option>)}</select></div><div className={`workout-title ${currentWorkout.color}`}><Dumbbell /> {currentWorkout.title}</div><div className="exercise-table"><div className="table-head"><span>Exercise</span><span>Sets</span><span>Reps</span><span>Weight</span><span>Rest</span></div>{currentWorkout.exercises.map((ex, i) => <label className="table-row" key={i}><input type="checkbox" checked={!!state.completedExercises[`${workoutDay}-${i}`]} onChange={() => toggleExercise(i)} /><span>{ex[0]}</span><span>{ex[1]}</span><span>{ex[2]}</span><span>{ex[3]}</span><span>{ex[4]}</span></label>)}</div><section className="callout"><h3>How to choose the correct weight</h3><p><b>Perfect weight:</b> you complete the target reps with good form and only 1-2 reps left in reserve. If you can do 4+ extra reps, increase weight next time. If form breaks, reduce weight.</p></section></main>}

      {tab === "progress" && <main className="panel"><h2>Progress Tracker</h2><div className="target-grid"><StatCard icon={Scale} label="Start" value={`${TARGETS.startWeight}kg`} /><StatCard icon={Trophy} label="Goal" value={`${TARGETS.goalWeight}kg`} /><StatCard icon={Activity} label="Gain needed" value={`${TARGETS.goalWeight - TARGETS.startWeight}kg`} /><StatCard icon={CalendarDays} label="Timeline" value="90 days" /></div><h3>Weight Check-ins</h3><div className="list">{state.weeklyWeights.length === 0 && <p>No weight check-ins yet.</p>}{state.weeklyWeights.map((w, i) => <div className="item" key={i}><b>{w.date}</b><span>{w.weight} kg</span></div>)}</div><h3>Notes</h3><textarea value={state.notes} onChange={e => update({ notes: e.target.value })} placeholder="Energy, sleep, gym confidence, stress, appetite, wins..." /><button className="danger" onClick={resetToday}><RotateCcw size={16}/> Reset today</button></main>}

      {tab === "guide" && <main className="panel"><h2>JRStrauss Rules</h2><div className="rules"><p><b>Nutrition:</b> eat 4-6 times daily. Prioritize eggs, chicken, beef, rice, oats, maas, potatoes, bananas and peanut butter.</p><p><b>Training:</b> 4 days per week. Compound lifts first. Add weight only when form is solid.</p><p><b>Progression:</b> upper body +1.25-2.5kg increments; lower body +2.5-5kg increments.</p><p><b>Recovery:</b> sleep before midnight as often as possible. Growth happens outside the gym.</p><p><b>Mindset:</b> discipline today, legacy tomorrow. Small increases compound.</p></div></main>}

      <footer><span>JRStrauss Personal Development App</span><span>{session ? "Cloud-synced with Supabase" : "Local mode until sign-in"}</span></footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
