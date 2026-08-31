// Shared helpers for rendering an individual student's profile, used by the
// Student groups modal (Groups.svelte) and the header student search
// (StudentSearch.svelte), both of which render <StudentProfile>.

export type Outcome = "correct" | "retry" | "wrong";

export interface QuizAnswer {
  typeLabel: string;
  qLabel: string;
  question: string;
  outcome: Outcome;
}

export interface Student {
  name: string;
  group: string;
  summary: string;
  transcript: string;
  score?: number;
  debateSide?: string | null;
  creativeChoice?: string;
  quizAnswers?: QuizAnswer[];
}

const AVATAR_EMOJIS = ["🦊", "🐢", "🐬", "🦉", "🐧", "🦋", "🐨", "🐠", "🦜", "🦡", "🐿️", "🐙"];
const AVATAR_BG = [
  "bg-rose-100",
  "bg-amber-100",
  "bg-emerald-100",
  "bg-sky-100",
  "bg-violet-100",
  "bg-pink-100",
];

function hashOf(name: string) {
  return name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

export function avatarFor(name: string) {
  const h = hashOf(name);
  return {
    emoji: AVATAR_EMOJIS[h % AVATAR_EMOJIS.length],
    bg: AVATAR_BG[h % AVATAR_BG.length],
  };
}

export const outcomeStyle: Record<Outcome, { label: string; classes: string }> = {
  correct: { label: "Correct", classes: "bg-emerald-100 text-emerald-700" },
  retry: { label: "Correct after retry", classes: "bg-amber-100 text-amber-700" },
  wrong: { label: "Incorrect", classes: "bg-rose-100 text-rose-700" },
};

export function quizStats(quizAnswers?: Array<{ outcome: string }>) {
  if (!quizAnswers || quizAnswers.length === 0) return null;
  const total = quizAnswers.length;
  const correct = quizAnswers.filter((q) => q.outcome === "correct").length;
  const retry = quizAnswers.filter((q) => q.outcome === "retry").length;
  const wrong = quizAnswers.filter((q) => q.outcome === "wrong").length;
  return {
    correctPct: Math.round((correct / total) * 100),
    retryPct: Math.round((retry / total) * 100),
    wrongPct: Math.round((wrong / total) * 100),
  };
}

export function debateStanceFor(debate: any, side: string | null | undefined) {
  if (!side) return "";
  if (side === debate?.left?.name) return debate?.left?.stance ?? "";
  if (side === debate?.right?.name) return debate?.right?.stance ?? "";
  return "";
}
