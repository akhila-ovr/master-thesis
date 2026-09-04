<!-- StudentProfile.svelte: an abstract per-student read, laid out by activity.
     Each section shows the prompt / questions, this student's outcome in a
     compact form, and an observational AI insight. Rendered inside the header
     search detail page; navigation (back / close) is left to the parent. -->
<script lang="ts">
  import { avatarFor, type Student } from "./studentHelpers";
  import {
    DEBATE_QUESTION,
    DEBATE_ROUNDS,
    DEBATE_SIDES,
    QUESTION_GUIDE,
    REFLECTION_CONCEPTS,
    REFLECTION_PROMPT,
    STORY_INTRO,
    STORY_JUNCTIONS,
    debatePicks,
    debateSummaryText,
    passedTypeOf,
    quantSummaryText,
    reflectionAnswerOf,
    reflectionSummaryText,
    storyChoicesFor,
    storyInterpretation,
  } from "./expedition";

  // Icons are positional, matching the order of QUESTION_GUIDE / REFLECTION_CONCEPTS.
  const QUANT_ICONS = ["🔘", "✏️", "🗂️", "⚖️", "🧲"];
  const REFLECTION_ICONS = ["🎯", "⚖️", "🌐"];

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
<section class="mt-6">
  <div class="flex items-baseline justify-between gap-2">
    <h3 class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
      Quantitative exercises
    </h3>
    <span class="font-display text-sm font-bold text-slate-700">
      {quantPassed} / {QUESTION_GUIDE.length} passed
    </span>
  </div>
  <div class="mt-3 grid gap-2 sm:grid-cols-2">
    {#each QUESTION_GUIDE as q, i}
      {@const ok = passedTypeOf(student, q.typeLabel)}
      <div class="flex gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5">
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base {ok ===
          null
            ? 'bg-slate-100'
            : ok
              ? 'bg-emerald-100'
              : 'bg-rose-100'}"
        >
          {QUANT_ICONS[i]}
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-semibold text-slate-700">{q.label}</span>
            <span
              class="text-xs {ok === null
                ? 'text-slate-400'
                : ok
                  ? 'text-emerald-600'
                  : 'text-rose-600'}">{ok === null ? "–" : ok ? "✓" : "✕"}</span
            >
          </div>
          <p class="mt-0.5 text-[11px] leading-snug text-slate-500">{q.text}</p>
        </div>
      </div>
    {/each}
  </div>
  <div class="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div class="text-xs font-bold uppercase tracking-wide text-slate-500">
      AI Insights
    </div>
    <p class="mt-1 text-sm text-slate-600">{quantSummaryText(student)}</p>
  </div>
</section>

