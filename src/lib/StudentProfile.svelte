<!-- StudentProfile.svelte: an abstract per-student read. One tile per activity:
     a single headline outcome, a compact glance at the pattern behind it, and
     one observational AI insight. No question lists, transcripts or per-round
     breakdowns. Rendered inside the header search detail page; navigation
     (back / close) is left to the parent. -->
<script lang="ts">
  import { avatarFor, type Student } from "./studentHelpers";
  import {
    QUESTION_GUIDE,
    debatePicks,
    debateSummaryText,
    passedTypeOf,
    quantSummaryText,
    reflectionAnswerOf,
    reflectionSummaryText,
    storyChoicesFor,
    storyGroupFor,
    storyInterpretation,
  } from "./expedition";

  export let student: Student;
  export let debate: any = {};
  export let groups: Array<{
    id: string;
    label: string;
    chipTextClass?: string;
    chipBgClass?: string;
  }> = [];

  $: avatar = avatarFor(student?.name ?? "");
  $: groupMeta = groups.find((g) => g.id === student?.group);
  $: logicalSideName = debate?.right?.name;
  $: debateResult = debatePicks(student, logicalSideName);
  $: storyChoices = storyChoicesFor(student);
  $: storyGroup = storyGroupFor(student);
  $: reflectionAnswer = reflectionAnswerOf(student);
  $: quantPassed = QUESTION_GUIDE.filter(
    (q) => passedTypeOf(student, q.typeLabel) === true,
  ).length;
</script>

<div class="flex items-center gap-3">
  <div
    class="w-16 h-16 rounded-full {avatar.bg} flex items-center justify-center text-3xl shadow-sm shrink-0"
  >
    {avatar.emoji}
  </div>
  <div>
    <div class="font-display text-lg font-bold text-slate-900">{student.name}</div>
    {#if groupMeta}
      <div
        class="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold {groupMeta.chipTextClass} {groupMeta.chipBgClass}"
      >
        {groupMeta.label}
      </div>
    {/if}
  </div>
</div>

<!-- Quantitative exercises -->
<section class="mt-4 rounded-2xl border border-slate-200 p-4">
  <div class="flex items-baseline justify-between gap-2">
    <h3 class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
      Quantitative exercises
    </h3>
    <span class="font-display text-sm font-bold text-slate-700">
      {quantPassed} / {QUESTION_GUIDE.length} passed
    </span>
  </div>
  <div class="mt-2 flex gap-1.5">
    {#each QUESTION_GUIDE as q}
      {@const ok = passedTypeOf(student, q.typeLabel)}
      <span
        title={q.label}
        class="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold {ok ===
        null
          ? 'bg-slate-100 text-slate-400'
          : ok
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-rose-100 text-rose-600'}"
      >
        {ok === null ? "–" : ok ? "✓" : "✕"}
      </span>
    {/each}
  </div>
  <p class="mt-3 text-sm text-slate-600">
    <span class="font-semibold text-slate-400">AI insight ·</span>
    {quantSummaryText(student)}
  </p>
</section>

<!-- Reflection -->
<section class="mt-4 rounded-2xl border border-slate-200 p-4">
  <h3 class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
    Reflection
  </h3>
  {#if reflectionAnswer}
    <p class="mt-2 text-sm italic text-slate-700">"{reflectionAnswer}"</p>
  {:else}
    <p class="mt-2 text-sm text-slate-400">No reflection recorded.</p>
  {/if}
  <p class="mt-3 text-sm text-slate-600">
    <span class="font-semibold text-slate-400">AI insight ·</span>
    {reflectionSummaryText(student)}
  </p>
</section>

<!-- Debate -->
<section class="mt-4 rounded-2xl border border-slate-200 p-4">
  <div class="flex items-baseline justify-between gap-2">
    <h3 class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
      Debate
    </h3>
    <span
      class="rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-bold text-accent-700"
      >{debateResult.winner}</span
    >
  </div>
  <div class="mt-2 flex gap-1.5">
    {#each debateResult.picks as pick, i}
      <span
        class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px]"
      >
        <span class="font-semibold text-slate-400">R{i + 1}</span>
        <span
          class="font-semibold {pick === 'Creative'
            ? 'text-amber-700'
            : 'text-accent-700'}">{pick}</span
        >
      </span>
    {/each}
  </div>
  <p class="mt-3 text-sm text-slate-600">
    <span class="font-semibold text-slate-400">AI insight ·</span>
    {debateSummaryText(student, logicalSideName)}
  </p>
</section>

<!-- Creative Story Builder -->
<section class="mt-4 rounded-2xl border border-slate-200 p-4">
  <div class="flex items-baseline justify-between gap-2">
    <h3 class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
      Creative Story Builder
    </h3>
    <span
      class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600"
      >{storyGroup}</span
    >
  </div>
  <div class="mt-2 flex flex-wrap gap-1.5">
    {#each storyChoices as c}
      <span
        class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px]"
      >
        <span class="font-semibold text-slate-400">J{c.n}</span>
        {c.accurate ? "⚙️" : "🎪"}
        <span
          class="font-medium {c.accurate ? 'text-emerald-700' : 'text-amber-700'}"
          >{c.choice}</span
        >
      </span>
    {/each}
  </div>
  <p class="mt-3 text-sm text-slate-600">
    <span class="font-semibold text-slate-400">AI insight ·</span>
    {storyInterpretation(student)}
  </p>
</section>
