import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarClock, Sparkles, ArrowRight, Lightbulb, Info } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { RiskGauge } from "@/components/RiskGauge";
import {
  useBurnout,
  rankActivities,
  dueLabel,
  daysUntil,
  PRIORITY_META,
  MOOD_META,
  type Mood,
} from "@/lib/burnout-store";
import { getTodayRecommendation } from "@/lib/recommendations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BurnoutGuard — Your wellbeing dashboard" },
      {
        name: "description",
        content:
          "See your burnout risk indicator, today's priorities, and a quick mood check-in at a glance.",
      },
    ],
  }),
  component: HomePage,
});

const LEVEL_STYLES: Record<"low" | "medium" | "high", string> = {
  low: "bg-calm/15 text-calm-foreground",
  medium: "bg-warning/20 text-warning-foreground",
  high: "bg-danger/20 text-danger-foreground",
};

const MOODS: Mood[] = ["happy", "neutral", "tired"];

function HomePage() {
  const { risk, activities, checkIn, saveCheckIn } = useBurnout();
  const [mood, setMood] = useState<Mood>(checkIn?.mood ?? "neutral");
  const [energy, setEnergy] = useState(checkIn?.energy ?? 3);

  const priorities = rankActivities(activities).slice(0, 3);
  const recommendation = getTodayRecommendation(activities);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-sm text-muted-foreground">Welcome back 👋</p>
        <h1 className="mt-1 text-3xl font-bold text-foreground">
          Here's how your week feels
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Burnout Risk Status */}
        <Card className="flex flex-col items-center gap-4 p-6 md:col-span-2">
          <RiskGauge risk={risk} />
          <Badge
            className={`rounded-full px-4 py-1 text-sm font-medium ${LEVEL_STYLES[risk.level]}`}
          >
            {risk.label} · {risk.score}/100
          </Badge>
          <p className="text-center text-sm text-muted-foreground">
            {risk.summary}
          </p>
          {!risk.hasCheckIn && (
            <div className="flex items-start gap-2 rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              No check-in yet today — this indicator may be less accurate.
            </div>
          )}
        </Card>

        {/* Right column */}
        <div className="space-y-6 md:col-span-3">
          {/* Today's Recommendation */}
          <Card className="bg-secondary/40 p-6">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Today's recommendation</h2>
            </div>
            <p className="text-sm text-foreground/90">{recommendation}</p>
          </Card>

          {/* Quick Check-In */}
          <Card className="p-6">
            <div className="mb-1 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Quick check-in</h2>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Optional — helps make your risk indicator more accurate.
            </p>
            <div className="space-y-5">
              <div>
                <span className="mb-2 block text-sm text-muted-foreground">
                  Mood
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs transition-colors ${
                        mood === m
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-2xl">{MOOD_META[m].emoji}</span>
                      {MOOD_META[m].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Energy level</span>
                  <span className="font-medium text-foreground">{energy}/5</span>
                </div>
                <Slider
                  value={[energy]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={(v) => setEnergy(v[0])}
                />
              </div>
              <Button
                className="w-full rounded-full"
                onClick={() => {
                  saveCheckIn(mood, energy);
                  toast.success("Check-in saved", {
                    description: "Your risk indicator has been updated.",
                  });
                }}
              >
                Save check-in
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Today's Priorities */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Today's priorities</h2>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-full text-primary"
          >
            <Link to="/activities">
              All activities <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="space-y-2">
          {priorities.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nothing pending — enjoy the calm.
            </p>
          )}
          {priorities.map((a, i) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.category} · {PRIORITY_META[a.priority].label} priority
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`rounded-full ${
                  daysUntil(a.deadline) <= 1
                    ? "border-danger/40 text-danger-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {dueLabel(a.deadline)}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
