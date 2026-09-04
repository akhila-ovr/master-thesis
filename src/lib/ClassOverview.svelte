<!-- ClassOverview.svelte: an abstract, glanceable read of the whole class.
     One tile per activity: the prompt / questions it was based on, a single
     aggregate visual, and an observational AI insight drawn from that data.
     No per-student rows here; the header search drills into one student. -->
<script lang="ts">
  import type { Student } from "./studentHelpers";
  import {
    DEBATE_QUESTION,
    DEBATE_SIDES,
    QUANT_CONCEPT,
    QUESTION_GUIDE,
    REFLECTION_CONCEPTS,
    REFLECTION_PROMPT,
    STORY_INTRO,
    STORY_JUNCTIONS,
    debatePicks,
    passedTypeOf as passed,
    storyChoicesFor,
    storyGroupFor,
    studentUtterances,
  } from "./expedition";

  export let students: Array<Student> = [];
  export let questionTypes: Array<{ label: string }> = [];
  export let debate: any = {};

  const SHORT_LABEL: Record<string, string> = {
    "Multiple choice (4 questions)": "Multi-choice",
    "Fill in blanks (2 questions)": "Fill-in-blank",
    "Sorting (1 question)": "Sorting",
    "True / False (3 questions)": "True/False",
    "Drag & drop (2 questions)": "Drag-drop",
  };
  const TYPE_ICON: Record<string, string> = {
    "Multi-choice": "🔘",
    "Fill-in-blank": "✏️",
    Sorting: "🗂️",
    "True/False": "⚖️",
    "True/false": "⚖️",
    "Drag-drop": "🧲",
  };
  const CONCEPT_ICON: Record<string, string> = {
    "Gravity (center point)": "🎯",
    Mass: "⚖️",
    "Round shape (sphere)": "🌐",
  };
  const COLUMN_ORDER = [
    "Multiple choice (4 questions)",
    "Fill in blanks (2 questions)",
    "Sorting (1 question)",
    "True / False (3 questions)",
    "Drag & drop (2 questions)",
  ];

  $: total = students.length || 1;

  $: columns = [
    ...COLUMN_ORDER.filter((l) => questionTypes.some((t) => t.label === l)),
    ...questionTypes
      .map((t) => t.label)
      .filter((l) => !COLUMN_ORDER.includes(l)),
  ].map((label) => ({
    label,
    short: SHORT_LABEL[label] ?? label.replace(/\s*\(.*\)\s*$/, ""),
  }));

  function pct(n: number): number {
    return Math.round((n / total) * 100);
  }

  function questionTextFor(typeLabel: string): string {
    return QUESTION_GUIDE.find((q) => q.typeLabel === typeLabel)?.text ?? "";
  }

  // --- Quantitative: per-exercise pass rate + class average score ----------
  $: quantPerColumn = columns.map((c) => ({
    label: c.label,
    short: c.short,
    passed: students.filter((s) => passed(s, c.label) === true).length,
  }));
  $: quantMax = columns.length;
  $: quantAvg = students.length
    ? Math.round(
        (students.reduce(
          (a, s) =>
            a + columns.filter((c) => passed(s, c.label) === true).length,
          0,
        ) /
          students.length) *
          10,
      ) / 10
    : 0;
  $: quantSorted = [...quantPerColumn].sort((a, b) => a.passed - b.passed);

  // --- Reflection: how many mentioned each key concept -------------------
  $: reflectionCounts = REFLECTION_CONCEPTS.map(({ key, test, idea, counts }) => ({
    key,
    idea,
    counts,
    n: students.filter((s) => {
      const t = studentUtterances(s);
      return t.length > 0 && test(t.join(" "));
    }).length,
  }));

  // --- Debate: how the class's ultimate winners split ------------------
  $: logicalSideName = debate?.right?.name;
  $: debateSplit = students.reduce(
    (acc, s) => {
      acc[debatePicks(s, logicalSideName).winner]++;
      return acc;
    },
    { Logical: 0, Creative: 0 } as Record<"Logical" | "Creative", number>,
  );

  // --- Creative Story Builder: how the class's approach splits --------
  $: storySplit = students.reduce(
    (acc, s) => {
      acc[storyGroupFor(s)]++;
      return acc;
    },
    { "Accuracy-first": 0, Mixed: 0, "Practicality-first": 0 } as Record<
      string,
      number
    >,
  );
  // --- Story: which junction the class agrees on vs. splits over ---------
  $: storyJunctionSplits = STORY_JUNCTIONS.map((j) => {
    const acc = students.filter(
      (s) => storyChoicesFor(s).find((c) => c.n === j.n)?.accurate,
    ).length;
    return { topic: j.topic, acc, prac: students.length - acc };
  });
  $: storyMostDivisive = [...storyJunctionSplits].sort(
    (a, b) => Math.abs(a.acc - a.prac) - Math.abs(b.acc - b.prac),
  )[0];
  $: storyMostAgreed = [...storyJunctionSplits].sort(
    (a, b) => Math.abs(b.acc - b.prac) - Math.abs(a.acc - a.prac),
  )[0];

  // --- Debate: how many switched sides across the three rounds -----------
  $: debateSwingCount = students.filter(
    (s) => new Set(debatePicks(s, logicalSideName).picks).size > 1,
  ).length;

  // --- Observational AI insights: each interprets a pattern the raw
  // counts/bars above don't spell out on their own, rather than restating them.
  $: quantWeakest = quantSorted[0];
  $: quantStrongest = quantSorted[quantSorted.length - 1];
  $: quantInsight =
    quantWeakest && quantStrongest && quantWeakest.label !== quantStrongest.label
      ? `The class's shakiest ground is ${QUANT_CONCEPT[quantWeakest.label]?.gap ?? quantWeakest.short.toLowerCase()} (only ${quantWeakest.passed}/${total} passed ${quantWeakest.short}), while most already have a handle on ${QUANT_CONCEPT[quantStrongest.label]?.know ?? quantStrongest.short.toLowerCase()}.`
      : "Pass rates are fairly even across exercise types — no single concept stands out as a gap.";
  $: reflectionInsight = (() => {
    const sorted = [...reflectionCounts].sort((a, b) => b.n - a.n);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];
    if (!strongest || !weakest || strongest.key === weakest.key)
      return "Reflections are fairly even across the ideas the class was asked about.";
    return `Most students can name ${strongest.key.toLowerCase()} (${strongest.n}/${total}), but the chain breaks down before ${weakest.key.toLowerCase()} (${weakest.n}/${total}).`;
  })();
  $: debateInsight =
    debateSwingCount > 0
      ? `${debateSwingCount} of ${total} weren't fully convinced by either argument, switching their pick at least once across the three rounds — the final ${debateSplit.Logical >= debateSplit.Creative ? "Logical" : "Creative"} majority hides how contested the debate actually was.`
      : `No one switched sides across the three rounds — every student's final pick reflects a consistent position, not a majority vote among mixed picks.`;
  $: storyInsight =
    storyMostDivisive && storyMostAgreed && storyMostDivisive.topic !== storyMostAgreed.topic
      ? `${storyMostDivisive.topic} is the most contested junction (${storyMostDivisive.acc} accuracy vs ${storyMostDivisive.prac} practicality), while the class agrees most on ${storyMostAgreed.topic.toLowerCase()}.`
      : `The class shows a similar accuracy-vs-practicality split at every junction.`;
