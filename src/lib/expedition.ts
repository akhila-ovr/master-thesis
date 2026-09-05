// Shared expedition content and deterministic derivations used by both the
// whole-class roster (ClassRoster.svelte) and the per-student detail view
// (StudentProfile.svelte), so the two never drift apart.

import type { Outcome, Student } from "./studentHelpers";

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
    typeLabel: "Multiple choice (1 question)",
    text: 'Multiple choice: "Which statement best describes how Earth’s gravity works?" (Correct: gravity pulls all matter inward toward the center core of the planet.)',
  },
  {
    label: "Fill-in-blank",
    typeLabel: "Fill in blanks (1 question)",
    text: 'Fill in the blank: "Everything you can touch and see is made of ___. Because Earth is so massive, its ___ pulls all of this material inward, toward the ___ of the planet." (matter / gravity / core)',
  },
  {
    label: "Sorting",
    typeLabel: "Sorting (1 question)",
    text: "Sorting: which space objects have enough mass to form a round ball? (round: Earth, a giant gas planet; irregular: a flying space rock, a tiny asteroid, a kitchen table)",
  },
  {
    label: "True/false",
    typeLabel: "True / False (1 question)",
    text: 'True or false: "Asteroids will eventually turn into perfectly round spheres if they float in space long enough." (Answer: False)',
  },
  {
    label: "Drag-drop",
    typeLabel: "Drag & drop (1 question)",
    text: "Drag and drop: match each gravity cause to its effect (e.g. gathering huge amounts of matter → increases gravitational pull; lacking enough mass → results in a lumpy object).",
  },
];

// Every gradable unit -- a multi-choice question, a true/false question, a
// single fill-in-blank blank, a single drag & drop match, a single sorting
// item -- has exactly one right answer, so it's always individually x/1.
// Multi-choice and true/false questions are each their own QuizAnswer entry
// (already atomic); fill-in-blank/drag & drop/sorting instead pack several
// such units into one question via `units`. This is what lets a type be
// shown as a row of individually right/wrong units instead of one
// combined -- and easily misread -- "X/Y" fraction.
export function quizUnitsFor(s: Student, typeLabel: string): Outcome[] {
  const answers = (s.quizAnswers ?? []).filter((a) => a.typeLabel === typeLabel);
  return answers.flatMap((a) => a.units ?? [a.outcome]);
}

// What one unit of a type actually is -- shown as a caption under its row of
// right/wrong marks so "3 of 3" reads as "3 questions" (each with its own
// one right answer) rather than looking like 3 right answers inside a
// single question, which is what fill-in-blank/drag & drop/sorting's units
// (blanks/matches/items) are.
export const TYPE_UNIT_LABEL: Record<string, string> = {
  "Multiple choice (1 question)": "questions",
  "True / False (1 question)": "questions",
  "Fill in blanks (1 question)": "blanks",
  "Drag & drop (1 question)": "matches",
  "Sorting (1 question)": "items",
};

// True/false is the one type where a retry isn't meaningful: with only two
// options, getting it wrong once leaves exactly one option left, so a
// "correct after retry" there is a guaranteed guess rather than real
// recovery. It's excluded from retry credit here so it doesn't inflate a
// student's apparent understanding the way a genuine multi-option retry does.
const NO_RETRY_CREDIT_TYPE = "True / False (1 question)";

// How many of a type's units this student got right, out of how many exist.
export function quizPartsFor(
  s: Student,
  typeLabel: string,
): { correct: number; total: number } | null {
  const units = quizUnitsFor(s, typeLabel);
  if (!units.length) return null;
  const countsAsRight = typeLabel === NO_RETRY_CREDIT_TYPE ? "correct" : null;
  const correct = units.filter((o) => (countsAsRight ? o === countsAsRight : o !== "wrong")).length;
  return { correct, total: units.length };
}

