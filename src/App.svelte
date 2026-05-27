<script lang="ts">
  const stats = [
    { label: "Completed", value: "19/22" },
    { label: "Avg. score", value: "64%", note: "below target", accent: true },
    { label: "Errors confirmed", value: "7", note: "by reflection" },
    {
      label: "Avg. ref depth",
      value: "2.4/5",
      note: "surface-level",
      accent: true,
    },
  ];

  const questionTypes = [
    {
      label: "True / False (3 questions)",
      parts: [55, 25, 20],
      note: 'Q3 worst: "animals can adapt to habitat loss" — 31% correct first try',
    },
    { label: "Multiple choice (4 questions)", parts: [70, 20, 10] },
    { label: "Fill in blanks (2 questions)", parts: [58, 28, 14] },
    { label: "Drag & drop (2 questions)", parts: [72, 20, 8] },
    { label: "Sorting (1 question)", parts: [66, 24, 10] },
  ];

  const debate = {
    title:
      'Debate: "Humans should stop all development near wildlife habitats"',
    left: { name: "Vio", pct: 58 },
    right: { name: "Mint", pct: 42 },
  };

  const creative = [
    { label: "Rescue the sea turtle", pct: 45 },
    { label: "Report the pollution", pct: 32 },
    { label: "Organise a clean-up", pct: 23 },
  ];

  const reflectionSummary =
    'Most students identify littering and plastic as harmful but 11 of 16 reflections describe effects without explaining the mechanism — they say plastic is "bad for animals" without saying why. The missing link is the ingestion pathway.';

  const reflections = [
    "Mentions ingestion pathway but no mechanism",
    "Notes littering harms habitats",
    "Strong personal connection",
    "Surface-level comment",
  ];

  let showAll = false;
  function toggleAll() {
    showAll = !showAll;
  }
</script>

<main
  class="min-h-screen bg-[#f6f3ee] text-slate-800 p-6"
  style="font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;"
