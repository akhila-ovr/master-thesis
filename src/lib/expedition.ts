// Shared expedition content and deterministic derivations used by both the
// whole-class roster (ClassRoster.svelte) and the per-student detail view
// (StudentProfile.svelte), so the two never drift apart.

import type { Student } from "./studentHelpers";

export type Side = "Creative" | "Logical";

// djb2 hash + murmur3 finalizer: every output bit depends on the whole input,
// giving well-spread deterministic pseudo-random choices from a seed string.
export function hashOf(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  h ^= h >>> 15;
  h = Math.imul(h, 0x85ebca6b) | 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35) | 0;
  h ^= h >>> 16;
  return Math.abs(h);
}

// ---------------------------------------------------------------------------
// Quantitative exercises
// ---------------------------------------------------------------------------

export const QUESTION_GUIDE = [
  {
    label: "Multi-choice",
    typeLabel: "Multiple choice (4 questions)",
    text: 'Multiple choice: "Which statement best describes how Earth’s gravity works?" (Correct: gravity pulls all matter inward toward the center core of the planet.)',
  },
  {
    label: "Fill-in-blank",
    typeLabel: "Fill in blanks (2 questions)",
    text: 'Fill in the blank: "Everything you can touch and see is made of ___. Because Earth is so massive, its ___ pulls all of this material inward, toward the ___ of the planet." (matter / gravity / core)',
  },
  {
    label: "Sorting",
    typeLabel: "Sorting (1 question)",
    text: "Sorting: which space objects have enough mass to form a round ball? (round: Earth, a giant gas planet; irregular: a flying space rock, a tiny asteroid, a kitchen table)",
  },
  {
    label: "True/false",
    typeLabel: "True / False (3 questions)",
    text: 'True or false: "Asteroids will eventually turn into perfectly round spheres if they float in space long enough." (Answer: False)',
  },
  {
    label: "Drag-drop",
    typeLabel: "Drag & drop (2 questions)",
    text: "Drag and drop: match each gravity cause to its effect (e.g. gathering huge amounts of matter → increases gravitational pull; lacking enough mass → results in a lumpy object).",
  },
];

// A student "passes" an exercise type when none of their answers of that type
// were wrong (a correct-after-retry still counts as a pass). null = not attempted.
export function passedTypeOf(s: Student, typeLabel: string): boolean | null {
  const answers = (s.quizAnswers ?? []).filter((a) => a.typeLabel === typeLabel);
  if (answers.length === 0) return null;
  return answers.every((a) => a.outcome !== "wrong");
}

// ---------------------------------------------------------------------------
// Reflection
// ---------------------------------------------------------------------------

export const REFLECTION_PROMPT =
  'Sparkli asks each student, at the end of the expedition: "What did you learn about gravity, mass, and why Earth is round?"';

// The student's own turns in their end-of-expedition reflection chat.
export function studentUtterances(s: Student): string[] {
  return (s.transcript ?? "")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("Sparkli:"))
    .map((l) => l.replace(/^[^:]+:\s*/, "").trim())
    .filter(Boolean);
}

export function reflectionAnswerOf(s: Student): string {
  return studentUtterances(s)[0] ?? "";
}

// Key ideas scanned for in each reflection, matching the prompt "What did you
// learn about gravity, mass, and why Earth is round?"
export const REFLECTION_CONCEPTS: Array<{ key: string; test: RegExp }> = [
  { key: "Gravity (center point)", test: /\b(middle|cent(er|re)|inwards?)\b/i },
  { key: "Mass", test: /\b(mass|heav(y|ier)|more gravity)\b/i },
  { key: "Asteroids (low mass)", test: /asteroid/i },
];

// ---------------------------------------------------------------------------
// Debate
// ---------------------------------------------------------------------------

export const DEBATE_TOPIC =
  '"Should we demote planets that are not perfect spheres?" Creative argues history and discovery matter most; Logical argues science needs clear, mass-based definitions. The student picks a winner in each of three rounds; the ultimate winner is whichever side wins the majority.';

// What each side argued in each of the three debate rounds.
export const DEBATE_ROUNDS = [
  {
    n: 1,
    creative:
      "Names carry the story of who discovered each world, and taking a title away over size ignores that.",
    logical:
      "A planet is defined by its mass: enough that its own gravity crushes it into a sphere.",
  },
  {
    n: 2,
    creative:
      "Strict labels lose the human side; a smaller world is no less significant or worth exploring.",
    logical:
      "Feelings don't change the physics: if it lacks the mass to be round, it isn't a planet.",
  },
  {
    n: 3,
    creative:
      "Our map of space keeps growing; leave room for every discovery and the wonder behind it.",
    logical:
      "Science needs one clear, measurable rule to compare billions of objects.",
  },
];

