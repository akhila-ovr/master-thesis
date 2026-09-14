<!-- StudentProfile.svelte: one student's full detail, laid out by activity:
     quantitative exercises, reflection, debate, and the creative story.
     Each section closes with an AI Insights note on how this student did.
     Rendered inside the header search detail page; navigation controls
     (back / close) are left to the parent. -->
<script lang="ts">
  import { avatarFor, type Student } from "./studentHelpers";
  import {
    DEBATE_QUESTION,
    DEBATE_SIDES,
    QUESTION_GUIDE,
    REFLECTION_PROMPT,
    STORY_INTRO,
    debatePicks,
    debateSummaryText,
    quantSummaryText,
    quizPartsFor,
    quizRetriesFor,
    reflectionAnswerOf,
    reflectionSummaryText,
    storyInterpretation,
    storyPathFor,
  } from "./expedition";

  export let student: Student;
  export let debate: any = {};

  $: avatar = avatarFor(student?.name ?? "");
  $: logicalSideName = debate?.right?.name;
  $: debateResult = debatePicks(student, logicalSideName);
  $: storyPath = storyPathFor(student);
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
  </div>
</div>

<!-- Exercises -->
<section class="mt-6">
  <h3 class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
    Exercises
  </h3>
  <ul class="mt-3 space-y-2">
    {#each QUESTION_GUIDE as q}
      {@const p = quizPartsFor(student, q.typeLabel)}
      {@const retries = quizRetriesFor(student, q.typeLabel)}
      <li class="flex items-center gap-2 text-sm text-slate-600">
        <span class="w-28 shrink-0 font-medium text-slate-700">{q.label}</span>
        {#if !p}
          <span class="text-slate-300">–</span>
        {:else}
          <span
            class="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold {p.correct ===
            p.total
              ? 'bg-emerald-100 text-emerald-700'
              : p.correct === 0
                ? 'bg-rose-100 text-rose-600'
                : 'bg-amber-100 text-amber-700'}"
            >{p.correct}/{p.total}</span
          >
          {#if retries}
            <span class="text-[10px] text-slate-400">
              after {retries} {retries === 1 ? "retry" : "retries"}
            </span>
          {/if}
        {/if}
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

  <div class="mt-3 space-y-2">
    {#each storyPath as step}
      {@const opt = step.options.find((o) => o.key === step.chosenKey)}
      {#if opt}
        <div class="rounded-lg border border-slate-200 bg-emerald-50 p-2">
          <span class="text-sm font-semibold text-slate-800">{opt.label}</span>
        </div>
      {/if}
    {/each}
  </div>

  <div class="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div class="text-xs font-bold uppercase tracking-wide text-slate-500">
      AI Insights
    </div>
    <p class="mt-1 text-sm text-slate-600">{storyInterpretation(student)}</p>
  </div>
</section>
