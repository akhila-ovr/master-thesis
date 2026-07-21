<!-- QuestionBreakdown.svelte: shows question-type bars and a per-type modal with
		 per-question breakdowns. Component manages its own modal state. -->
<script lang="ts">
  export let questionTypes: Array<any> = [];
  export let creative: Array<any> = [];
  export let debate: any = {};
  export let themeColors: any = {};
  export let students: Array<any> = [];

  const creativeOptionLabels = [
    "Pick it up and put it in a bin",
    "Tell a friend to help you pick it up",
    "Leave it because it's not your trash",
  ];

  function studentsForChoice(label: string) {
    return students.filter((s) => s.creativeChoice === label);
  }

  let creativeModalOpen = false;
  function openCreativeModal() {
    creativeModalOpen = true;
  }
  function closeCreativeModal() {
    creativeModalOpen = false;
  }

  let modalOpen = false;
  let modalTitle = "";
  let modalQuestions: Array<{
    label: string;
    parts: number[];
    question?: string;
    options?: string[];
    answer?: string;
  }> = [];
  let debateModalOpen = false;

  function openModal(i: number) {
    modalTitle = questionTypes[i]?.label ?? "";
    modalQuestions = (questionTypes[i]?.questions ?? []).map((q: any) => ({
      label: q.label ?? "",
      parts: q.parts ?? [0, 0, 0],
      question: q.question ?? "",
      options: q.options ?? [],
      answer: q.answer ?? "",
    }));
    modalOpen = true;
  }
  function closeModal() {
    modalOpen = false;
    modalQuestions = [];
  }

  function openDebateModal() {
    debateModalOpen = true;
  }

  function closeDebateModal() {
    debateModalOpen = false;
  }

  function pieGradient(parts: number[], colors?: string[]) {
    const a = parts?.[0] ?? 0;
    const b = parts?.[1] ?? 0;
    const c = parts?.[2] ?? 0;
    const deg1 = a * 3.6;
    const deg2 = (a + b) * 3.6;
    const defaults = (themeColors && themeColors.pastelPalette) || [
      "#a855f7",
      "#f59e0b",
      "#38bdf8",
    ];
    const palette = colors && colors.length >= 3 ? colors : defaults;
    return `conic-gradient(${palette[0]} 0deg ${deg1}deg, ${palette[1]} ${deg1}deg ${deg2}deg, ${palette[2]} ${deg2}deg 360deg)`;
  }
</script>