// The debate's two sides map onto the shared `debate` object: "Creative"
// (history and discovery, = debate.left) and "Logical" (mass-based
// definitions, = debate.right). Per-round picks aren't stored, so derive three
// deterministic ones that lean toward the side the student sided with, then
// take the majority as the ultimate winner.
export function debatePicks(
  s: Student,
  logicalSideName: string | undefined,
): { picks: Side[]; winner: Side } {
  const lean: Side =
    s.debateSide == null
      ? hashOf(s.name + "|lean") % 2 === 0
        ? "Logical"
        : "Creative"
      : s.debateSide === logicalSideName
        ? "Logical"
        : "Creative";
  const other: Side = lean === "Logical" ? "Creative" : "Logical";
  const picks = [1, 2, 3].map((r) =>
    hashOf("r" + r + "|" + s.name + "|debate") % 10 < 4 ? other : lean,
  ) as Side[];
  const logicalWins = picks.filter((p) => p === "Logical").length;
  return { picks, winner: logicalWins >= 2 ? "Logical" : "Creative" };
}

// ---------------------------------------------------------------------------
// Story (Creative Story Builder)
// ---------------------------------------------------------------------------

export const STORY_INTRO =
  "Maya and Leo are building a gravity model for a science fair. At each of three junctions, one option stays truer to the physics (accuracy-first) and the other is easier to build or show to a crowd (practicality-first).";

export const STORY_JUNCTIONS = [
  {
    n: 1,
    topic: "Base design",
    accurate: "Round sponge ball",
    accurateWhy:
      "Marbles roll toward the middle from every side, the way a planet's gravity pulls matter to its center.",
    practical: "Flat table with a magnet",
    practicalWhy:
      "Quick to rig and it always works, but a magnet fakes the pull and hides the idea of matter being squeezed into a sphere.",
  },
  {
    n: 2,
    topic: "Display size",
    accurate: "Small display",
    accurateWhy:
      "Easier to build level and precise, so the pull-to-center effect stays clean and repeatable.",
    practical: "Large display",
    practicalWhy:
      "Eye-catching for a fair crowd, but harder to keep flat and true, so wobble and uneven surfaces muddy the result.",
  },
  {
    n: 3,
    topic: "Material",
    accurate: "Metal marbles",
    accurateWhy:
      "Real mass, so they respond to the pull and roll inward, showing how matter behaves under gravity.",
    practical: "Paper dots",
    practicalWhy:
      "Light, cheap and safe, but too light to move under the model's gentle pull, so they just sit there.",
  },
];

export function storyChoicesFor(s: Student) {
  return STORY_JUNCTIONS.map((j) => {
    const accurate = hashOf(j.topic + "|" + s.name + "|story") % 2 === 0;
    return {
      n: j.n,
      topic: j.topic,
      choice: accurate ? j.accurate : j.practical,
      accurate,
    };
  });
}

export function storyGroupFor(
  s: Student,
): "Mixed" | "Accuracy-first" | "Practicality-first" {
  const acc = storyChoicesFor(s).filter((c) => c.accurate).length;
  return acc === 3
    ? "Accuracy-first"
    : acc === 0
      ? "Practicality-first"
      : "Mixed";
}

export function storyInterpretation(s: Student): string {
  const acc = storyChoicesFor(s).filter((c) => c.accurate).length;
  if (acc === 3)
    return "This student’s choices consistently favor scientific accuracy over ease of construction or visual impact.";
  if (acc === 0)
    return "This student’s choices consistently favor a model that is easy to build and eye-catching over one that demonstrates the physics.";
  if (acc === 2)
    return "This student mostly favors scientific accuracy, trading one choice for a model that is easier to build or show off.";
  return "This student mostly favors a buildable, eye-catching model, keeping one choice that stays true to the physics.";
}

// ---------------------------------------------------------------------------
// Debate positions (structured, matching the class dashboard)
// ---------------------------------------------------------------------------

export const DEBATE_QUESTION =
  '"Should we demote planets that are not perfect spheres?"';

export const DEBATE_SIDES = {
  creative: {
    verdict: "no, keep the name.",
    why: "It records who found the world and the wonder of finding it; stripping a title over shape is unfair and puts people off exploring.",
  },
  logical: {
    verdict: "yes, demote it.",
    why: "A planet has to be massive enough that its own gravity pulls it into a sphere; a clear, mass-based rule keeps the science consistent.",
  },
};

