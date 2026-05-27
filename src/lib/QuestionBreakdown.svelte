<!-- QuestionBreakdown.svelte: shows question-type bars and a per-type modal with
		 per-question breakdowns. Component manages its own modal state. -->
<script lang="ts">
  export let questionTypes: Array<any> = [];
  export let creative: Array<any> = [];
  export let debate: any = {};
  export let themeColors: any = {};

  let modalOpen = false;
  let modalTitle = "";
  let modalQuestions: Array<{ label: string; parts: number[] }> = [];
  let debateModalOpen = false;

  function openModal(i: number) {
    modalTitle = questionTypes[i]?.label ?? "";
    modalQuestions = (questionTypes[i]?.questions ?? []).map((q: any) => ({
      label: q.label ?? "",
      parts: q.parts ?? [0, 0, 0],
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
      "#A7E0FF",
      "#FFD8B5",
      "#CFF7E6",
    ];
    const palette = colors && colors.length >= 3 ? colors : defaults;
    return `conic-gradient(${palette[0]} 0deg ${deg1}deg, ${palette[1]} ${deg1}deg ${deg2}deg, ${palette[2]} ${deg2}deg 360deg)`;
  }
</script>

<div class="rounded-lg border border-slate-200 bg-white p-4">
  <h2 class="text-sm font-semibold text-slate-900">Question type breakdown</h2>
  <div class="mt-2 text-xs text-slate-600">
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <span
          class="w-3 h-3 rounded-full"
          style="background:{themeColors?.primary ?? '#60A5FA'}"
        ></span>
        <span>Right</span>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="w-3 h-3 rounded-full"
          style="background:{themeColors?.accent ?? '#FDBA74'}"
        ></span>
        <span>Right after retry</span>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="w-3 h-3 rounded-full"
          style="background:{themeColors?.pink ?? '#FCA5A5'}"
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
          <button on:click={() => openModal(idx)} class="text-xs text-slate-600"
            >Show details</button
          >
        </div>
        {#if q.label && q.label.toLowerCase().includes("true")}
          <div class="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              style="width:{q.parts?.[0] ??
                0}%; background: {themeColors?.primary ?? '#60A5FA'}"
              class="h-full float-left"
            ></div>
            <div
              style="width:{(q.parts?.[1] ?? 0) +
                (q.parts?.[2] ?? 0)}%; background: {themeColors?.pink ??
                '#FCA5A5'}"
              class="h-full float-left"
            ></div>
          </div>
        {:else}
          <div class="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              style="width:{q.parts?.[0] ??
                0}%; background: {themeColors?.primary ?? '#60A5FA'}"
              class="h-full float-left"
            ></div>
            <div
              style="width:{q.parts?.[1] ??
                0}%; background: {themeColors?.accent ?? '#FDBA74'}"
              class="h-full float-left"
            ></div>
            <div
              style="width:{q.parts?.[2] ??
                0}%; background: {themeColors?.pink ?? '#FCA5A5'}"
              class="h-full float-left"
            ></div>
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="mt-4 rounded border border-slate-100 p-3 bg-white">
    <div class="flex items-center justify-between text-xs text-slate-500 mb-2">
      <div>{debate?.title ?? ""}</div>
      <button
        on:click={openDebateModal}
        class="text-xs text-slate-600 hover:text-slate-900 hover:underline hover:underline-offset-2"
      >
        Show details
      </button>
    </div>

    <div class="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        class="h-full float-left"
        style="width:{debate?.left?.pct ??
          0}%; background: {themeColors.primary ?? '#60A5FA'}"
      ></div>
      <div
        class="h-full float-left"
        style="width:{debate?.right?.pct ??
          0}%; background: {themeColors.mint ?? '#86EFAC'}"
      ></div>
    </div>

    <div class="mt-2 flex justify-between text-xs text-slate-500">
      <div>{debate?.left?.name ?? ""} {debate?.left?.pct ?? 0}%</div>
      <div>{debate?.right?.name ?? ""} {debate?.right?.pct ?? 0}%</div>
    </div>
  </div>

  <div class="mt-4">
    <h3 class="text-sm font-semibold text-slate-900 mb-3">
      Creative story: which path did students take?
    </h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {#each creative as c}
        {#if c.parts}
          <div class="flex items-center gap-3">
            <div
              class="w-20 h-20 rounded-full shadow-sm"
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
                      style="background:{c.colors?.[0] ?? '#c7b3ff'}"
                    ></span>
                    <span>Rescue the sea turtle</span>
                  </div>
                  <div class="text-xs">{c.parts[0]}%</div>
                </div>
                <div class="flex items-center justify-between mt-1">
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-block w-3 h-3 rounded-full"
                      style="background:{c.colors?.[1] ?? '#d6bbff'}"
                    ></span>
                    <span>Report the pollution</span>
                  </div>
                  <div class="text-xs">{c.parts[1]}%</div>
                </div>
                <div class="flex items-center justify-between mt-1">
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-block w-3 h-3 rounded-full"
                      style="background:{c.colors?.[2] ?? '#efe6ff'}"
                    ></span>
                    <span>Organise a clean-up</span>
                  </div>
                  <div class="text-xs">{c.parts[2]}%</div>
                </div>
              </div>
            </div>
          </div>
        {/if}
      {/each}
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
        class="relative z-10 w-[90%] max-w-2xl bg-white rounded-lg shadow-lg overflow-auto max-h-[80vh]"
      >
        <div
          class="p-4 border-b border-slate-100 flex items-center justify-between"
        >
          <div class="text-sm font-semibold">{modalTitle}</div>
          <button
            on:click={closeModal}
            class="text-xs px-2 py-1 bg-slate-100 rounded">Close</button
          >
        </div>
        <div class="p-4 space-y-3">
          {#each modalQuestions as mq}
            <div class="rounded border border-slate-100 bg-slate-50 p-3">
              <div
                class="flex items-center justify-between text-xs text-slate-700 mb-2"
              >
                <div>{mq.label}</div>
                <div class="text-xs text-slate-600">
                  {mq.parts[0]}% · {mq.parts[1]}% · {mq.parts[2]}%
                </div>
              </div>
              {#if modalTitle && modalTitle.toLowerCase().includes("true")}
                <div class="h-3 w-full rounded-full bg-white overflow-hidden">
                  <div
                    style="width:{mq
                      .parts[0]}%; background: {themeColors?.primary ??
                      '#60A5FA'}"
                    class="h-full float-left"
                  ></div>
                  <div
                    style="width:{(mq.parts[1] ?? 0) +
                      (mq.parts[2] ?? 0)}%; background: {themeColors?.pink ??
                      '#FCA5A5'}"
                    class="h-full float-left"
                  ></div>
                </div>
              {:else}
                <div class="h-3 w-full rounded-full bg-white overflow-hidden">
                  <div
                    style="width:{mq
                      .parts[0]}%; background: {themeColors?.primary ??
                      '#60A5FA'}"
                    class="h-full float-left"
                  ></div>
                  <div
                    style="width:{mq
                      .parts[1]}%; background: {themeColors?.accent ??
                      '#FDBA74'}"
                    class="h-full float-left"
                  ></div>
                  <div
                    style="width:{mq
                      .parts[2]}%; background: {themeColors?.pink ?? '#FCA5A5'}"
                    class="h-full float-left"
                  ></div>
                </div>
              {/if}
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
        class="relative z-10 w-[90%] max-w-xl bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div
          class="p-4 border-b border-slate-100 flex items-center justify-between"
        >
          <div>
            <div class="text-xs uppercase tracking-[0.18em] text-slate-400">
              Debate stance
            </div>
            <div class="text-sm font-semibold text-slate-900">
              Vio / Mint comparison
            </div>
          </div>
          <button
            on:click={closeDebateModal}
            class="text-xs px-2 py-1 bg-slate-100 rounded"
          >
            Close
          </button>
        </div>

        <div class="p-4 space-y-4">
          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded border border-slate-100 bg-slate-50 p-3">
              <div
                class="text-xs font-medium uppercase tracking-[0.18em] text-slate-400 mb-2"
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
                    class="rounded border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm"
                  >
                    {student}
                  </div>
                {/each}
              </div>
            </div>

            <div class="rounded border border-slate-100 bg-slate-50 p-3">
              <div
                class="text-xs font-medium uppercase tracking-[0.18em] text-slate-400 mb-2"
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
                    class="rounded border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm"
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
</div>