<div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
  <h2 class="font-display text-lg font-bold text-slate-900">Question type breakdown</h2>
  <div class="mt-2 text-xs text-slate-600">
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <span
          class="w-3 h-3 rounded-full"
          style="background:{themeColors?.correct ?? '#10b981'}"
        ></span>
        <span>Right</span>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="w-3 h-3 rounded-full"
          style="background:{themeColors?.retry ?? '#f59e0b'}"
        ></span>
        <span>Right after retry</span>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="w-3 h-3 rounded-full"
          style="background:{themeColors?.incorrect ?? '#f43f5e'}"
        ></span>
        <span>Wrong</span>
      </div>
    </div>
  </div>
  <div class="mt-4 space-y-4">
    {#each questionTypes as q, idx}
      <div>
        <div
          class="flex items-center justify-between text-xs text-slate-500 mb-2"
        >
          <div>{q.label}</div>
          <button on:click={() => openModal(idx)} class="text-xs font-bold text-accent-600 hover:text-accent-700"
            >Show details</button
          >
        </div>
        <div class="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            style="width:{q.parts?.[0] ??
              0}%; background: {themeColors?.correct ?? '#10b981'}"
            class="h-full float-left"
          ></div>
          <div
            style="width:{q.parts?.[1] ??
              0}%; background: {themeColors?.retry ?? '#f59e0b'}"
            class="h-full float-left"
          ></div>
          <div
            style="width:{q.parts?.[2] ??
              0}%; background: {themeColors?.incorrect ?? '#f43f5e'}"
            class="h-full float-left"
          ></div>
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-6">
    <div class="rounded-2xl border border-accent-100 p-4 bg-accent-50/40">
      <div
        class="flex items-center justify-between text-xs text-slate-600 mb-2 gap-3"
      >
        <div><span class="font-bold text-slate-900">Debate</span>: {debate?.title ?? ""}</div>
        <button
          on:click={openDebateModal}
          class="text-xs font-bold text-accent-600 hover:text-accent-700 shrink-0"
        >
          Show details
        </button>
      </div>

      <div class="h-5 w-full rounded-full overflow-hidden flex text-[11px] font-bold text-white">
        <div
          class="h-full flex items-center justify-center"
          style="width:{debate?.left?.pct ??
            0}%; background: {themeColors.categoryA ?? '#a855f7'}"
        >{debate?.left?.name ?? ""} {debate?.left?.pct ?? 0}%</div>
        <div
          class="h-full flex items-center justify-center"
          style="width:{debate?.right?.pct ??
            0}%; background: {themeColors.categoryB ?? '#10b981'}"
        >{debate?.right?.name ?? ""} {debate?.right?.pct ?? 0}%</div>
      </div>
    </div>
  </div>

  <div class="mt-4">
    <div class="rounded-2xl border border-accent-100 p-4 bg-accent-50/40">
    <div class="flex items-center justify-between gap-3 mb-3">
      <h3 class="text-sm font-bold text-slate-900">
        Creative story: which path did students take?
      </h3>
      <button
        on:click={openCreativeModal}
        class="text-xs font-bold text-accent-600 hover:text-accent-700 shrink-0"
      >
        Show details
      </button>
    </div>
    <div class="">
      {#each creative as c}
        {#if c.parts}
          <div class="flex items-center gap-4">
            <div
              class="w-20 h-20 rounded-full shadow-sm ring-1 ring-slate-200"
              style="background: {pieGradient(c.parts, c.colors)}"
              aria-hidden="true"
            ></div>
            <div class="flex-1">
              <div class="text-sm font-medium text-slate-800">{c.label}</div>
              <div class="mt-2 text-xs text-slate-600">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-block w-3 h-3 rounded-full"
                      style="background:{c.colors?.[0] ?? '#a855f7'}"
                    ></span>
                    <span>Pick it up and put it in a bin</span>
                  </div>
                  <div class="text-xs font-medium">{c.parts[0]}%</div>
                </div>
                <div class="flex items-center justify-between mt-1">
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-block w-3 h-3 rounded-full"
                      style="background:{c.colors?.[1] ?? '#f59e0b'}"
                    ></span>
                    <span>Tell a friend to help you pick it up</span>
                  </div>
                  <div class="text-xs font-medium">{c.parts[1]}%</div>
                </div>
                <div class="flex items-center justify-between mt-1">
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-block w-3 h-3 rounded-full"
                      style="background:{c.colors?.[2] ?? '#38bdf8'}"
                    ></span>
                    <span>Leave it because it’s not your trash</span>
                  </div>
                  <div class="text-xs font-medium">{c.parts[2]}%</div>
                </div>
              </div>
            </div>
          </div>
        {/if}
      {/each}
    </div>
    </div>
  </div>

  {#if modalOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div
        class="absolute inset-0 bg-black/40"
        role="button"
        tabindex="0"
        aria-label="Close modal"
        on:click={closeModal}
        on:keydown={(e) => {
          if (e.key === "Enter" || e.key === " ") closeModal();
        }}
      ></div>
      <div
        class="relative z-10 w-[90%] max-w-2xl bg-white rounded-3xl shadow-xl overflow-auto max-h-[80vh]"
      >
        <div
          class="p-4 border-b border-slate-200 flex items-center justify-between"
        >
          <div class="font-display text-base font-bold text-slate-900">{modalTitle}</div>
          <button
            on:click={closeModal}
            class="text-xs font-bold px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 shrink-0">Close</button
          >
        </div>
        <div class="p-4 space-y-3">
          {#each modalQuestions as mq}
            <div class="rounded-2xl border border-accent-100 bg-accent-50/40 p-4">
              <div
                class="flex items-start justify-between gap-3 text-xs text-slate-500 mb-1"
              >
                <span class="font-display shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent-100 text-accent-700 text-xs font-bold">{mq.label}</span>
                <div class="text-xs font-medium text-slate-600 shrink-0 pt-1.5">
                  {mq.parts[0]}% · {mq.parts[1]}% · {mq.parts[2]}%
                </div>
              </div>

              {#if mq.question}
                <div class="mt-2 text-sm font-semibold text-slate-900">{mq.question}</div>
              {/if}

              {#if mq.options && mq.options.length > 0}
                <ul class="mt-2 flex flex-wrap gap-2">
                  {#each mq.options as opt}
                    <li
                      class="text-xs px-2.5 py-1 rounded-full border bg-white {mq.answer === opt
                        ? 'border-emerald-300 text-emerald-700 font-semibold'
                        : 'border-slate-200 text-slate-600'}"
                    >
                      {#if mq.answer === opt}✓ {/if}{opt}
                    </li>
                  {/each}
                </ul>
              {/if}

              <div class="mt-3 h-3 w-full rounded-full bg-white overflow-hidden">
                <div
                  style="width:{mq
                    .parts[0]}%; background: {themeColors?.correct ??
                    '#10b981'}"
                  class="h-full float-left"
                ></div>
                <div
                  style="width:{mq
                    .parts[1]}%; background: {themeColors?.retry ??
                    '#f59e0b'}"
                  class="h-full float-left"
                ></div>
                <div
                  style="width:{mq
                    .parts[2]}%; background: {themeColors?.incorrect ?? '#f43f5e'}"
                  class="h-full float-left"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  {#if debateModalOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div
        class="absolute inset-0 bg-black/40"
        role="button"
        tabindex="0"
        aria-label="Close debate modal"
        on:click={closeDebateModal}
        on:keydown={(e) => {
          if (e.key === "Enter" || e.key === " ") closeDebateModal();
        }}
      ></div>
      <div
        class="relative z-10 w-[90%] max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        <div
          class="p-4 border-b border-slate-200 flex items-center justify-between"
        >
          <div>
            <div class="text-xs uppercase tracking-[0.18em] text-slate-400">
              Debate stance
            </div>
            <div class="font-display text-base font-bold text-slate-900">
              Vio / Mint comparison
            </div>
          </div>
          <button
            on:click={closeDebateModal}
            class="text-xs font-bold px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 shrink-0"
          >
            Close
          </button>
        </div>

        <div class="p-4 space-y-4">
          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded-2xl border p-3" style="border-color:#E9D5FF; background:#FAF5FF;">
              <div
                class="text-xs font-bold uppercase tracking-[0.18em] mb-2"
                style="color:#A855F7;"
              >
                Vio stance
              </div>
              <div class="text-sm leading-6 text-slate-700">
                {debate?.left?.stance}
              </div>
              <div class="mt-3 text-xs text-slate-500 mb-2">Students</div>
              <div class="flex flex-wrap gap-2">
                {#each debate?.left?.students ?? [] as student}
                  <div
                    class="rounded-full border border-accent-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm"
                  >
                    {student}
                  </div>
                {/each}
              </div>
            </div>

            <div class="rounded-2xl border p-3" style="border-color:#A7F3D0; background:#F0FDF9;">
              <div
                class="text-xs font-bold uppercase tracking-[0.18em] mb-2"
                style="color:#10B981;"
              >
                Mint stance
              </div>
              <div class="text-sm leading-6 text-slate-700">
                {debate?.right?.stance}
              </div>
              <div class="mt-3 text-xs text-slate-500 mb-2">Students</div>
              <div class="flex flex-wrap gap-2">
                {#each debate?.right?.students ?? [] as student}
                  <div
                    class="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm"
                  >
                    {student}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if creativeModalOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div
        class="absolute inset-0 bg-black/40"
        role="button"
        tabindex="0"
        aria-label="Close creative story modal"
        on:click={closeCreativeModal}
        on:keydown={(e) => {
          if (e.key === "Enter" || e.key === " ") closeCreativeModal();
        }}
      ></div>
      <div
        class="relative z-10 w-[90%] max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        <div
          class="p-4 border-b border-slate-200 flex items-center justify-between"
        >
          <div>
            <div class="text-xs uppercase tracking-[0.18em] text-slate-400">
              Creative story
            </div>
            <div class="font-display text-base font-bold text-slate-900">
              Which path did students take?
            </div>
          </div>
          <button
            on:click={closeCreativeModal}
            class="text-xs font-bold px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 shrink-0"
          >
            Close
          </button>
        </div>

        <div class="p-4">
          <div class="grid gap-3 md:grid-cols-3">
            <div class="rounded-2xl border p-3" style="border-color:#E9D5FF; background:#FAF5FF;">
              <div
                class="text-xs font-bold uppercase tracking-[0.18em] mb-2"
                style="color:#A855F7;"
              >
                Pick it up and put it in a bin
              </div>
              <div class="flex flex-wrap gap-2">
                {#each studentsForChoice(creativeOptionLabels[0]) as student}
                  <div
                    class="rounded-full border border-accent-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm"
                  >
                    {student.name}
                  </div>
                {/each}
                {#if studentsForChoice(creativeOptionLabels[0]).length === 0}
                  <div class="text-xs text-slate-400">No students</div>
                {/if}
              </div>
            </div>

            <div class="rounded-2xl border p-3" style="border-color:#FDE68A; background:#FFFBEB;">
              <div
                class="text-xs font-bold uppercase tracking-[0.18em] mb-2"
                style="color:#D97706;"
              >
                Tell a friend to help you pick it up
              </div>
              <div class="flex flex-wrap gap-2">
                {#each studentsForChoice(creativeOptionLabels[1]) as student}
                  <div
                    class="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm"
                  >
                    {student.name}
                  </div>
                {/each}
                {#if studentsForChoice(creativeOptionLabels[1]).length === 0}
                  <div class="text-xs text-slate-400">No students</div>
                {/if}
              </div>
            </div>

            <div class="rounded-2xl border p-3" style="border-color:#BAE6FD; background:#F0F9FF;">
              <div
                class="text-xs font-bold uppercase tracking-[0.18em] mb-2"
                style="color:#0284C7;"
              >
                Leave it because it's not your trash
              </div>
              <div class="flex flex-wrap gap-2">
                {#each studentsForChoice(creativeOptionLabels[2]) as student}
                  <div
                    class="rounded-full border border-sky-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm"
                  >
                    {student.name}
                  </div>
                {/each}
                {#if studentsForChoice(creativeOptionLabels[2]).length === 0}
                  <div class="text-xs text-slate-400">No students</div>
                {/if}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