</script>

<div class="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
  <h2 class="font-display text-lg font-bold text-slate-900">Class overview</h2>
  <p class="mt-1 text-sm text-slate-500">
    A high-level read of the expedition. Search above to drill into any student.
  </p>

  <div class="mt-4 grid items-start gap-4 md:grid-cols-2">
    <!-- Quantitative exercises -->
    <div class="rounded-2xl border border-slate-200 p-4">
      <div class="flex items-baseline justify-between gap-2">
        <div
          class="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500"
        >
          Quantitative exercises
        </div>
        <div class="font-display text-lg font-extrabold text-slate-800">
          {quantAvg} / {quantMax}
        </div>
      </div>
      <div class="mt-3 space-y-1.5">
        {#each quantPerColumn as c}
          <div class="flex items-center gap-2">
            <div
              class="flex w-32 shrink-0 items-center gap-1 whitespace-nowrap text-[11px] text-slate-500"
            >
              <span>{TYPE_ICON[c.short] ?? "📝"}</span>
              <span>{c.short}</span>
              <span class="group relative inline-flex">
                <span
                  class="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-slate-300 text-[9px] font-bold leading-none text-slate-400"
                  >i</span
                >
                <span
                  class="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 w-max max-w-xs -translate-x-1/2 whitespace-normal rounded-lg border border-slate-200 bg-white p-2 text-[11px] font-normal leading-snug text-slate-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                >
                  {questionTextFor(c.label)}
                </span>
              </span>
            </div>
            <div class="h-2 flex-1 rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-accent-400"
                style="width:{pct(c.passed)}%"
              ></div>
            </div>
            <div
              class="w-9 shrink-0 text-right text-[11px] tabular-nums text-slate-400"
            >
              {c.passed}/{total}
            </div>
          </div>
        {/each}
      </div>
      <p class="mt-3 text-xs text-slate-500">
        <span class="font-semibold text-slate-400">AI insight ·</span>
        {quantInsight}
      </p>
    </div>

    <!-- Reflection -->
    <div class="rounded-2xl border border-slate-200 p-4">
      <div
        class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500"
      >
        <span>Reflection</span>
        <span class="group relative inline-flex normal-case tracking-normal">
          <span
            class="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-slate-300 text-[9px] font-bold leading-none text-slate-400"
            >i</span
          >
          <span
            class="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 w-max max-w-xs -translate-x-1/2 whitespace-normal rounded-lg border border-slate-200 bg-white p-2 text-[11px] font-normal leading-snug text-slate-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
          >
            {REFLECTION_PROMPT}
          </span>
        </span>
      </div>
      <div class="mt-3 space-y-1.5">
        {#each reflectionCounts as c}
          <div class="flex items-center gap-2">
            <div class="flex w-28 shrink-0 items-center gap-1 text-[11px] text-slate-500">
              <span>{CONCEPT_ICON[c.key] ?? "💡"}</span>
              <span>{c.key}</span>
              <span class="group relative inline-flex">
                <span
                  class="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-slate-300 text-[9px] font-bold leading-none text-slate-400"
                  >i</span
                >
                <span
                  class="pointer-events-none absolute left-0 top-full z-20 mt-1.5 w-64 -translate-x-2 space-y-1.5 whitespace-normal rounded-lg border border-slate-200 bg-white p-2.5 text-left text-[11px] font-normal leading-snug text-slate-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                >
                  <span class="block font-semibold text-slate-700"
                    >{c.idea}</span
                  >
                  <span class="block border-t border-slate-100 pt-1.5">
                    <span
                      class="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-slate-400"
                      >What counts</span
                    >
                    {c.counts}
                  </span>
                </span>
              </span>
            </div>
            <div class="h-2 flex-1 rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-accent-400"
                style="width:{pct(c.n)}%"
              ></div>
            </div>
            <div
              class="w-9 shrink-0 text-right text-[11px] tabular-nums text-slate-400"
            >
              {c.n}/{total}
            </div>
          </div>
        {/each}
      </div>
      <p class="mt-3 text-xs text-slate-500">
        <span class="font-semibold text-slate-400">AI insight ·</span>
        {reflectionInsight}
      </p>
    </div>
  </div>

  <div class="mt-4 grid items-start gap-4 md:grid-cols-2">
    <!-- Debate -->
    <div class="rounded-2xl border border-slate-200 p-4">
      <div
        class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500"
      >
        <span>Debate</span>
        <span class="group relative inline-flex normal-case tracking-normal">
          <span
            class="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-slate-300 text-[9px] font-bold leading-none text-slate-400"
            >i</span
          >
          <span
            class="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 w-max max-w-xs -translate-x-1/2 whitespace-normal rounded-lg border border-slate-200 bg-white p-2 text-[11px] font-normal leading-snug text-slate-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
          >
            {DEBATE_QUESTION}
          </span>
        </span>
      </div>
      <div class="mt-2 space-y-1 text-[11px] text-slate-500">
        <div class="flex items-center gap-1.5">
          <span class="text-sm">🎨</span>
          <span class="font-semibold text-amber-700">Creative</span>
          <span class="group relative inline-flex">
            <span
              class="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-slate-300 text-[9px] font-bold leading-none text-slate-400"
              >i</span
            >
            <span
              class="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 w-max max-w-xs -translate-x-1/2 whitespace-normal rounded-lg border border-slate-200 bg-white p-2 text-left font-normal leading-snug text-slate-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
            >
              {DEBATE_SIDES.creative.why}
            </span>
          </span>
          <span>{DEBATE_SIDES.creative.verdict}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-sm">⚖️</span>
          <span class="font-semibold text-accent-700">Logical</span>
          <span class="group relative inline-flex">
            <span
              class="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-slate-300 text-[9px] font-bold leading-none text-slate-400"
              >i</span
            >
            <span
              class="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 w-max max-w-xs -translate-x-1/2 whitespace-normal rounded-lg border border-slate-200 bg-white p-2 text-left font-normal leading-snug text-slate-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
            >
              {DEBATE_SIDES.logical.why}
            </span>
          </span>
          <span>{DEBATE_SIDES.logical.verdict}</span>
        </div>
      </div>
      <div class="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          class="bg-accent-400"
          style="width:{pct(debateSplit.Logical)}%"
        ></div>
        <div
          class="bg-amber-300"
          style="width:{pct(debateSplit.Creative)}%"
        ></div>
      </div>
      <div class="mt-2 flex justify-between text-[11px] text-slate-500">
        <span
          ><span class="font-semibold text-slate-700">Logical</span>
          {debateSplit.Logical}/{total}</span
        >
        <span
          ><span class="font-semibold text-slate-700">Creative</span>
          {debateSplit.Creative}/{total}</span
        >
      </div>
      <p class="mt-3 text-xs text-slate-500">
        <span class="font-semibold text-slate-400">AI insight ·</span>
        {debateInsight}
      </p>
    </div>

    <!-- Creative Story Builder -->
    <div class="rounded-2xl border border-slate-200 p-4">
      <div
        class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500"
      >
        <span>Creative Story Builder</span>
        <span class="group relative inline-flex normal-case tracking-normal">
          <span
            class="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-slate-300 text-[9px] font-bold leading-none text-slate-400"
            >i</span
          >
          <span
            class="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 w-max max-w-xs -translate-x-1/2 whitespace-normal rounded-lg border border-slate-200 bg-white p-2 text-[11px] font-normal leading-snug text-slate-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
          >
            {STORY_INTRO}
          </span>
        </span>
      </div>
      <div class="mt-2 flex flex-wrap gap-1.5">
        {#each STORY_JUNCTIONS as j}
          <span
            class="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] text-slate-500"
          >
            <span class="font-semibold text-slate-600">{j.topic}:</span>
            <span class="text-emerald-700">⚙️ {j.accurate}</span>
            <span class="text-slate-300">vs</span>
            <span class="text-amber-700">🎪 {j.practical}</span>
            <span class="group relative inline-flex">
              <span
                class="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-slate-300 text-[9px] font-bold leading-none text-slate-400"
                >i</span
              >
              <span
                class="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 w-max max-w-xs -translate-x-1/2 whitespace-normal rounded-lg border border-slate-200 bg-white p-2 text-left font-normal leading-snug text-slate-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
              >
                <span class="block">
                  <span class="font-semibold text-emerald-700"
                    >⚙️ {j.accurate}:</span
                  >
                  {j.accurateWhy}
                </span>
                <span class="mt-1 block">
                  <span class="font-semibold text-amber-700"
                    >🎪 {j.practical}:</span
                  >
                  {j.practicalWhy}
                </span>
              </span>
            </span>
          </span>
        {/each}
      </div>
      <div class="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          class="bg-emerald-300"
          style="width:{pct(storySplit['Accuracy-first'])}%"
        ></div>
        <div class="bg-slate-300" style="width:{pct(storySplit.Mixed)}%"></div>
        <div
          class="bg-amber-300"
          style="width:{pct(storySplit['Practicality-first'])}%"
        ></div>
      </div>
      <div
        class="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500"
      >
        <span
          ><span class="font-semibold text-emerald-700">Accuracy</span>
          {storySplit["Accuracy-first"]}</span
        >
        <span
          ><span class="font-semibold text-slate-600">Mixed</span>
          {storySplit.Mixed}</span
        >
        <span
          ><span class="font-semibold text-amber-700">Practicality</span>
          {storySplit["Practicality-first"]}</span
        >
      </div>
      <p class="mt-3 text-xs text-slate-500">
        <span class="font-semibold text-slate-400">AI insight ·</span>
        {storyInsight}
      </p>
    </div>
  </div>
</div>