// How many of a type's units needed a retry before landing on an answer.
export function quizRetriesFor(s: Student, typeLabel: string): number {
  return quizUnitsFor(s, typeLabel).filter((o) => o === "retry").length;
}

// A student "passes" an exercise type when they got every unit of that type
// right (a correct-after-retry still counts, except true/false, where only a
// first-try correct does -- see NO_RETRY_CREDIT_TYPE above). null = not
// attempted.
export function passedTypeOf(s: Student, typeLabel: string): boolean | null {
  const parts = quizPartsFor(s, typeLabel);
  if (!parts) return null;
  return parts.correct === parts.total;
}

// A type's contribution to the overall quiz score: 1 point for getting every
// unit right, 0.5 for getting some but not all right (so a partial fill-in-
// blank/drag & drop/sorting result still counts toward the total instead of
// scoring the same as a total miss), 0 for none right or not attempted.
export function quizScoreFor(s: Student, typeLabel: string): number {
  const parts = quizPartsFor(s, typeLabel);
  if (!parts) return 0;
  if (parts.correct === parts.total) return 1;
  if (parts.correct > 0) return 0.5;
  return 0;
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

// Synthetic time on task for the reflection chat (deterministic from the
// name, like the other per-student minutes elsewhere), 2-7 minutes.
export function reflectionMinutesFor(s: Student): number {
  return 2 + (hashOf(s.name + "|reflection-minutes") % 6);
}

// The expedition's three learning goals, matching the reflection prompt
// "What did you learn about gravity, mass, and why Earth is round?". Each
// `test` fires only when the student expresses the relationship in their own
// words, never on the bare term: saying "gravity", "mass" or "round" on its
// own counts for nothing. `idea` names the goal; `counts` says what phrasing
// trips `test` (and what does not), so a teacher can see why a reflection
// did or didn't get credit.
export const REFLECTION_CONCEPTS: Array<{
  key: string;
  test: (t: string) => boolean;
  idea: string;
  counts: string;
}> = [
  {
    key: "Gravity",
    test: (t) => /\b(middle|cent(er|re)|inwards?)\b/i.test(t),
    idea: 'Gravity pulls matter toward the center, so "down" everywhere points inward.',
    counts:
      'The student places the pull toward the middle or center, or describes matter being pulled inward. Saying only "gravity", or "pulls things down", does not count.',
  },
  {
    key: "Mass",
    test: (t) =>
      /\b(mass|matter|heav|weigh)/i.test(t) &&
      /\b(more|strong|weak|less|enough)/i.test(t) &&
      /\b(gravity|pull|force)/i.test(t),
    idea: "The more mass an object has, the stronger its gravity.",
    counts:
      'The student links a mass or weight word to a stronger or weaker pull ("heavier planets have more gravity", "not enough mass so its gravity is too weak"). Naming "mass" on its own does not count.',
  },
  {
    key: "Sphere",
    test: (t) =>
      /\b(sphere|spherical|round|ball)\b/i.test(t) &&
      /\b(pull|squash|squeez|squish|form|make|made|becom)/i.test(t),
    idea: "Gravity pulling inward from every direction squashes a large body into a sphere.",
    counts:
      'The student ties the round shape to the pull that forms it ("pulled into a ball", "squashes into a sphere"). Saying "the Earth is round" without the cause does not count.',
  },
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
//
// A real branching tree, not independent per-topic choices: which question
// gets asked at step 2 and step 3, and what its two options are, depends on
// what was picked at the step before. Two of the four step-2 options happen
// to lead to the same step-3 question and options (a merge back in the tree),
// so `next` is the same object reference on both — see SPHERE_STEP3 /
// BOX_STEP3 below.
// ---------------------------------------------------------------------------

export type StoryOption = {
  key: string;
  label: string;
  result: string;
  next?: StoryNode;
};

export type StoryNode = {
  question: string;
  options: StoryOption[];
};

export const STORY_INTRO =
  "Maya, Leo, and Zara are building a gravity model for the science fair to show how gravity pulls matter to the center. Which question comes next, and what it offers, depends on what the team already chose.";

const SPHERE_STEP3: StoryNode = {
  question: "They have the materials, how should they complete the setup?",
  options: [
    {
      key: "firm",
      label: "Attach weights firmly",
      result:
        "They attach the weights firmly. The project proves their gravity theory, but the frame is slightly bent from the weight.",
    },
    {
      key: "loose",
      label: "Leave weights loose",
      result:
        "They decide to leave the weights loose to protect the frame. The project looks great, but the gravity concept is less clear.",
    },
  ],
};

const BOX_STEP3: StoryNode = {
  question: "The box is ready. How should they present the gravity pull?",
  options: [
    {
      key: "show",
      label: "Show magnets in action",
      result:
        "They show the magnets in action. The science is very clear to judges, but the box looks a bit disorganized.",
    },
    {
      key: "hide",
      label: "Hide with a cover",
      result:
        "They cover the mechanism to keep the display clean. It looks professional, but the gravity experiment is hidden from view.",
    },
  ],
};

export const STORY_TREE: StoryNode = {
  question: "Which frame shape should they build for their gravity model?",
  options: [
    {
      key: "sphere",
      label: "Build a spherical frame",
      result:
        "The team decides to build a sphere. It is the best shape to show how gravity pulls everything toward a central point.",
      next: {
        question:
          "Zara worries the sphere is too weak, but Leo wants to use heavy materials to show the pull. What should they put inside?",
        options: [
          {
            key: "steel",
            label: "Use heavy steel balls",
            result:
              "They choose heavy steel balls, which clearly show the force of gravity, though the weight puts stress on their frame.",
            next: SPHERE_STEP3,
          },
          {
            key: "foam",
            label: "Use soft foam balls",
            result:
              "They choose soft foam balls to keep the frame safe, though the force of gravity is not very noticeable.",
            next: SPHERE_STEP3,
          },
        ],
      },
    },
    {
      key: "box",
      label: "Build a square box frame",
      result:
        "They build a sturdy square box. It is easy to construct, but they need to figure out how to demonstrate the pull to the center.",
      next: {
        question:
          "Maya wants to use magnets for pull, but Leo wants to use simple weights. What should they add to the center?",
        options: [
          {
            key: "magnets",
            label: "Add magnets at the center",
            result:
              "They add magnets to the center. It simulates the pull, but it makes the box look a bit cluttered.",
            next: BOX_STEP3,
          },
          {
            key: "weights",
            label: "Use simple weights",
            result:
              "They use simple weights. It is neat and clean, but the effect of gravity is harder to see.",
            next: BOX_STEP3,
          },
        ],
      },
    },
  ],
};

export type StoryStep = {
  level: number;
  question: string;
  options: StoryOption[];
  chosenKey: string;
};

// Deterministic per-student walk down the tree: at each node, a hash of the
// student's name and the level picks one of that node's options, then moves
// into whatever question (if any) that option leads to.
export function storyPathFor(s: Student): StoryStep[] {
  const steps: StoryStep[] = [];
  let node: StoryNode | undefined = STORY_TREE;
  let level = 1;
  while (node) {
    const opts: StoryOption[] = node.options;
    const idx = hashOf(`story|L${level}|${s.name}`) % opts.length;
    const opt: StoryOption = opts[idx];
    steps.push({ level, question: node.question, options: opts, chosenKey: opt.key });
    node = opt.next;
    level++;
  }
  return steps;
}

export function storyChosenOption(step: StoryStep): StoryOption {
  return step.options.find((o) => o.key === step.chosenKey)!;
}

// The route a student took, as chosen options in order (1 per tree level).
export function storyRouteFor(s: Student): StoryOption[] {
  return storyPathFor(s).map(storyChosenOption);
}

export function storyGroupFor(s: Student): string {
  return storyRouteFor(s)[0]?.label ?? "";
}

// What each of the 8 possible root-to-leaf routes suggests about the
// student's priorities, keyed by "<step1 key>|<step2 key>|<step3 key>".
// Written by hand rather than composed generically, since the interesting
// read is the *pattern* across all three choices (did they stay consistent,
// or trade one priority for another), not just a restatement of what they
// picked.
const STORY_ROUTE_INSIGHTS: Record<string, string> = {
  "sphere|steel|firm":
    "Chose the physically strongest option at every step: heavy material for a clear demonstration, then locked it down even though it cost the frame its shape. This student consistently favors getting the physics right over how tidy the finished build looks.",
  "sphere|steel|loose":
    "Picked heavy materials to make the pull obvious, then played it safe on assembly to protect the frame, giving up some of the clarity that choice was meant to buy. Reads as a build-safety instinct winning out over following through on the science.",
  "sphere|foam|firm":
    "Chose the safer, gentler material, then still fastened everything down firmly even though there is little force to secure. Suggests a cautious start paired with a thoroughness that outruns what the material can actually demonstrate.",
  "sphere|foam|loose":
    "Played it safe at every step, protecting the frame at the cost of a gravity effect that is hard to see. The most build-safe, least physics-forward path through this branch — a model built to survive, not to prove the theory.",
  "box|magnets|show":
    "Chose the more technically interesting mechanism and then leaned into showing it off, prioritizing scientific clarity for the judges over a tidy presentation.",
  "box|magnets|hide":
    "Built the more complex, cluttered mechanism, then chose to hide it from view. Invested in getting the science right but didn't follow through on communicating it.",
  "box|weights|show":
    "Chose the simpler, neater mechanism but still tried to show it in action, even though the effect is harder to see. Values transparency about how the model works over a strong visual demonstration.",
  "box|weights|hide":
    "Chose the neat, simple route at every step and kept it clean for presentation, consistently prioritizing polish and simplicity over demonstrating the underlying physics.",
};

export function storyInterpretation(s: Student): string {
  const route = storyRouteFor(s);
  if (!route.length) return "No story choices recorded yet.";
  const key = route.map((o) => o.key).join("|");
  return (
    STORY_ROUTE_INSIGHTS[key] ??
    `${route.map((o) => o.label).join(" → ")}. ${route[route.length - 1].result}`
  );
}

// Synthetic per-junction time on task (deterministic from the name and
// level, like the choices themselves), 1-4 minutes per decision.
export function storyStepMinutes(s: Student, level: number): number {
  return 1 + (hashOf(`story|minutes|L${level}|${s.name}`) % 4);
}

export type StoryDetailStep = {
  level: number;
  question: string;
  choice: string;
  result: string;
  minutes: number;
};

// Full per-junction breakdown for one student: the question they were asked,
// what they chose, what that choice means (its trade-off), and how long they
// spent on it. Powers the detail view when a student is selected.
export function storyDetailFor(s: Student): StoryDetailStep[] {
  return storyPathFor(s).map((step) => {
    const opt = storyChosenOption(step);
    return {
      level: step.level,
      question: step.question,
      choice: opt.label,
      result: opt.result,
      minutes: storyStepMinutes(s, step.level),
    };
  });
}

// Per-student story read for the class overview: total time on task (the sum
// of the per-junction times above) plus a plain description of the route
// taken through the tree.
export function storyStudentInsight(s: Student): {
  minutes: number;
  pattern: string;
} {
  const route = storyRouteFor(s);
  const minutes = route.reduce(
    (sum, _o, i) => sum + storyStepMinutes(s, i + 1),
    0,
  );
  const pattern = route.length
    ? `${route.map((o) => o.label).join(" → ")}.`
    : "No story choices recorded yet.";
  return { minutes, pattern };
}

// Class-level read: how the class splits at the very first junction (since
// every later question depends on it), then which single full route is most
// common and what taking it says about that group of students.
export function storyClassInsight(students: Student[]): string {
  const total = students.length;
  if (!total) return "No students to report on yet.";

  const rootCounts = STORY_TREE.options.map((opt) => ({
    opt,
    n: students.filter((s) => storyRouteFor(s)[0]?.key === opt.key).length,
  }));
  const leader = rootCounts[0].n >= rootCounts[1].n ? rootCounts[0] : rootCounts[1];
  const rootLine = rootCounts
    .map(({ opt, n }) => `${n}/${total} ${opt.label.charAt(0).toLowerCase()}${opt.label.slice(1)}`)
    .join(", ");

  const routeCounts = new Map<string, number>();
  for (const s of students) {
    const key = storyRouteFor(s).map((o) => o.key).join("|");
    routeCounts.set(key, (routeCounts.get(key) ?? 0) + 1);
  }
  let modalKey = "";
  let modalN = 0;
  for (const [key, n] of routeCounts) {
    if (n > modalN) {
      modalKey = key;
      modalN = n;
    }
  }
  const modalInsight = STORY_ROUTE_INSIGHTS[modalKey];
  const leaderName = leader.opt.label.replace(/^Build a /i, "").toLowerCase();

  return `${rootLine} — the ${leaderName} is the more popular start, and each half is then asked a different second question, so the class fans out further before any two students share a full path. The single most common route (${modalN}/${total} students) ends here: ${modalInsight}`;
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
  "Multiple choice (1 question)": {
    know: "that gravity points inward to the core",
    gap: "gravity’s direction",
  },
  "Fill in blanks (1 question)": {
    know: "the key terms (matter, gravity, core)",
    gap: "how the terms matter, gravity and core fit together",
  },
  "Sorting (1 question)": {
    know: "that mass drives round shape",
    gap: "how mass makes objects round",
  },
  "True / False (1 question)": {
    know: "that asteroids stay lumpy without mass",
    gap: "that mass, not time, forms spheres",
  },
  "Drag & drop (1 question)": {
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
    if (turns.length && c.test(text)) mentioned.push(c.key);
    else missing.push(c.key);
  }
  return { mentioned, missing };
}

export function reflectionSummaryText(s: Student): string {
  const { mentioned, missing } = reflectionConceptsFor(s);
  if (!mentioned.length)
    return "The reflection names none of the three key ideas: the pull toward a center point, mass as the driver, or the inward pull forming a sphere.";
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

// Per-student debate read for the class overview: a synthetic time on task
// (this mock stores no real timings, so it is derived deterministically from
// the name like the scores and picks) plus a plain description of how the
// three round picks moved.
// Synthetic per-round time on task (deterministic from the name and round,
// like the picks themselves), 1-4 minutes per round.
export function debateRoundMinutes(s: Student, round: number): number {
  return 1 + (hashOf(`debate|minutes|r${round}|${s.name}`) % 4);
}

export function debateStudentInsight(
  s: Student,
  logicalSideName: string | undefined,
): { minutes: number; pattern: string } {
  const { picks, winner } = debatePicks(s, logicalSideName);
  const minutes = [1, 2, 3].reduce((sum, r) => sum + debateRoundMinutes(s, r), 0);
  const switches = picks.filter((p, i) => i > 0 && p !== picks[i - 1]).length;
  let pattern: string;
  if (switches === 0) {
    pattern = `Held ${winner} across all three rounds, a firm and settled position.`;
  } else if (switches === 1) {
    const flipRound =
      picks.findIndex((p, i) => i > 0 && p !== picks[i - 1]) + 1;
    pattern = `Changed side once, in round ${flipRound}; landed on ${winner} by a 2-1 split.`;
  } else {
    pattern = `Switched side every round; landed on ${winner} 2-1 but never settled.`;
  }
  return { minutes, pattern };
}
