import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Activity as ActivityIcon,
  CheckCircle2,
  CircleDot,
  AlertTriangle,
  Brain,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBurnout } from "@/lib/burnout-store";
import { getRecommendations } from "@/lib/recommendations";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights — BurnoutGuard" },
      {
        name: "description",
        content:
          "Burnout risk trends, activity summary, category distribution, and practical recommendations.",
      },
    ],
  }),
  component: InsightsPage,
});

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const LEVEL_STYLES: Record<"low" | "medium" | "high", string> = {
  low: "bg-calm/15 text-calm-foreground",
  medium: "bg-warning/20 text-warning-foreground",
  high: "bg-danger/20 text-danger-foreground",
};

function InsightsPage() {
  const { activities, categories, risk, riskHistory } = useBurnout();
  const recs = getRecommendations(risk, activities);

  // Category distribution (including custom categories with at least one item)
  const byCategory = categories
    .map((c) => ({
      name: c,
      value: activities.filter((a) => a.category === c).length,
    }))
    .filter((d) => d.value > 0);

  const stats = [
    {
      icon: ActivityIcon,
      label: "Total",
      value: activities.length,
      sub: "activities",
    },
    {
      icon: CheckCircle2,
      label: "Completed",
      value: risk.counts.completed,
      sub: "done",
    },
    {
      icon: CircleDot,
      label: "Active",
      value: risk.counts.active,
      sub: "in progress / to do",
    },
    {
      icon: AlertTriangle,
      label: "Overdue",
      value: risk.counts.overdue,
      sub: "past deadline",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A clear view of your workload and burnout risk indicator — not a
          medical assessment.
        </p>
      </div>

      {/* Activity summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  {s.label}
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Burnout trend */}
        <Card className="p-6 lg:col-span-3">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Burnout risk trend</h2>
            <Badge
              className={`rounded-full ${LEVEL_STYLES[risk.level]}`}
            >
              {risk.label}
            </Badge>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            Risk indicator score over recent days.
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={riskHistory}
                margin={{ top: 5, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--chart-1)"
                  strokeWidth={3}
                  fill="url(#riskFill)"
                  dot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category distribution */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Category distribution</h2>
          {byCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No activities to chart yet.
            </p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {byCategory.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${v}`, "Activities"]}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 13,
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Burnout factors */}
      <Card className="p-6">
        <h2 className="mb-1 text-lg font-semibold">Burnout factors</h2>
        <p className="mb-4 text-sm text-muted-foreground">{risk.summary}</p>
        <div className="space-y-4">
          {risk.factors.map((f) => (
            <div key={f.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-foreground">{f.label}</span>
                <span className="text-muted-foreground">{f.value}/100</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${f.value}%`,
                    background:
                      f.value < 40
                        ? "var(--calm)"
                        : f.value < 70
                          ? "var(--warning)"
                          : "var(--danger)",
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{f.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Recommendation */}
      <Card className="bg-secondary/40 p-6">
        <div className="mb-3 flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">AI recommendation</h2>
        </div>
        <ul className="space-y-2">
          {recs.map((r, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground/90">
              <span className="text-primary">•</span>
              {r}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          These are practical workload suggestions based on your priorities and
          deadlines — a risk indicator, not a medical diagnosis.
        </p>
      </Card>
    </div>
  );
}