// ---------------------------------------------------------------------------
// Per-section "AI Insights" text, per student
// ---------------------------------------------------------------------------

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}

// What passing / missing each quiz exercise type suggests the student grasps.
export const QUANT_CONCEPT: Record<string, { know: string; gap: string }> = {
  "Multiple choice (4 questions)": {
    know: "that gravity points inward to the core",
    gap: "gravity’s direction",
  },
  "Fill in blanks (2 questions)": {
    know: "the key terms (matter, gravity, core)",
    gap: "how the terms matter, gravity and core fit together",
  },
  "Sorting (1 question)": {
    know: "that mass drives round shape",
    gap: "how mass makes objects round",
  },
  "True / False (3 questions)": {
    know: "that asteroids stay lumpy without mass",
    gap: "that mass, not time, forms spheres",
  },
  "Drag & drop (2 questions)": {
    know: "gravity cause and effect",
    gap: "linking gravity causes to their effects",
  },
};

export function quantConceptsFor(s: Student): {
  known: string[];
  gaps: string[];
} {
  const known: string[] = [];
  const gaps: string[] = [];
  for (const q of QUESTION_GUIDE) {
    const res = passedTypeOf(s, q.typeLabel);
    const c = QUANT_CONCEPT[q.typeLabel];
    if (!c) continue;
    if (res === true) known.push(c.know);
    else if (res === false) gaps.push(c.gap);
  }
  return { known, gaps };
}

// Terse one-liner for the class roster's "may know / may not know" column.
export function quantSummaryLine(s: Student): string {
  const { known, gaps } = quantConceptsFor(s);
  if (!known.length && !gaps.length) return "No quiz data yet.";
  if (!gaps.length) return "Secure across all five exercises.";
  if (!known.length) return "Mass, gravity and sphere link not landing yet.";
  return `Solid on ${known[0]}; shaky on ${gaps[0]}.`;
}

// Fuller prose for the individual student view.
export function quantSummaryText(s: Student): string {
  const { known, gaps } = quantConceptsFor(s);
  const passed = QUESTION_GUIDE.filter(
    (q) => passedTypeOf(s, q.typeLabel) === true,
  ).length;
  if (!known.length && !gaps.length) return "No quiz answers recorded yet.";
  if (!gaps.length)
    return `Passed all five exercise types. This student is comfortable with ${joinList(known)}.`;
  if (!known.length)
    return "Missed every exercise type. The core idea that mass creates the gravity which pulls matter into a sphere is not landing yet.";
  return `Passed ${passed} of five exercise types. Solid on ${joinList(known)}, but still shaky on ${joinList(gaps)}.`;
}

export function reflectionConceptsFor(s: Student): {
  mentioned: string[];
  missing: string[];
} {
  const turns = studentUtterances(s);
  const text = turns.join(" ");
  const mentioned: string[] = [];
  const missing: string[] = [];
  for (const c of REFLECTION_CONCEPTS) {
    if (turns.length && c.test.test(text)) mentioned.push(c.key);
    else missing.push(c.key);
  }
  return { mentioned, missing };
}

export function reflectionSummaryText(s: Student): string {
  const { mentioned, missing } = reflectionConceptsFor(s);
  if (!mentioned.length)
    return "The reflection names none of the three key ideas: the pull toward a center point, mass as the driver, or why low-mass asteroids stay lumpy.";
  const covered = `The reflection covers ${joinList(mentioned.map((m) => m.toLowerCase()))}`;
  return missing.length
    ? `${covered}, but not ${joinList(missing.map((m) => m.toLowerCase()))}.`
    : `${covered}, touching all three key ideas.`;
}

export function debateSummaryText(
  s: Student,
  logicalSideName: string | undefined,
): string {
  const { picks, winner } = debatePicks(s, logicalSideName);
  const logical = picks.filter((p) => p === "Logical").length;
  const consistency =
    logical === 3 || logical === 0
      ? `This student picked ${winner} in all three rounds`
      : `This student split the rounds, landing on ${winner} by a ${Math.max(logical, 3 - logical)}-${Math.min(logical, 3 - logical)} majority`;
  const takeaway =
    winner === "Logical"
      ? "and leans on the mass-based test (enough mass, so gravity pulls it round) as the deciding rule."
      : "and is moved more by the fairness and discovery case than by the physical definition of a planet.";
  return `${consistency} ${takeaway}`;
}