<!-- Reflection -->
<section class="mt-6">
  <h3 class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
    Reflection
  </h3>
  <div class="mt-3 space-y-2">
    <div class="flex items-start gap-2">
      <div
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm"
      >
        ✨
      </div>
      <div
        class="rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-xs text-slate-600"
      >
        {REFLECTION_PROMPT}
      </div>
    </div>
    {#if reflectionAnswer}
      <div class="flex items-start justify-end gap-2">
        <div
          class="rounded-2xl rounded-tr-sm bg-accent-100 px-3 py-2 text-xs text-slate-700"
        >
          "{reflectionAnswer}"
        </div>
        <div
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full {avatar.bg} text-sm"
        >
          {avatar.emoji}
        </div>
      </div>
    {:else}
      <p class="pl-9 text-xs text-slate-400">No reflection recorded.</p>
    {/if}
  </div>
  <div class="mt-3 flex flex-wrap items-center gap-1.5">
    <span class="text-[11px] font-semibold text-slate-400">Listening for</span>
    {#each REFLECTION_CONCEPTS as c, i}
      <span
        class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
      >
        {REFLECTION_ICONS[i]} {c.key}
      </span>
    {/each}
  </div>
  <div class="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div class="text-xs font-bold uppercase tracking-wide text-slate-500">
      AI Insights
    </div>
    <p class="mt-1 text-sm text-slate-600">{reflectionSummaryText(student)}</p>
  </div>
</section>

<!-- Debate -->
<section class="mt-6">
  <h3 class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
    Debate
  </h3>
  <div class="mt-3 rounded-xl border border-slate-200 bg-white p-3">
    <p class="text-center text-xs font-medium text-slate-600">{DEBATE_QUESTION}</p>
    <div class="mt-2.5 space-y-2">
      <div class="flex items-start gap-2">
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-base"
        >
          🎨
        </div>
        <p class="text-[11px] leading-snug text-slate-500">
          <span class="font-semibold text-amber-700">Creative</span> — {DEBATE_SIDES
            .creative.why}
        </p>
      </div>
      <div class="flex items-start gap-2">
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-100 text-base"
        >
          ⚖️
        </div>
        <p class="text-[11px] leading-snug text-slate-500">
          <span class="font-semibold text-accent-700">Logical</span> — {DEBATE_SIDES
            .logical.why}
        </p>
      </div>
    </div>
  </div>

  <div class="mt-3 space-y-2">
    {#each DEBATE_ROUNDS as r, i}
      {@const pick = debateResult.picks[i]}
      <div class="overflow-hidden rounded-xl border border-slate-200">
        <div
          class="flex items-center justify-between bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400"
        >
          <span>Round {r.n}</span>
          <span
            class="rounded-full border border-slate-200 bg-white px-2 py-0.5 normal-case tracking-normal text-slate-600"
          >
            picked {pick}
          </span>
        </div>
        <div class="grid grid-cols-2 divide-x divide-slate-200 text-[11px]">
          <div class="p-2.5 {pick === 'Creative' ? 'bg-amber-50' : ''}">
            <div class="font-semibold text-amber-700">🎨 Creative</div>
            <p class="mt-1 leading-snug text-slate-500">{r.creative}</p>
          </div>
          <div class="p-2.5 {pick === 'Logical' ? 'bg-accent-50' : ''}">
            <div class="font-semibold text-accent-700">⚖️ Logical</div>
            <p class="mt-1 leading-snug text-slate-500">{r.logical}</p>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-3 flex items-center justify-center gap-2 text-xs">
    <span class="text-slate-400">Overall winner</span>
    <span class="rounded-full bg-accent-100 px-2.5 py-0.5 font-bold text-accent-700">
      {debateResult.winner}
    </span>
  </div>

  <div class="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div class="text-xs font-bold uppercase tracking-wide text-slate-500">
      AI Insights
    </div>
    <p class="mt-1 text-sm text-slate-600">
      {debateSummaryText(student, logicalSideName)}
    </p>
  </div>
</section>

<!-- Creative Story Builder -->
<section class="mt-6">
  <h3 class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
    Creative Story Builder
  </h3>
  <p class="mt-3 text-sm text-slate-500">{STORY_INTRO}</p>
  <div class="mt-3 space-y-2">
    {#each STORY_JUNCTIONS as j}
      {@const c = storyChoices.find((x) => x.n === j.n)}
      <div class="overflow-hidden rounded-xl border border-slate-200">
        <div
          class="bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400"
        >
          {j.topic}
        </div>
        <div class="grid grid-cols-2 divide-x divide-slate-200">
          <div class="p-2.5 {c?.accurate ? 'bg-emerald-50' : ''}">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="text-base">⚙️</span>
              <span class="text-xs font-semibold text-emerald-700">{j.accurate}</span>
              {#if c?.accurate}
                <span
                  class="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700"
                  >CHOSEN</span
                >
              {/if}
            </div>
            <p class="mt-1 text-[11px] leading-snug text-slate-500">{j.accurateWhy}</p>
          </div>
          <div class="p-2.5 {c?.accurate === false ? 'bg-amber-50' : ''}">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="text-base">🎪</span>
              <span class="text-xs font-semibold text-amber-700">{j.practical}</span>
              {#if c?.accurate === false}
                <span
                  class="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700"
                  >CHOSEN</span
                >
              {/if}
            </div>
            <p class="mt-1 text-[11px] leading-snug text-slate-500">
              {j.practicalWhy}
            </p>
          </div>
        </div>
      </div>
    {/each}
  </div>
  <div class="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div class="text-xs font-bold uppercase tracking-wide text-slate-500">
      AI Insights
    </div>
    <p class="mt-1 text-sm text-slate-600">{storyInterpretation(student)}</p>
  </div>
</section>
