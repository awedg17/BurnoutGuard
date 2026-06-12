import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Pencil,
  List,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useBurnout,
  dueLabel,
  daysUntil,
  todayISO,
  PRIORITY_META,
  STATUS_META,
  type Activity,
  type Priority,
  type Status,
} from "@/lib/burnout-store";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "Activities — BurnoutGuard" },
      {
        name: "description",
        content:
          "Add, edit, and track assignments, organizations, thesis work, and responsibilities.",
      },
    ],
  }),
  component: ActivitiesPage,
});

const PRIORITY_STYLES: Record<Priority, string> = {
  low: "bg-calm/15 text-calm-foreground",
  medium: "bg-accent text-accent-foreground",
  high: "bg-danger/20 text-danger-foreground",
};

const STATUS_STYLES: Record<Status, string> = {
  todo: "bg-secondary text-secondary-foreground",
  "in-progress": "bg-warning/25 text-warning-foreground",
  completed: "bg-calm/20 text-calm-foreground",
};

interface FormState {
  title: string;
  category: string;
  deadline: string;
  priority: Priority;
  status: Status;
  description: string;
}

const emptyForm = (category: string): FormState => ({
  title: "",
  category,
  deadline: todayISO(),
  priority: "medium",
  status: "todo",
  description: "",
});

function ActivitiesPage() {
  const {
    activities,
    categories,
    addCategory,
    addActivity,
    updateActivity,
    setStatus,
    removeActivity,
  } = useBurnout();

  const [view, setView] = useState<"list" | "calendar">("list");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(categories[0]));
  const [newCategory, setNewCategory] = useState("");

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm(categories[0]));
    setNewCategory("");
    setOpen(true);
  };

  const openEdit = (a: Activity) => {
    setEditingId(a.id);
    setForm({
      title: a.title,
      category: a.category,
      deadline: a.deadline,
      priority: a.priority,
      status: a.status,
      description: a.description ?? "",
    });
    setNewCategory("");
    setOpen(true);
  };

  const handleAddCategory = () => {
    const name = newCategory.trim();
    if (!name) return;
    addCategory(name);
    setForm((f) => ({ ...f, category: name }));
    setNewCategory("");
    toast.success(`Category "${name}" added`);
  };

  const submit = () => {
    if (!form.title.trim()) {
      toast.error("Give your activity a title first.");
      return;
    }
    const payload = {
      title: form.title.trim(),
      category: form.category,
      deadline: form.deadline,
      priority: form.priority,
      status: form.status,
      description: form.description.trim() || undefined,
    };
    if (editingId) {
      updateActivity(editingId, payload);
      toast.success("Activity updated");
    } else {
      addActivity(payload);
      toast.success("Activity added");
    }
    setOpen(false);
  };

  const sorted = useMemo(
    () =>
      [...activities].sort(
        (a, b) =>
          Number(a.status === "completed") - Number(b.status === "completed") ||
          daysUntil(a.deadline) - daysUntil(b.deadline),
      ),
    [activities],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Activities</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything on your plate, in one calm place.
          </p>
        </div>
        <Button className="rounded-full" onClick={openAdd}>
          <Plus className="mr-1 h-4 w-4" /> Add activity
        </Button>
      </div>

      {/* View switch */}
      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
        <TabsList className="rounded-full bg-secondary/60 p-1">
          <TabsTrigger value="list" className="rounded-full">
            <List className="mr-1 h-4 w-4" /> List view
          </TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-full">
            <CalendarDays className="mr-1 h-4 w-4" /> Calendar view
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "list" ? (
        <ListView
          activities={sorted}
          onEdit={openEdit}
          onDelete={(id) => {
            removeActivity(id);
            toast.success("Activity removed");
          }}
          onStatus={setStatus}
        />
      ) : (
        <CalendarView activities={activities} onEdit={openEdit} />
      )}

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit activity" : "Add activity"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                placeholder="e.g. Proposal AI"
                className="mt-1.5"
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-2 flex gap-2">
                <Input
                  value={newCategory}
                  placeholder="Add a custom category…"
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={handleAddCategory}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={form.deadline}
                  className="mt-1.5"
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) =>
                    setForm({ ...form, priority: v as Priority })
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as Status })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="desc">Description (optional)</Label>
              <Textarea
                id="desc"
                value={form.description}
                placeholder="Any details or notes…"
                className="mt-1.5"
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>
              {editingId ? "Save changes" : "Add activity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ListView({
  activities,
  onEdit,
  onDelete,
  onStatus,
}: {
  activities: Activity[];
  onEdit: (a: Activity) => void;
  onDelete: (id: string) => void;
  onStatus: (id: string, status: Status) => void;
}) {
  if (activities.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">
        No activities yet. Add your first one to get started.
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      {activities.map((a) => (
        <Card
          key={a.id}
          className={`p-4 transition-opacity ${a.status === "completed" ? "opacity-60" : ""}`}
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium ${a.status === "completed" ? "line-through" : ""}`}
              >
                {a.title}
              </p>
              {a.description && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {a.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full text-xs">
                  {a.category}
                </Badge>
                <Badge
                  className={`rounded-full text-xs ${PRIORITY_STYLES[a.priority]}`}
                >
                  {PRIORITY_META[a.priority].label}
                </Badge>
                <span
                  className={`text-xs ${daysUntil(a.deadline) <= 1 && a.status !== "completed" ? "text-danger-foreground" : "text-muted-foreground"}`}
                >
                  {dueLabel(a.deadline)}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => onEdit(a)}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(a.id)}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-3">
            <Select
              value={a.status}
              onValueChange={(v) => onStatus(a.id, v as Status)}
            >
              <SelectTrigger
                className={`h-8 w-[150px] rounded-full text-xs ${STATUS_STYLES[a.status]}`}
              >
                <SelectValue>{STATUS_META[a.status].label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      ))}
    </div>
  );
}

function CalendarView({
  activities,
  onEdit,
}: {
  activities: Activity[];
  onEdit: (a: Activity) => void;
}) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const { year, month } = cursor;
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = first.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const today = todayISO();

  const byDate = useMemo(() => {
    const map: Record<string, Activity[]> = {};
    for (const a of activities) {
      (map[a.deadline] ??= []).push(a);
    }
    return map;
  }, [activities]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const iso = (d: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const move = (delta: number) => {
    const m = month + delta;
    setCursor({
      year: year + Math.floor(m / 12),
      month: ((m % 12) + 12) % 12,
    });
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{monthLabel}</h2>
        <div className="flex gap-1">
          <button
            onClick={() => move(-1)}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => move(1)}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-1 font-medium">
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const date = iso(d);
          const items = byDate[date] ?? [];
          const isToday = date === today;
          return (
            <div
              key={date}
              className={`min-h-[68px] rounded-lg border p-1 text-left ${
                isToday ? "border-primary bg-primary/5" : "border-border/60"
              }`}
            >
              <span
                className={`text-xs ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`}
              >
                {d}
              </span>
              <div className="mt-0.5 space-y-0.5">
                {items.slice(0, 2).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => onEdit(a)}
                    className={`block w-full truncate rounded px-1 py-0.5 text-left text-[10px] ${PRIORITY_STYLES[a.priority]}`}
                    title={a.title}
                  >
                    {a.title}
                  </button>
                ))}
                {items.length > 2 && (
                  <span className="block px-1 text-[10px] text-muted-foreground">
                    +{items.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