>
  <div class="mx-auto max-w-6xl">
    <header class="mb-4 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">
          Nature's Wonderful Animals — <span
            class="text-sm font-normal text-slate-600">expedition review</span
          >
        </h1>
      </div>
      <div class="text-sm text-slate-600 flex items-center gap-3">
        <span>Completed yesterday · 22 students</span>
        <span class="rounded-full bg-rose-100 px-3 py-1 text-rose-700 text-xs"
          >Planning mode</span
        >
      </div>
    </header>

    <div class="grid gap-3 md:grid-cols-4 mb-4">
      {#each stats as s}
        <div class="rounded-lg border border-slate-200 bg-white p-3">
          <div class="text-xs text-slate-500">{s.label}</div>
          <div class="mt-2 text-2xl font-semibold text-slate-900">
            {s.value}
          </div>
          {#if s.note}
            <div
              class="mt-1 text-xs text-slate-500"
              class:text-rose-600={s.accent}
            >
              {s.note}
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <section class="grid gap-4 lg:grid-cols-2">
      <div class="space-y-4">
        <div class="rounded-lg border border-slate-200 bg-white p-4">
          <h2 class="text-sm font-semibold text-slate-900">
            Question type breakdown
          </h2>
          <div class="mt-4 space-y-4">
            {#each questionTypes as q}
              <div>
                <div
                  class="flex items-center justify-between text-xs text-slate-500 mb-2"
                >
                  <div>{q.label}</div>
                </div>
                <div
                  class="h-3 w-full rounded-full bg-slate-100 overflow-hidden"
                >
                  <div
                    style="width:{q.parts[0]}%"
                    class="h-full bg-sky-300 float-left"
                  ></div>
                  <div
                    style="width:{q.parts[1]}%"
                    class="h-full bg-amber-200 float-left"
                  ></div>
                  <div
                    style="width:{q.parts[2]}%"
                    class="h-full bg-rose-200 float-left"
                  ></div>
                </div>
                {#if q.note}
                  <div class="mt-2 text-xs text-slate-500">{q.note}</div>
                {/if}
              </div>
            {/each}
          </div>

          <div class="mt-4 rounded border border-slate-100 p-3 bg-white">
            <div class="text-sm text-slate-700 mb-2">{debate.title}</div>
            <div class="flex items-center gap-3">
              <div class="flex-1 rounded-full bg-slate-100 p-1">
                <div
                  class="h-6 rounded-full bg-sky-300 inline-block"
                  style="width:{debate.left.pct}%"
                ></div>
                <div
                  class="h-6 rounded-full bg-emerald-300 inline-block float-right"
                  style="width:{debate.right.pct}%"
                ></div>
              </div>
            </div>
            <div class="mt-2 flex justify-between text-xs text-slate-500">
              <div class="px-2 py-1 rounded text-sky-700 bg-sky-100/60">
                {debate.left.name}
                {debate.left.pct}%
              </div>
              <div class="px-2 py-1 rounded text-emerald-700 bg-emerald-100/60">
                {debate.right.name}
                {debate.right.pct}%
              </div>
            </div>
          </div>

          <div class="mt-4">
            <h3 class="text-sm font-semibold text-slate-900 mb-2">
              Creative story: which path did students take?
            </h3>
            <div class="space-y-3">
              {#each creative as c}
                <div>
                  <div
                    class="flex items-center justify-between text-sm text-slate-700"
                  >
                    <div class="w-2/3">{c.label}</div>
                    <div class="w-1/3 text-right text-slate-500">{c.pct}%</div>
                  </div>
                  <div class="h-2 w-full rounded-full bg-slate-100 mt-1">
                    <div
                      class="h-2 rounded-full bg-violet-300"
                      style="width:{c.pct}%"
                    ></div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="rounded-lg border border-slate-200 bg-white p-4">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold">Reflection theme summary</h2>
            <a href="#" class="text-xs text-slate-400 underline"
              >how generated?</a
            >
          </div>
          <div
            class="mt-3 rounded p-3 bg-white text-sm text-slate-700 border border-slate-100"
          >
            {reflectionSummary}
          </div>
          <div class="mt-3 flex gap-2">
            <button
              on:click={toggleAll}
              class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 bg-white"
              >{showAll
                ? "Hide"
                : `See all ${reflections.length} reflections`}</button
            >
            <button
              class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 bg-white"
              >Override summary</button
            >
          </div>
          {#if showAll}
            <ul class="mt-3 text-sm text-slate-300 space-y-1">
              {#each reflections as r}
                <li>• {r}</li>
              {/each}
            </ul>
          {/if}
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-4">
          <h2 class="text-sm font-semibold">
            Student groups — quant + reflection
          </h2>
          <div class="mt-3 space-y-3">
            <div class="rounded p-3 bg-slate-50 border border-slate-100">
              <div class="flex items-start justify-between">
                <div>
                  <div
                    class="text-xs text-rose-700 inline-block bg-rose-100 px-2 py-1 rounded"
                  >
                    Group A
                  </div>
                  <div class="mt-2 text-sm text-slate-700">
                    Low score + error in reflection — Scores below 55%. Need
                    re-teaching.
                  </div>
                </div>
                <div class="text-sm text-slate-600">5 students</div>
              </div>
            </div>

            <div class="rounded p-3 bg-slate-50 border border-slate-100">
              <div class="flex items-start justify-between">
                <div>
                  <div
                    class="text-xs text-indigo-700 inline-block bg-indigo-100 px-2 py-1 rounded"
                  >
                    Group B
                  </div>
                  <div class="mt-2 text-sm text-slate-700">
                    High score, surface reflection — 80%+. Needs metacognitive
                    prompting.
                  </div>
                </div>
                <div class="text-sm text-slate-600">3 students</div>
              </div>
            </div>

            <div class="rounded p-3 bg-slate-50 border border-slate-100">
              <div class="flex items-start justify-between">
                <div>
                  <div
                    class="text-xs text-emerald-700 inline-block bg-emerald-100 px-2 py-1 rounded"
                  >
                    Group C
                  </div>
                  <div class="mt-2 text-sm text-slate-700">
                    Strong score + rich reflection — Scores 80%+. Reflections
                    show specific mechanisms and personal connections.
                  </div>
                </div>
                <div class="text-sm text-slate-600">4 students</div>
              </div>
            </div>

            <div class="rounded p-3 bg-slate-50 border border-slate-100">
              <div class="flex items-start justify-between">
                <div>
                  <div
                    class="text-xs text-yellow-700 inline-block bg-yellow-100 px-2 py-1 rounded"
                  >
                    Group D
                  </div>
                  <div class="mt-2 text-sm text-slate-700">
                    Mixed performance — Some correct answers but shallow
                    reflections. Recommend targeted prompts.
                  </div>
                </div>
                <div class="text-sm text-slate-600">6 students</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</main>
