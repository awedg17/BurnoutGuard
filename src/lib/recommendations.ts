import {
  type Activity,
  type RiskResult,
  daysUntil,
  dueLabel,
  rankActivities,
} from "@/lib/burnout-store";

// A single, friendly "today's recommendation" sentence for the Home page.
export function getTodayRecommendation(activities: Activity[]): string {
  const ranked = rankActivities(activities);
  if (ranked.length === 0) {
    return "No active tasks right now — a good moment to rest or plan the week ahead.";
  }
  const top = ranked[0];
  const d = daysUntil(top.deadline);
  const when =
    d < 0
      ? `${Math.abs(d)} day${Math.abs(d) === 1 ? "" : "s"} overdue`
      : d === 0
        ? "due today"
        : d === 1
          ? "due tomorrow"
          : `due in ${d} days`;
  return `Focus on finishing "${top.title}" first because it has ${top.priority} priority and is ${when}.`;
}

// Practical, non-medical suggestions for the Insights page.
export function getRecommendations(
  risk: RiskResult,
  activities: Activity[],
): string[] {
  const tips: string[] = [];
  const ranked = rankActivities(activities);
  const { overdue, closeDeadlines, highPriority, active } = risk.counts;

  if (ranked[0]) {
    tips.push(
      `Start with "${ranked[0].title}" — it scores highest on priority and deadline closeness (${dueLabel(ranked[0].deadline)}).`,
    );
  }
  if (overdue > 0) {
    tips.push(
      `You have ${overdue} overdue task${overdue === 1 ? "" : "s"}. Reschedule or close ${overdue === 1 ? "it" : "them"} to clear mental load.`,
    );
  }
  if (closeDeadlines >= 3) {
    tips.push(
      `${closeDeadlines} deadlines fall within 7 days. Spread them across days instead of one sprint.`,
    );
  }
  if (highPriority >= 2) {
    tips.push(
      "Several high-priority tasks overlap. Block focused time for the most urgent one before context-switching.",
    );
  }
  if (!risk.hasCheckIn) {
    tips.push(
      "Add a quick check-in so the risk indicator can factor in your mood and energy.",
    );
  }
  if (risk.level === "high") {
    tips.push(
      "The risk indicator is elevated — consider pausing one low-priority commitment this week.",
    );
  } else if (risk.level === "low" && active > 0) {
    tips.push("You're in a steady rhythm — protect it with short, regular breaks.");
  }

  if (tips.length === 0) {
    tips.push("Keep logging activities and check-ins so trends stay accurate.");
  }
  return tips.slice(0, 4);
}
