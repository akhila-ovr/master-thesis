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

const AVATAR_BG = [
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-pink-100 text-pink-700",
];

function hashOf(name: string) {
  return name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

export function avatarFor(name: string) {
  const h = hashOf(name);
  const initials =
    name
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  return {
    initials,
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
