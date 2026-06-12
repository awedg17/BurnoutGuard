import {
  type Activity,
  type CheckIn,
  type RiskResult,
  rankActivities,
  dueLabel,
  MOOD_META,
} from "@/lib/burnout-store";
import { getTodayRecommendation, getRecommendations } from "@/lib/recommendations";

export interface ChatContext {
  risk: RiskResult;
  activities: Activity[];
  checkIn: CheckIn | null;
}

interface Rule {
  keywords: string[];
  reply: (ctx: ChatContext) => string;
}

const RULES: Rule[] = [
  {
    keywords: ["hello", "hi", "hai", "halo", "hey", "pagi", "siang", "malam"],
    reply: () =>
      "Hi! I'm your BurnoutGuard assistant. Ask me about your risk score, today's priorities, deadlines, or tips to manage your workload.",
  },
  {
    keywords: ["risk", "score", "burnout", "kondisi", "gimana", "how am i"],
    reply: (ctx) =>
      `Your current burnout risk is ${ctx.risk.score}/100 (${ctx.risk.label}). ${ctx.risk.summary}`,
  },
  {
    keywords: ["priorit", "today", "focus", "fokus", "tugas apa"],
    reply: (ctx) => getTodayRecommendation(ctx.activities),
  },
  {
    keywords: ["tip", "advice", "saran", "rekomendasi", "recommendation"],
    reply: (ctx) => {
      const tips = getRecommendations(ctx.risk, ctx.activities);
      return tips.map((t, i) => `${i + 1}. ${t}`).join("\n");
    },
  },
  {
    keywords: ["overdue", "telat", "terlambat", "deadline"],
    reply: (ctx) => {
      const { overdue, closeDeadlines } = ctx.risk.counts;
      if (overdue === 0 && closeDeadlines === 0) {
        return "Good news — you have no overdue tasks and nothing due within the next 7 days.";
      }
      return `You have ${overdue} overdue task${overdue === 1 ? "" : "s"} and ${closeDeadlines} due within the next 7 days. Consider tackling overdue ones first.`;
    },
  },
  {
    keywords: ["mood", "energi", "energy", "check-in", "checkin", "perasaan"],
    reply: (ctx) => {
      if (!ctx.checkIn) {
        return "You haven't logged a check-in today. Head to the Home page and share your mood and energy — it helps make your risk indicator more accurate.";
      }
      const { mood, energy } = ctx.checkIn;
      return `Today you checked in as ${MOOD_META[mood].label} ${MOOD_META[mood].emoji} with energy ${energy}/5.`;
    },
  },
  {
    keywords: ["activit", "kegiatan", "aktivitas", "task list"],
    reply: (ctx) => {
      const ranked = rankActivities(ctx.activities);
      if (ranked.length === 0) {
        return "You have no active activities right now. Nice and clear!";
      }
      const top3 = ranked.slice(0, 3);
      return `You have ${ranked.length} active task${ranked.length === 1 ? "" : "s"}. Top of the list: ${top3
        .map((a) => `"${a.title}" (${dueLabel(a.deadline)})`)
        .join(", ")}.`;
    },
  },
  {
    keywords: ["thank", "makasih", "terima kasih"],
    reply: () => "You're welcome! Take care of yourself. 🌱",
  },
  {
    keywords: ["help", "bantuan", "bisa apa", "what can you do"],
    reply: () =>
      "I can help with:\n• Your current burnout risk score\n• Today's top priority\n• Personalized tips\n• Overdue & upcoming deadlines\n• Your latest mood check-in",
  },
];

const FALLBACK =
  "I'm not sure about that yet, but I can tell you about your risk score, today's priorities, recommendations, deadlines, or your latest check-in.";

export function getBotReply(message: string, ctx: ChatContext): string {
  const text = message.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => text.includes(k))) {
      return rule.reply(ctx);
    }
  }
  return FALLBACK;
}

export const SUGGESTED_PROMPTS = [
  "How am I doing?",
  "What should I focus on today?",
  "Give me a tip",
  "Any overdue tasks?",
];
