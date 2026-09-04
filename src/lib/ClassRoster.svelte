<!-- ClassRoster.svelte: whole-class, item-level exercise results as a
     pass/fail grid. One row per student, one column per quiz exercise type.
     A cell is a pass when none of that student's answers of that type were
     wrong (a correct-after-retry still counts as a pass). -->
<script lang="ts">
  import type { Student } from "./studentHelpers";
  import {
    DEBATE_QUESTION,
    DEBATE_ROUNDS,
    DEBATE_SIDES,
    QUESTION_GUIDE,
    REFLECTION_CONCEPTS,
    STORY_INTRO,
    STORY_JUNCTIONS,
    debatePicks,
    debateStudentInsight,
    passedTypeOf as passed,
    quantSummaryLine,
    storyChoicesFor,
    storyGroupFor,
    storyStudentInsight,
    studentUtterances,
  } from "./expedition";

  export let students: Array<Student> = [];
  export let questionTypes: Array<{ label: string }> = [];
  export let debate: any = {};

  // Short, column-friendly names for each quiz exercise type.
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

  $: presentLabels = questionTypes.map((t) => t.label);
  $: columns = [
    ...COLUMN_ORDER.filter((l) => presentLabels.includes(l)),
    ...presentLabels.filter((l) => !COLUMN_ORDER.includes(l)),
  ].map((label) => ({
    label,
    short: SHORT_LABEL[label] ?? label.replace(/\s*\(.*\)\s*$/, ""),
  }));

  $: reflectionGroups = REFLECTION_CONCEPTS.map(({ key, test, idea, counts }) => {
    const mentions: Array<{ name: string; quote: string }> = [];
    const missing: string[] = [];
    for (const s of students) {
      const turns = studentUtterances(s);
      if (turns.length && test(turns.join(" ")))
        mentions.push({ name: s.name, quote: turns[0] });
      else missing.push(s.name);
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
      winner,
      insight: debateStudentInsight(s, logicalSideName),
    };
  });

  $: debateGroups = {
    Logical: debateRows.filter((r) => r.winner === "Logical"),
    Creative: debateRows.filter((r) => r.winner === "Creative"),
  };

  const debateRoundsInfo = DEBATE_ROUNDS;

  // --- Story (Creative Story Builder) ----------------------------------
  $: storyRows = students.map((s) => ({
    name: s.name,
    choices: storyChoicesFor(s),
    group: storyGroupFor(s),
    insight: storyStudentInsight(s),
  }));

  $: storyGroups = ["Mixed", "Accuracy-first", "Practicality-first"].map(
    (key) => ({ key, rows: storyRows.filter((r) => r.group === key) }),
  );

  // --- Class-level "AI Insights", two sentences per section --------------
  $: total = students.length;

  $: reflectionInsight = `The class can state that Earth is round and that gravity is involved, but few tie it to mass: ${reflectionGroups[0]?.mentions.length ?? 0}/${total} describe the pull toward a center point, ${reflectionGroups[1]?.mentions.length ?? 0}/${total} name mass as the driver, and ${reflectionGroups[2]?.mentions.length ?? 0}/${total} link the inward pull to the round shape it forms.`;

  $: debateInsight =
    debateGroups.Creative.length >= debateGroups.Logical.length
      ? `Most of the class (${debateGroups.Creative.length}/${total}) are persuaded by the history-and-discovery case. The mass-based test, that enough mass lets gravity pull an object round, is the deciding factor for only ${debateGroups.Logical.length}/${total}.`
      : `Most of the class (${debateGroups.Logical.length}/${total}) side with Logical, so students can use the mass-based test, that enough mass lets gravity pull an object round, as the deciding rule. The other ${debateGroups.Creative.length}/${total} still lead with the fairness and discovery argument.`;

  $: storyInsight = `${storyRows.filter((r) => r.choices.some((c) => c.accurate)).length}/${total} pick the physics-accurate option at one or more junctions, so students can recognise which build choices model real gravity. But only ${storyGroups.find((g) => g.key === "Accuracy-first")?.rows.length ?? 0}/${total} stay accuracy-first at every junction (${storyGroups.find((g) => g.key === "Practicality-first")?.rows.length ?? 0}/${total} go practical throughout); most trade at least one choice for a model that is easier to build or flashier for the crowd.`;

  const knowledgeSummary = quantSummaryLine;
  const questionGuide = QUESTION_GUIDE;

  // --- Quantitative: per-student score out of the exercise count + class stats
  function scoreOf(s: Student): number {
    return columns.filter((c) => passed(s, c.label) === true).length;
  }
  $: quantMax = columns.length;
  $: quantScores = students.map((s) => scoreOf(s));
  $: quantAvg = quantScores.length
    ? Math.round(
        (quantScores.reduce((a, n) => a + n, 0) / quantScores.length) * 10,
      ) / 10
    : 0;
  $: quantAllPassed = quantScores.filter((n) => n === quantMax).length;
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

  <section class="mt-6 rounded-2xl border border-slate-300 p-4 sm:p-5">
  <div class="text-sm font-bold uppercase tracking-[0.2em] text-slate-600">
    Reflection
  </div>
  <p class="mt-2 text-sm text-slate-500">
    Sparkli asks each student, at the end of the expedition: "What did you learn
    about gravity, mass, and why Earth is round?"
  </p>

  <div class="mt-4 grid gap-4 md:grid-cols-3 items-start">
    {#each reflectionGroups as g}
      <div>
        <div class="text-sm font-medium text-slate-700">{g.key}</div>
        <p class="mt-0.5 text-xs text-slate-500">{g.idea}</p>
        <p class="mt-1 text-[11px] leading-snug text-slate-400">
          <span class="font-semibold uppercase tracking-wide">Counts when:</span>
          {g.counts}
        </p>
        <div class="mt-2 rounded-2xl border border-accent-100 bg-accent-50/30 p-4">
          <div class="text-sm font-bold text-slate-900">
            Mentions this
            <span class="font-semibold text-slate-400">({g.mentions.length})</span>
          </div>
          {#if g.mentions.length}
            <div class="mt-2 divide-y divide-slate-200/70">
              {#each g.mentions as m}
                <div class="py-2.5 first:pt-0 last:pb-0">
                  <div class="text-sm font-semibold text-slate-800">{m.name}</div>
                  <p class="mt-0.5 text-sm italic text-slate-600">"{m.quote}"</p>
                </div>
              {/each}
            </div>
          {:else}
            <p class="mt-1 text-sm text-slate-400">No student mentioned this.</p>
          {/if}

          {#if g.missing.length}
            <div class="mt-3 border-t border-slate-200/70 pt-3">
              <div class="text-sm font-bold text-slate-900">
                Does not mention this
                <span class="font-semibold text-slate-400">({g.missing.length})</span>
              </div>
              <p class="mt-1 text-sm text-slate-500">{g.missing.join(", ")}</p>
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

  <section class="mt-5 rounded-2xl border border-slate-300 p-4 sm:p-5">
  <div class="text-sm font-bold uppercase tracking-[0.2em] text-slate-600">
    Debate
  </div>
  <p class="mt-2 text-sm font-medium text-slate-700">{DEBATE_QUESTION}</p>
  <ul class="mt-2 space-y-1.5 text-sm text-slate-600">
    <li>
      <span class="font-semibold text-slate-800">Creative:</span>
      <span class="font-medium text-slate-700">{DEBATE_SIDES.creative.verdict}</span>
      {DEBATE_SIDES.creative.why}
    </li>
    <li>
      <span class="font-semibold text-slate-800">Logical:</span>
      <span class="font-medium text-slate-700">{DEBATE_SIDES.logical.verdict}</span>
      {DEBATE_SIDES.logical.why}
    </li>
  </ul>
  <p class="mt-2 text-xs text-slate-400">
    Each student picks a winner across three rounds; the majority side is the
    ultimate winner.
  </p>

  <div class="mt-3 grid gap-3 md:grid-cols-3 items-start">
    {#each debateRoundsInfo as r}
      <div class="rounded-xl border border-slate-200 p-3">
        <div class="text-xs font-bold uppercase tracking-wide text-slate-500">
          Round {r.n}
        </div>
        <p class="mt-1 text-sm text-slate-600">
          <span class="font-semibold text-slate-700">Logical:</span>
          {r.logical}
        </p>
        <p class="mt-1 text-sm text-slate-600">
          <span class="font-semibold text-slate-700">Creative:</span>
          {r.creative}
        </p>
      </div>
    {/each}
  </div>

  <div class="mt-4 grid gap-4 md:grid-cols-2 items-start">
    {#each [{ side: "Logical", rows: debateGroups.Logical }, { side: "Creative", rows: debateGroups.Creative }] as col}
      <div>
        <div class="text-sm text-slate-500">
          Sided with {col.side}
          <span class="text-slate-400">({col.rows.length})</span>
        </div>
        <div class="mt-1.5 rounded-2xl border border-accent-100 bg-accent-50/30 p-4">
          {#if col.rows.length}
            <div class="divide-y divide-slate-200/70">
              {#each col.rows as row}
                <div class="py-2.5 first:pt-0 last:pb-0">
                  <div class="text-sm font-semibold text-slate-800">{row.name}</div>
                  <div class="mt-1 flex flex-wrap gap-1.5">
                    {#each row.picks as pick, i}
                      <span
                        class="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600"
                      >
                        <span class="font-semibold text-slate-400">R{i + 1}</span>
                        {pick}
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

  <section class="mt-5 rounded-2xl border border-slate-300 p-4 sm:p-5">
  <div class="text-sm font-bold uppercase tracking-[0.2em] text-slate-600">
    Creative Story Builder
  </div>
  <p class="mt-2 text-sm text-slate-600">{STORY_INTRO}</p>

  <div class="mt-3 grid gap-3 md:grid-cols-3 items-start">
    {#each STORY_JUNCTIONS as j}
      <div class="rounded-xl border border-slate-200 p-3">
        <div class="text-xs font-bold uppercase tracking-wide text-slate-500">
          Junction {j.n}: {j.topic}
        </div>
        <div class="mt-2 space-y-2">
          <div>
            <div class="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <span
                class="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700"
                >Accuracy</span
              >
              <span class="text-sm font-semibold text-slate-800">{j.accurate}</span>
            </div>
            <p class="mt-0.5 text-xs text-slate-500">{j.accurateWhy}</p>
          </div>
          <div>
            <div class="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <span
                class="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700"
                >Practicality</span
              >
              <span class="text-sm font-semibold text-slate-800">{j.practical}</span>
            </div>
            <p class="mt-0.5 text-xs text-slate-500">{j.practicalWhy}</p>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-4 grid gap-4 md:grid-cols-3 items-start">
    {#each storyGroups as g}
      <div>
        <div class="text-sm text-slate-500">
          {g.key}
          <span class="text-slate-400">({g.rows.length})</span>
        </div>
        <div class="mt-1.5 rounded-2xl border border-accent-100 bg-accent-50/30 p-4">
          {#if g.rows.length}
            <div class="divide-y divide-slate-200/70">
              {#each g.rows as row}
                <div class="py-2.5 first:pt-0 last:pb-0">
                  <div class="text-sm font-semibold text-slate-800">{row.name}</div>
                  <div class="mt-1 flex flex-wrap gap-1.5">
                    {#each row.choices as c}
                      <span
                        class="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600"
                      >
                        <span class="font-semibold text-slate-400">J{c.n}</span>
                        {c.choice}
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
    <p class="mt-1 text-sm text-slate-600">{storyInsight}</p>
  </div>
  </section>

  <section class="mt-5 rounded-2xl border border-slate-300 p-4 sm:p-5">
  <div class="text-sm font-bold uppercase tracking-[0.2em] text-slate-600">
    Quantitative exercises
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
        Passed every exercise
      </div>
      <div class="mt-0.5 font-display text-xl font-extrabold text-slate-800">
        {quantAllPassed} / {total}
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
            <th class="px-3 py-3 text-center font-semibold">{c.short}</th>
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
              {@const ok = passed(s, c.label)}
              <td class="px-3 py-3 text-center align-top">
                {#if ok === null}
                  <span class="text-slate-300">–</span>
                {:else if ok}
                  <span
                    class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs"
                    >✓</span
                  >
                {:else}
                  <span
                    class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-500 text-xs"
                    >✕</span
                  >
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

  <section class="mt-5 rounded-2xl border border-slate-300 p-4 sm:p-5">
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
</div>
