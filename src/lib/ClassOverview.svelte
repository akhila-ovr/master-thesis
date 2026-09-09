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
    debatePicks,
    passedTypeOf as passed,
    storyClassInsight,
    studentUtterances,
  } from "./expedition";
  import StoryGraph from "./StoryGraph.svelte";

  export let students: Array<Student> = [];
  export let questionTypes: Array<{ label: string }> = [];
  export let debate: any = {};

  const TABS = [
    { id: "quant", label: "Exercises" },
    { id: "reflection", label: "Reflection" },
    { id: "debate", label: "Debate" },
    { id: "story", label: "Creative Story Builder" },
  ] as const;
  type TabId = (typeof TABS)[number]["id"];
  let activeTab: TabId = "quant";

  const SHORT_LABEL: Record<string, string> = {
    "Multiple choice (4 questions)": "Multi-choice",
    "Fill in blanks (2 questions)": "Fill-in-blank",
    "Sorting (1 question)": "Sorting",
    "True / False (3 questions)": "True/False",
    "Drag & drop (2 questions)": "Drag-drop",
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
  $: quantPerColumn = columns.map((c) => {
    const passedBy = students
      .filter((s) => passed(s, c.label) === true)
      .map((s) => s.name);
    return {
      label: c.label,
      short: c.short,
      passed: passedBy.length,
      passedBy,
    };
  });
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

  // --- Reflection: who connected each key concept in their own words -----
  $: reflectionCounts = REFLECTION_CONCEPTS.map(({ key, test, idea, counts }) => {
    const mentioned = students.filter((s) => {
      const t = studentUtterances(s);
      return t.length > 0 && test(t.join(" "));
    });
    return { key, idea, counts, n: mentioned.length, names: mentioned.map((s) => s.name) };
  });

  // --- Debate: how the class's ultimate winners split ------------------
  $: logicalSideName = debate?.right?.name;
  $: debateSplit = students.reduce(
    (acc, s) => {
      acc[debatePicks(s, logicalSideName).winner]++;
      return acc;
    },
    { Logical: 0, Creative: 0 } as Record<"Logical" | "Creative", number>,
  );
  $: debateNames = students.reduce(
    (acc, s) => {
      acc[debatePicks(s, logicalSideName).winner].push(s.name);
      return acc;
    },
    { Logical: [], Creative: [] } as Record<"Logical" | "Creative", string[]>,
  );

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
  $: reflectionInsight = `The class can state that Earth is round and that gravity is involved, but few tie it to mass: ${reflectionCounts[0]?.n ?? 0}/${total} describe the pull toward a center point, ${reflectionCounts[1]?.n ?? 0}/${total} name mass as the driver, and ${reflectionCounts[2]?.n ?? 0}/${total} link the inward pull to the round shape it forms.`;
  $: debateInsight =
    debateSplit.Creative >= debateSplit.Logical
      ? `Most of the class (${debateSplit.Creative}/${total}) are persuaded by the history-and-discovery case. The mass-based test, that enough mass lets gravity pull an object round, is the deciding factor for only ${debateSplit.Logical}/${total}.`
      : `Most of the class (${debateSplit.Logical}/${total}) side with Logical, so students can use the mass-based test, that enough mass lets gravity pull an object round, as the deciding rule. The other ${debateSplit.Creative}/${total} still lead with the fairness and discovery argument.`;
  $: storyInsight = storyClassInsight(students);
</script>

<div class="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
  <h2 class="font-display text-lg font-bold text-slate-900">Class overview</h2>
  <p class="mt-1 text-sm text-slate-500">
    Item-level exercise results, grouped by source. Search above for full detail
    on any student.
  </p>

  <div class="mt-5 flex flex-wrap gap-2">
    {#each TABS as t}
      <button
        type="button"
        class="rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors {activeTab ===
        t.id
          ? 'bg-accent-600 text-white shadow-sm'
          : 'border border-slate-200 bg-white text-slate-500 hover:text-slate-700'}"
        on:click={() => (activeTab = t.id)}
      >
        {t.label}
      </button>
    {/each}
  </div>

  {#if activeTab === "quant"}
    <!-- Exercises -->
    <section class="mt-4 rounded-2xl border border-slate-200 p-4">
      <div class="flex items-baseline justify-between gap-2">
        <h3 class="font-display text-base font-bold text-slate-900">Exercises</h3>
        <div class="font-display text-lg font-extrabold text-slate-800">
          {quantAvg}
          <span class="text-sm font-semibold text-slate-400">/ {quantMax}</span>
        </div>
      </div>
      <div
        class="mt-2 border-l-2 border-accent-300 bg-accent-50/50 py-1.5 pl-3 pr-2 text-xs leading-relaxed text-slate-600"
      >
        <span class="font-semibold text-accent-700">AI insights</span>
        <span class="text-slate-300">·</span>
        {quantInsight}
      </div>
      <div class="mt-4 space-y-3">
        {#each quantPerColumn as c}
          <div>
            <div class="flex items-center gap-2">
              <div
                class="flex w-32 shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-medium text-slate-600"
              >
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
                class="w-9 shrink-0 text-right text-[11px] font-semibold tabular-nums text-slate-500"
              >
                {c.passed}/{total}
              </div>
            </div>
            <div class="mt-1 pl-[8.5rem] text-[11px] text-slate-500">
              <span class="font-semibold text-slate-400">Passed by</span>
              {c.passedBy.join(", ") || "None"}
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  {#if activeTab === "reflection"}
    <!-- Reflection -->
    <section class="mt-4 rounded-2xl border border-slate-200 p-4">
      <div class="flex items-center gap-1.5">
        <h3 class="font-display text-base font-bold text-slate-900">Reflection</h3>
        <span class="group relative inline-flex">
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
      <div
        class="mt-2 border-l-2 border-accent-300 bg-accent-50/50 py-1.5 pl-3 pr-2 text-xs leading-relaxed text-slate-600"
      >
        <span class="font-semibold text-accent-700">AI insights</span>
        <span class="text-slate-300">·</span>
        {reflectionInsight}
      </div>
      <div class="mt-4 space-y-3">
        {#each reflectionCounts as c}
          <div>
            <div class="flex items-center gap-2">
              <div
                class="flex w-28 shrink-0 items-center gap-1 text-[11px] font-medium text-slate-600"
              >
                <span>{c.key}</span>
                <span class="group relative inline-flex">
                  <span
                    class="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-slate-300 text-[9px] font-bold leading-none text-slate-400"
                    >i</span
                  >
                  <span
                    class="pointer-events-none absolute left-0 top-full z-20 mt-1.5 w-64 -translate-x-2 space-y-1.5 whitespace-normal rounded-lg border border-slate-200 bg-white p-2.5 text-left text-[11px] font-normal leading-snug text-slate-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                  >
                    <span class="block font-semibold text-slate-700">{c.idea}</span>
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
                class="w-9 shrink-0 text-right text-[11px] font-semibold tabular-nums text-slate-500"
              >
                {c.n}/{total}
              </div>
            </div>
            {#if c.names.length}
              <div class="mt-1 pl-[7.5rem] text-[11px] text-slate-500">
                <span class="font-semibold text-slate-400">Connected by</span>
                {c.names.join(", ")}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/if}

  {#if activeTab === "debate"}
    <!-- Debate -->
    <section class="mt-4 rounded-2xl border border-slate-200 p-4">
      <div class="flex items-center gap-1.5">
        <h3 class="font-display text-base font-bold text-slate-900">Debate</h3>
        <span class="group relative inline-flex">
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
      <div
        class="mt-2 border-l-2 border-accent-300 bg-accent-50/50 py-1.5 pl-3 pr-2 text-xs leading-relaxed text-slate-600"
      >
        <span class="font-semibold text-accent-700">AI insights</span>
        <span class="text-slate-300">·</span>
        {debateInsight}
      </div>
      <div class="mt-4 space-y-1.5 text-[11px] text-slate-500">
        <div class="flex items-center gap-1.5">
          <span class="h-2 w-2 shrink-0 rounded-full bg-sky-400"></span>
          <span class="font-semibold text-sky-600">Creative</span>
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
          <span class="h-2 w-2 shrink-0 rounded-full bg-accent-500"></span>
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
          class="bg-sky-300"
          style="width:{pct(debateSplit.Creative)}%"
        ></div>
      </div>
      <div class="mt-2 flex justify-between text-[11px] text-slate-500">
        <span
          ><span class="font-semibold text-accent-700">Logical</span>
          {debateSplit.Logical}/{total}</span
        >
        <span
          ><span class="font-semibold text-sky-600">Creative</span>
          {debateSplit.Creative}/{total}</span
        >
      </div>
      <div class="mt-3 grid gap-2 sm:grid-cols-2">
        <div class="rounded-lg border border-slate-200 p-2.5 text-[11px]">
          <div class="font-semibold text-accent-700">Chose Logical</div>
          <div class="mt-0.5 text-slate-500">
            {debateNames.Logical.join(", ") || "None"}
          </div>
        </div>
        <div class="rounded-lg border border-slate-200 p-2.5 text-[11px]">
          <div class="font-semibold text-sky-600">Chose Creative</div>
          <div class="mt-0.5 text-slate-500">
            {debateNames.Creative.join(", ") || "None"}
          </div>
        </div>
      </div>
    </section>
  {/if}

  {#if activeTab === "story"}
    <!-- Creative Story Builder -->
    <section class="mt-4 rounded-2xl border border-slate-200 p-4">
      <div class="flex items-center gap-1.5">
        <h3 class="font-display text-base font-bold text-slate-900">
          Creative Story Builder
        </h3>
        <span class="group relative inline-flex">
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
      <div
        class="mt-2 border-l-2 border-accent-300 bg-accent-50/50 py-1.5 pl-3 pr-2 text-xs leading-relaxed text-slate-600"
      >
        <span class="font-semibold text-accent-700">AI insights</span>
        <span class="text-slate-300">·</span>
        {storyInsight}
      </div>
      <StoryGraph {students} />
    </section>
  {/if}
</div>
