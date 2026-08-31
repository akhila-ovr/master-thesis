<!-- StudentProfile.svelte: one student's full detail, laid out by activity:
     quantitative exercises, reflection, debate (round by round), and the
     creative story. Each section closes with an AI Insights note on how this
     student did. Rendered inside the header search detail page; navigation
     controls (back / close) are left to the parent. -->
<script lang="ts">
  import { avatarFor, type Student } from "./studentHelpers";
  import {
    DEBATE_QUESTION,
    DEBATE_ROUNDS,
    DEBATE_SIDES,
    QUESTION_GUIDE,
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
  <h3 class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
    Quantitative exercises
  </h3>
  <ul class="mt-3 space-y-2">
    {#each QUESTION_GUIDE as q}
      {@const ok = passedTypeOf(student, q.typeLabel)}
      <li class="flex items-start gap-2 text-sm text-slate-600">
        {#if ok === null}
          <span class="mt-0.5 text-slate-300 shrink-0">–</span>
        {:else if ok}
          <span
            class="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs shrink-0"
            >✓</span
          >
        {:else}
          <span
            class="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-500 text-xs shrink-0"
            >✕</span
          >
        {/if}
        <span>{q.text}</span>
      </li>
    {/each}
  </ul>
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
  <p class="mt-3 text-sm text-slate-500">{REFLECTION_PROMPT}</p>
  {#if reflectionAnswer}
    <p class="mt-2 text-sm italic text-slate-700">"{reflectionAnswer}"</p>
  {:else}
    <p class="mt-2 text-sm text-slate-400">No reflection recorded.</p>
  {/if}
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
  <p class="mt-3 text-sm font-medium text-slate-700">{DEBATE_QUESTION}</p>
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
    A winner is picked each round; the majority across three rounds is the
    ultimate winner.
  </p>

  <div class="mt-3 space-y-3">
    {#each DEBATE_ROUNDS as r, i}
      {@const pick = debateResult.picks[i]}
      <div class="rounded-xl border border-slate-200 p-3">
        <div class="text-xs font-bold uppercase tracking-wide text-slate-500">
          Round {r.n}
        </div>
        <p class="mt-1.5 text-sm text-slate-600">
          <span class="font-semibold text-slate-700">Creative:</span>
          "{r.creative}"
        </p>
        <p class="mt-1 text-sm text-slate-600">
          <span class="font-semibold text-slate-700">Logical:</span>
          "{r.logical}"
        </p>
        <div class="mt-2 flex items-center gap-1.5 text-xs">
          <span class="font-semibold text-slate-500">Winner:</span>
          <span
            class="rounded-full px-2 py-0.5 font-semibold {pick === 'Creative'
              ? 'bg-accent-100 text-accent-700'
              : 'border border-slate-200 text-slate-400'}"
            >Creative{pick === "Creative" ? " ✓" : ""}</span
          >
          <span
            class="rounded-full px-2 py-0.5 font-semibold {pick === 'Logical'
              ? 'bg-accent-100 text-accent-700'
              : 'border border-slate-200 text-slate-400'}"
            >Logical{pick === "Logical" ? " ✓" : ""}</span
          >
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-3 flex items-center gap-2 text-sm">
    <span class="font-semibold text-slate-500">Ultimate winner:</span>
    <span
      class="rounded-full bg-accent-100 px-2.5 py-0.5 text-sm font-bold text-accent-700"
      >{debateResult.winner}</span
    >
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

  <div class="mt-3 grid gap-3 sm:grid-cols-3">
    {#each STORY_JUNCTIONS as j}
      {@const chosen = storyChoices.find((c) => c.n === j.n)?.choice}
      <div class="rounded-xl border border-slate-200 p-3">
        <div class="text-xs font-bold uppercase tracking-wide text-slate-500">
          Junction {j.n}: {j.topic}
        </div>
        <div class="mt-2 space-y-2">
          <div
            class="rounded-lg p-2 {chosen === j.accurate
              ? 'bg-emerald-50 ring-1 ring-emerald-200'
              : 'opacity-60'}"
          >
            <div class="flex flex-wrap items-center gap-1.5">
              <span
                class="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700"
                >Accuracy</span
              >
              <span class="text-sm font-semibold text-slate-800">{j.accurate}</span>
              {#if chosen === j.accurate}
                <span class="text-xs font-bold text-emerald-600">✓ chose this</span>
              {/if}
            </div>
            <p class="mt-0.5 text-xs text-slate-500">{j.accurateWhy}</p>
          </div>
          <div
            class="rounded-lg p-2 {chosen === j.practical
              ? 'bg-amber-50 ring-1 ring-amber-200'
              : 'opacity-60'}"
          >
            <div class="flex flex-wrap items-center gap-1.5">
              <span
                class="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700"
                >Practicality</span
              >
              <span class="text-sm font-semibold text-slate-800">{j.practical}</span>
              {#if chosen === j.practical}
                <span class="text-xs font-bold text-amber-600">✓ chose this</span>
              {/if}
            </div>
            <p class="mt-0.5 text-xs text-slate-500">{j.practicalWhy}</p>
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
