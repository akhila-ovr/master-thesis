<!-- ClassRoster.svelte: whole-class, item-level exercise results as a
     pass/fail grid. One row per student, one column per quiz exercise type.
     A cell is a pass when none of that student's answers of that type were
     wrong (a correct-after-retry still counts as a pass). -->
<script lang="ts">
  import type { Student } from "./studentHelpers";
  import StoryMindMap from "./StoryMindMap.svelte";
  import {
    DEBATE_QUESTION,
    DEBATE_ROUNDS,
    DEBATE_SIDES,
    QUESTION_GUIDE,
    REFLECTION_CONCEPTS,
    STORY_INTRO,
    debatePicks,
    debateRoundMinutes,
    debateStudentInsight,
    passedTypeOf as passed,
    quantSummaryLine,
    quizPartsFor,
    quizRetriesFor,
    quizScoreFor,
    reflectionMinutesFor,
    storyClassInsight,
    TYPE_UNIT_LABEL,
    studentUtterances,
  } from "./expedition";

  export let students: Array<Student> = [];
  export let questionTypes: Array<{ label: string }> = [];
  export let debate: any = {};

  const TABS = [
    { id: "quant", label: "Quiz results" },
    { id: "reflection", label: "Reflection" },
    { id: "debate", label: "Debate" },
    { id: "story", label: "Creative Story Builder" },
  ] as const;
  type TabId = (typeof TABS)[number]["id"];
  let activeTab: TabId = "quant";

  // One color per reflection concept, so the three columns read as clearly
  // separate at a glance instead of three plain text blocks.
  const REFLECTION_COLORS = [
    { border: "border-sky-300", bg: "bg-sky-50", bar: "bg-sky-400", text: "text-sky-700", chip: "bg-sky-100 text-sky-700" },
    { border: "border-amber-300", bg: "bg-amber-50", bar: "bg-amber-400", text: "text-amber-700", chip: "bg-amber-100 text-amber-700" },
    { border: "border-violet-300", bg: "bg-violet-50", bar: "bg-violet-400", text: "text-violet-700", chip: "bg-violet-100 text-violet-700" },
  ];

  // One color per debate side, used consistently everywhere that side
  // appears (verdict cards, round breakdown, per-student picks).
  const DEBATE_COLORS: Record<
    "Logical" | "Creative",
    { border: string; bg: string; bar: string; text: string; chip: string; solid: string }
  > = {
    Logical: {
      border: "border-purple-300",
      bg: "bg-purple-50",
      bar: "bg-purple-400",
      text: "text-purple-700",
      chip: "bg-purple-100 text-purple-700",
      solid: "bg-purple-500",
    },
    Creative: {
      border: "border-orange-300",
      bg: "bg-orange-50",
      bar: "bg-orange-400",
      text: "text-orange-700",
      chip: "bg-orange-100 text-orange-700",
      solid: "bg-orange-500",
    },
  };
  const VERDICT_COLS: Array<{ side: "Logical" | "Creative"; data: { verdict: string; why: string } }> = [
    { side: "Logical", data: DEBATE_SIDES.logical },
    { side: "Creative", data: DEBATE_SIDES.creative },
  ];

  // Short, column-friendly names for each quiz exercise type.
  const SHORT_LABEL: Record<string, string> = {
    "Multiple choice (1 question)": "Multi-choice",
    "Fill in blanks (1 question)": "Fill-in-blank",
    "Sorting (1 question)": "Sorting",
    "True / False (1 question)": "True/False",
    "Drag & drop (1 question)": "Drag-drop",
  };
  const COLUMN_ORDER = [
    "Multiple choice (1 question)",
    "Fill in blanks (1 question)",
    "Sorting (1 question)",
    "True / False (1 question)",
    "Drag & drop (1 question)",
  ];

  $: presentLabels = questionTypes.map((t) => t.label);
  $: columns = [
    ...COLUMN_ORDER.filter((l) => presentLabels.includes(l)),
    ...presentLabels.filter((l) => !COLUMN_ORDER.includes(l)),
  ].map((label) => ({
    label,
    short: SHORT_LABEL[label] ?? label.replace(/\s*\(.*\)\s*$/, ""),
  }));

  $: reflectionGroups = REFLECTION_CONCEPTS.map(({ key, test, idea, counts }) => {
    const mentions: Array<{ name: string; quote: string; minutes: number }> = [];
    const missing: Array<{ name: string; quote: string; minutes: number }> = [];
    for (const s of students) {
      const turns = studentUtterances(s);
      const minutes = reflectionMinutesFor(s);
      const quote = turns[0] ?? "";
      if (turns.length && test(turns.join(" ")))
        mentions.push({ name: s.name, quote, minutes });
      else missing.push({ name: s.name, quote, minutes });
    }
    return { key, idea, counts, mentions, missing };
  });

  // --- Debate -----------------------------------------------------------
  // Round quotes and the per-student pick derivation live in ./expedition
  // so the roster and the student detail view stay in sync.
  $: logicalSideName = debate?.right?.name;

  $: debateRows = students.map((s) => {
    const { picks, winner } = debatePicks(s, logicalSideName);
    return {
      name: s.name,
      picks,
      roundMinutes: [1, 2, 3].map((r) => debateRoundMinutes(s, r)),
      winner,
      insight: debateStudentInsight(s, logicalSideName),
    };
  });

  $: debateGroups = {
    Logical: debateRows.filter((r) => r.winner === "Logical"),
    Creative: debateRows.filter((r) => r.winner === "Creative"),
  };

  $: sideCols = [
    { side: "Logical" as const, rows: debateGroups.Logical },
    { side: "Creative" as const, rows: debateGroups.Creative },
  ];

  const debateRoundsInfo = DEBATE_ROUNDS;

  // --- Class-level "AI Insights", two sentences per section --------------
  $: total = students.length;

  $: reflectionInsight = `The class can state that Earth is round and that gravity is involved, but few tie it to mass: ${reflectionGroups[0]?.mentions.length ?? 0}/${total} describe the pull toward a center point, ${reflectionGroups[1]?.mentions.length ?? 0}/${total} name mass as the driver, and ${reflectionGroups[2]?.mentions.length ?? 0}/${total} link the inward pull to the round shape it forms.`;

  $: debateInsight =
    debateGroups.Creative.length >= debateGroups.Logical.length
      ? `Most of the class (${debateGroups.Creative.length}/${total}) are persuaded by the history-and-discovery case. The mass-based test, that enough mass lets gravity pull an object round, is the deciding factor for only ${debateGroups.Logical.length}/${total}.`
      : `Most of the class (${debateGroups.Logical.length}/${total}) side with Logical, so students can use the mass-based test, that enough mass lets gravity pull an object round, as the deciding rule. The other ${debateGroups.Creative.length}/${total} still lead with the fairness and discovery argument.`;

  $: storyInsight = storyClassInsight(students);

  const knowledgeSummary = quantSummaryLine;
  const questionGuide = QUESTION_GUIDE;

  // --- Quantitative: per-student score out of the exercise count + class
  // stats. Each type contributes 1 point (fully correct), 0.5 (partially
  // correct -- fill-in-blank/drag & drop/sorting can land here), or 0.
  function scoreOf(s: Student): number {
    return columns.reduce((sum, c) => sum + quizScoreFor(s, c.label), 0);
  }
  $: quantMax = columns.length;
  $: quantScores = students.map((s) => scoreOf(s));
  $: quantAvg = quantScores.length
    ? Math.round(
        (quantScores.reduce((a, n) => a + n, 0) / quantScores.length) * 10,
      ) / 10
    : 0;
  $: quantNeedsSupport = quantScores.filter((n) => n < quantMax / 2).length;
  $: quantPerColumn = columns.map((c) => ({
    short: c.short,
    passed: students.filter((s) => passed(s, c.label) === true).length,
  }));
  $: quantStrongest = [...quantPerColumn].sort((a, b) => b.passed - a.passed)[0];
  $: quantWeakest = [...quantPerColumn].sort((a, b) => a.passed - b.passed)[0];
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
        class="rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors {activeTab === t.id
          ? 'bg-accent-600 text-white shadow-sm'
          : 'border border-slate-200 bg-white text-slate-500 hover:text-slate-700'}"
        on:click={() => (activeTab = t.id)}
      >
        {t.label}
      </button>
    {/each}
  </div>

  {#if activeTab === "reflection"}
  <section class="mt-4 rounded-2xl border border-slate-300 p-4 sm:p-5">
  <div class="text-sm font-bold uppercase tracking-[0.2em] text-slate-600">
    Reflection
  </div>
  <p class="mt-2 text-sm text-slate-500">
    Sparkli asks each student, at the end of the expedition: "What did you learn
    about gravity, mass, and why Earth is round?"
  </p>
  <p class="mt-1 text-xs text-slate-400">
    Gravity, mass, and sphere are the expedition's three learning goals — the
    columns below check whether each student's own words show they connected
    them.
  </p>

  <div class="mt-4 grid gap-4 md:grid-cols-3 items-start">
    {#each reflectionGroups as g, i}
      {@const c = REFLECTION_COLORS[i % REFLECTION_COLORS.length]}
      <div class="overflow-hidden rounded-2xl border-2 {c.border} shadow-sm">
        <div class="h-1.5 {c.bar}"></div>
        <div class="{c.bg} p-4">
          <div class="text-sm font-extrabold {c.text}">{g.key}</div>
          <p class="mt-1 text-xs text-slate-600">{g.idea}</p>
          <blockquote class="mt-2 border-l-2 {c.border} pl-2.5 text-[11px] leading-snug text-slate-500">
            <span class="font-semibold uppercase tracking-wide text-slate-600">Counts when</span>
            — {g.counts}
          </blockquote>
        </div>
        <div class="border-t {c.border} bg-white p-4">
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-bold text-slate-900">Mentions this</span>
            <span class="rounded-full {c.chip} px-1.5 py-0.5 text-[10px] font-bold">{g.mentions.length}</span>
          </div>
          {#if g.mentions.length}
            <div class="mt-2 divide-y divide-slate-100">
              {#each g.mentions as m}
                <div class="py-2.5 first:pt-0 last:pb-0">
                  <div class="flex items-baseline gap-1.5">
                    <span class="text-sm font-semibold text-slate-800">{m.name}</span>
                    <span class="text-[10px] text-slate-400">{m.minutes} min</span>
                  </div>
                  <p class="mt-0.5 text-sm italic text-slate-600">"{m.quote}"</p>
                </div>
              {/each}
            </div>
          {:else}
            <p class="mt-1 text-sm text-slate-400">No student mentioned this.</p>
          {/if}

          {#if g.missing.length}
            <div class="relative mt-5 border-t-2 border-dashed border-slate-200 pt-4">
              <span
                class="absolute -top-2.5 left-0 bg-white pr-2 text-[10px] font-bold uppercase tracking-wide text-slate-300"
                >vs</span
              >
              <div class="flex items-center gap-1.5">
                <span class="text-sm font-bold text-slate-500">Does not mention this</span>
                <span class="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                  {g.missing.length}
                </span>
              </div>
              <div class="mt-1.5 divide-y divide-slate-100 rounded-xl bg-slate-50/60 px-2">
                {#each g.missing as m}
                  <div class="py-2.5 first:pt-0 last:pb-0">
                    <div class="flex items-baseline gap-1.5">
                      <span class="text-sm font-semibold text-slate-600">{m.name}</span>
                      <span class="text-[10px] text-slate-400">{m.minutes} min</span>
                    </div>
                    {#if m.quote}
                      <p class="mt-0.5 text-sm italic text-slate-500">"{m.quote}"</p>
                    {:else}
                      <p class="mt-0.5 text-sm text-slate-400">No reflection recorded.</p>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div class="text-xs font-bold uppercase tracking-wide text-slate-500">
      AI Insights
    </div>
    <p class="mt-1 text-sm text-slate-600">{reflectionInsight}</p>
  </div>
  </section>
  {/if}

  {#if activeTab === "debate"}
  <section class="mt-4 rounded-2xl border border-slate-300 p-4 sm:p-5">
  <div class="text-sm font-bold uppercase tracking-[0.2em] text-slate-600">
    Debate
  </div>
  <blockquote class="mt-3 rounded-xl border-l-4 border-accent-400 bg-accent-50/60 px-4 py-3 text-sm font-semibold text-slate-800">
    {DEBATE_QUESTION}
  </blockquote>

  <div class="mt-3 grid gap-3 sm:grid-cols-2">
    {#each VERDICT_COLS as v}
      {@const c = DEBATE_COLORS[v.side]}
      <div class="rounded-xl border-2 {c.border} {c.bg} p-3">
        <div class="flex items-center gap-2">
          <span class="rounded-full {c.solid} px-2 py-0.5 text-xs font-bold text-white">{v.side}</span>
          <span class="text-sm font-semibold {c.text}">{v.data.verdict}</span>
        </div>
        <p class="mt-1.5 text-sm text-slate-600">{v.data.why}</p>
      </div>
    {/each}
  </div>
  <p class="mt-2 text-xs text-slate-400">
    Each student picks a winner across three rounds; the majority side is the
    ultimate winner.
  </p>

  <div class="mt-3 grid gap-3 md:grid-cols-3 items-start">
    {#each debateRoundsInfo as r}
      <div class="overflow-hidden rounded-xl border border-slate-200">
        <div class="bg-slate-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
          Round {r.n}
        </div>
        <div class="space-y-2 p-3">
          <p class="rounded-lg border-l-4 {DEBATE_COLORS.Logical.border} {DEBATE_COLORS.Logical.bg} py-1.5 pl-2.5 pr-2 text-sm text-slate-700">
            <span class="font-bold {DEBATE_COLORS.Logical.text}">Logical</span>
            {r.logical}
          </p>
          <p class="rounded-lg border-l-4 {DEBATE_COLORS.Creative.border} {DEBATE_COLORS.Creative.bg} py-1.5 pl-2.5 pr-2 text-sm text-slate-700">
            <span class="font-bold {DEBATE_COLORS.Creative.text}">Creative</span>
            {r.creative}
          </p>
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-4 grid gap-4 md:grid-cols-2 items-start">
    {#each sideCols as col}
      {@const c = DEBATE_COLORS[col.side]}
      <div class="overflow-hidden rounded-2xl border-2 {c.border} shadow-sm">
        <div class="h-1.5 {c.bar}"></div>
        <div class="{c.bg} flex items-center gap-1.5 px-4 py-2.5">
          <span class="text-sm font-extrabold {c.text}">Sided with {col.side}</span>
          <span class="rounded-full {c.chip} px-1.5 py-0.5 text-[10px] font-bold">{col.rows.length}</span>
        </div>
        <div class="bg-white p-4">
          {#if col.rows.length}
            <div class="divide-y divide-slate-100">
              {#each col.rows as row}
                <div class="py-2.5 first:pt-0 last:pb-0">
                  <div class="text-sm font-semibold text-slate-800">{row.name}</div>
                  <div class="mt-1 flex flex-wrap gap-1.5">
                    {#each row.picks as pick, i}
                      {@const pc = DEBATE_COLORS[pick]}
                      <span class="rounded-full {pc.chip} px-2 py-0.5 text-xs font-semibold">
                        <span class="font-bold opacity-60">R{i + 1}</span>
                        {pick}
                        <span class="opacity-60">· {row.roundMinutes[i]} min</span>
                      </span>
                    {/each}
                  </div>
                  <p class="mt-1.5 text-xs leading-snug text-slate-500">
                    <span class="font-semibold text-slate-400"
                      >{row.insight.minutes} min ·</span
                    >
                    {row.insight.pattern}
                  </p>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-sm text-slate-400">No student landed here.</p>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div class="text-xs font-bold uppercase tracking-wide text-slate-500">
      AI Insights
    </div>
    <p class="mt-1 text-sm text-slate-600">{debateInsight}</p>
  </div>
  </section>
  {/if}

  {#if activeTab === "story"}
  <section class="mt-4 rounded-2xl border border-slate-300 p-4 sm:p-5">
  <div class="text-sm font-bold uppercase tracking-[0.2em] text-slate-600">
    Creative Story Builder
  </div>
  <p class="mt-2 text-sm text-slate-600">{STORY_INTRO}</p>

  <StoryMindMap {students} />

  <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div class="text-xs font-bold uppercase tracking-wide text-slate-500">
      AI Insights
    </div>
    <p class="mt-1 text-sm text-slate-600">{storyInsight}</p>
  </div>
  </section>
  {/if}

  {#if activeTab === "quant"}
  <section class="mt-4 rounded-2xl border border-slate-300 p-4 sm:p-5">
  <div class="text-sm font-bold uppercase tracking-[0.2em] text-slate-600">
    Quiz results
  </div>

  <div class="mt-2 grid gap-3 sm:grid-cols-3">
    <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Class average
      </div>
      <div class="mt-0.5 font-display text-xl font-extrabold text-slate-800">
        {quantAvg} / {quantMax}
      </div>
    </div>
    <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Under half passed
      </div>
      <div class="mt-0.5 font-display text-xl font-extrabold text-slate-800">
        {quantNeedsSupport} / {total}
      </div>
    </div>
    <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Strongest / weakest
      </div>
      <div class="mt-0.5 text-sm text-slate-700">
        <span class="font-semibold">{quantStrongest?.short}</span>
        {quantStrongest?.passed ?? 0}/{total}
        <span class="text-slate-400">·</span>
        <span class="font-semibold">{quantWeakest?.short}</span>
        {quantWeakest?.passed ?? 0}/{total}
      </div>
    </div>
  </div>

  <div class="mt-3 overflow-x-auto">
    <table class="w-full min-w-[800px] text-sm">
      <thead>
        <tr
          class="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
        >
          <th class="py-3 pr-3 text-left font-semibold" aria-label="Student"></th>
          <th class="px-3 py-3 text-center font-semibold">Score</th>
          {#each columns as c}
            <th class="px-3 py-3 text-center font-semibold">
              {c.short}
              <div class="mt-0.5 text-[9px] font-normal normal-case text-slate-400">
                ({TYPE_UNIT_LABEL[c.label] ?? "questions"})
              </div>
            </th>
          {/each}
          <th class="px-3 py-3 text-left font-semibold w-72">AI Insights</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        {#each students as s}
          <tr>
            <td
              class="py-3 pr-3 text-left font-medium text-slate-800 whitespace-nowrap align-top"
              >{s.name}</td
            >
            <td
              class="px-3 py-3 text-center align-top font-display font-bold text-slate-700"
              >{scoreOf(s)}/{quantMax}</td
            >
            {#each columns as c}
              {@const p = quizPartsFor(s, c.label)}
              {@const retries = quizRetriesFor(s, c.label)}
              <td class="px-3 py-3 text-center align-top">
                {#if !p}
                  <span class="text-slate-300">–</span>
                {:else}
                  <span
                    class="inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold {p.correct ===
                    p.total
                      ? 'bg-emerald-100 text-emerald-700'
                      : p.correct === 0
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-amber-100 text-amber-700'}"
                    >{p.correct}/{p.total}</span
                  >
                  {#if retries}
                    <div class="mt-0.5 text-[9px] text-slate-400">
                      after {retries} {retries === 1 ? "retry" : "retries"}
                    </div>
                  {/if}
                {/if}
              </td>
            {/each}
            <td
              class="px-3 py-3 text-left align-top text-xs leading-relaxed text-slate-600 w-72"
              >{knowledgeSummary(s)}</td
            >
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  </section>

  <section class="mt-4 rounded-2xl border border-slate-300 p-4 sm:p-5">
    <div class="text-sm font-bold uppercase tracking-[0.2em] text-slate-600">
      What each exercise asks
    </div>
    <dl class="mt-3 space-y-3">
      {#each questionGuide as q}
        <div>
          <dt
            class="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
          >
            {q.label}
          </dt>
          <dd class="mt-0.5 text-sm text-slate-600">{q.text}</dd>
        </div>
      {/each}
    </dl>
  </section>
  {/if}
</div>
