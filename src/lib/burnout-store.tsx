import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in-progress" | "completed";
export type Mood = "happy" | "neutral" | "tired";

export interface Activity {
  id: string;
  title: string;
  category: string;
  deadline: string; // ISO date yyyy-mm-dd
  priority: Priority;
  status: Status;
  description?: string;
}

export interface CheckIn {
  mood: Mood;
  energy: number; // 1-5
}

export const DEFAULT_CATEGORIES = [
  "Kuliah",
  "Organisasi",
  "Skripsi",
  "Lainnya",
];

export const PRIORITY_META: Record<Priority, { label: string; weight: number }> = {
  low: { label: "Low", weight: 1 },
  medium: { label: "Medium", weight: 2 },
  high: { label: "High", weight: 3 },
};

export const STATUS_META: Record<Status, { label: string }> = {
  todo: { label: "To Do" },
  "in-progress": { label: "In Progress" },
  completed: { label: "Completed" },
};

export const MOOD_META: Record<Mood, { label: string; emoji: string; value: number }> = {
  happy: { label: "Happy", emoji: "🙂", value: 5 },
  neutral: { label: "Neutral", emoji: "😐", value: 3 },
  tired: { label: "Tired / Sad", emoji: "😔", value: 1 },
};

// ---- date helpers ----
export function todayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function isoOffset(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysUntil(deadline: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${deadline}T00:00:00`);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export function dueLabel(deadline: string): string {
  const d = daysUntil(deadline);
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  return `Due in ${d}d`;
}

// Ranking: combine user priority and deadline closeness.
export function rankScore(a: Activity): number {
  const pw = PRIORITY_META[a.priority].weight;
  const d = daysUntil(a.deadline);
  const urgency = d < 0 ? 11 : 10 - Math.min(d, 9);
  return pw * urgency;
}

export function rankActivities(activities: Activity[]): Activity[] {
  return activities
    .filter((a) => a.status !== "completed")
    .sort((a, b) => rankScore(b) - rankScore(a));
}

const seedActivities: Activity[] = [
  { id: "a1", title: "Proposal AI", category: "Skripsi", deadline: isoOffset(3), priority: "high", status: "in-progress", description: "Finalize the research proposal draft." },
  { id: "a2", title: "Tugas Struktur Data", category: "Kuliah", deadline: isoOffset(1), priority: "high", status: "todo", description: "Problem set chapter 4." },
  { id: "a3", title: "Rapat Panitia Acara", category: "Organisasi", deadline: isoOffset(2), priority: "medium", status: "todo" },
  { id: "a4", title: "Laporan Praktikum Statistika", category: "Kuliah", deadline: isoOffset(6), priority: "medium", status: "todo" },
  { id: "a5", title: "Bab 2 Skripsi", category: "Skripsi", deadline: isoOffset(9), priority: "high", status: "todo", description: "Literature review section." },
  { id: "a6", title: "Reading response", category: "Kuliah", deadline: isoOffset(-1), priority: "low", status: "todo" },
  { id: "a7", title: "Bayar UKT", category: "Lainnya", deadline: isoOffset(5), priority: "low", status: "completed" },
];

export interface RiskFactor {
  label: string;
  value: number; // 0-100
  detail: string;
}

export interface RiskResult {
  score: number; // 0-100
  level: "low" | "medium" | "high";
  label: string;
  summary: string;
  factors: RiskFactor[];
  hasCheckIn: boolean;
  counts: {
    active: number;
    completed: number;
    overdue: number;
    closeDeadlines: number;
    highPriority: number;
  };
}

function computeRisk(
  activities: Activity[],
  checkIn: CheckIn | null,
): RiskResult {
  const active = activities.filter((a) => a.status !== "completed");
  const completed = activities.filter((a) => a.status === "completed");
  const overdue = active.filter((a) => daysUntil(a.deadline) < 0);
  const close = active.filter((a) => {
    const d = daysUntil(a.deadline);
    return d >= 0 && d <= 7;
  });
  const highPrio = active.filter((a) => a.priority === "high");

  const loadScore = Math.min(100, active.length * 11);
  const deadlineScore = Math.min(100, close.length * 14 + overdue.length * 22);
  const priorityScore = Math.min(100, highPrio.length * 22);

  const hasCheckIn = !!checkIn;
  let wellbeingScore = 0;
  if (checkIn) {
    const moodVal = MOOD_META[checkIn.mood].value;
    wellbeingScore =
      ((5 - moodVal) / 4) * 50 + ((5 - checkIn.energy) / 4) * 50;
  }

  const score = Math.round(
    hasCheckIn
      ? loadScore * 0.25 +
          deadlineScore * 0.3 +
          priorityScore * 0.2 +
          wellbeingScore * 0.25
      : loadScore * 0.34 + deadlineScore * 0.4 + priorityScore * 0.26,
  );

  const level: RiskResult["level"] =
    score < 40 ? "low" : score < 70 ? "medium" : "high";
  const label =
    level === "low"
      ? "Low Risk"
      : level === "medium"
        ? "Medium Risk"
        : "High Risk";

  const summary =
    level === "low"
      ? "Your workload and wellbeing look balanced right now. Keep your steady rhythm."
      : level === "medium"
        ? "A few deadlines and priorities are stacking up. Plan your week so it stays manageable."
        : "Several close deadlines and high-priority tasks are adding pressure. Consider rebalancing soon.";

  return {
    score,
    level,
    label,
    summary,
    hasCheckIn,
    counts: {
      active: active.length,
      completed: completed.length,
      overdue: overdue.length,
      closeDeadlines: close.length,
      highPriority: highPrio.length,
    },
    factors: [
      {
        label: "Active activities",
        value: Math.round(loadScore),
        detail: `${active.length} activities still open`,
      },
      {
        label: "Close deadlines",
        value: Math.round(deadlineScore),
        detail: `${close.length} due within 7 days · ${overdue.length} overdue`,
      },
      {
        label: "High-priority load",
        value: Math.round(priorityScore),
        detail: `${highPrio.length} high-priority task${highPrio.length === 1 ? "" : "s"}`,
      },
      {
        label: "Mood & energy",
        value: Math.round(wellbeingScore),
        detail: hasCheckIn
          ? `${MOOD_META[checkIn!.mood].label} mood · energy ${checkIn!.energy}/5`
          : "Add a check-in to include this",
      },
    ],
  };
}

const seedRiskHistory = [
  { label: "Mon", score: 41 },
  { label: "Tue", score: 49 },
  { label: "Wed", score: 57 },
  { label: "Thu", score: 53 },
  { label: "Fri", score: 62 },
];

interface StoreValue {
  activities: Activity[];
  categories: string[];
  checkIn: CheckIn | null;
  risk: RiskResult;
  riskHistory: { label: string; score: number }[];
  addCategory: (name: string) => void;
  addActivity: (a: Omit<Activity, "id">) => void;
  updateActivity: (id: string, a: Omit<Activity, "id">) => void;
  setStatus: (id: string, status: Status) => void;
  removeActivity: (id: string) => void;
  saveCheckIn: (mood: Mood, energy: number) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function BurnoutProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(seedActivities);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);

  const value = useMemo<StoreValue>(() => {
    const risk = computeRisk(activities, checkIn);
    return {
      activities,
      categories,
      checkIn,
      risk,
      riskHistory: [...seedRiskHistory, { label: "Today", score: risk.score }],
      addCategory: (name) =>
        setCategories((prev) =>
          prev.some((c) => c.toLowerCase() === name.trim().toLowerCase())
            ? prev
            : [...prev, name.trim()],
        ),
      addActivity: (a) =>
        setActivities((prev) => [
          { ...a, id: crypto.randomUUID() },
          ...prev,
        ]),
      updateActivity: (id, a) =>
        setActivities((prev) =>
          prev.map((x) => (x.id === id ? { ...a, id } : x)),
        ),
      setStatus: (id, status) =>
        setActivities((prev) =>
          prev.map((x) => (x.id === id ? { ...x, status } : x)),
        ),
      removeActivity: (id) =>
        setActivities((prev) => prev.filter((x) => x.id !== id)),
      saveCheckIn: (mood, energy) => setCheckIn({ mood, energy }),
    };
  }, [activities, categories, checkIn]);

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useBurnout() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useBurnout must be used within BurnoutProvider");
  return ctx;
}
