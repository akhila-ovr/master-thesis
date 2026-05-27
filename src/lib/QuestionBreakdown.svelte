<!-- QuestionBreakdown.svelte: shows question-type bars and a per-type modal with
		 per-question breakdowns. Component manages its own modal state. -->
<script lang="ts">
  export let questionTypes: Array<any> = [];
  export let creative: Array<any> = [];
  export let debate: any = {};

  let modalOpen = false;
  let modalTitle = "";
  let modalQuestions: Array<{ label: string; parts: number[] }> = [];

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
</script>

<div class="rounded-lg border border-slate-200 bg-white p-4">
  <h2 class="text-sm font-semibold text-slate-900">Question type breakdown</h2>
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
        <div class="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            style="width:{q.parts?.[0] ?? 0}%"
            class="h-full bg-sky-300 float-left"
          ></div>
          <div
            style="width:{q.parts?.[1] ?? 0}%"
            class="h-full bg-amber-200 float-left"
          ></div>
          <div
            style="width:{q.parts?.[2] ?? 0}%"
            class="h-full bg-rose-200 float-left"
          ></div>
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-4 rounded border border-slate-100 p-3 bg-white">
    <div class="text-sm text-slate-700 mb-2">{debate?.title ?? ""}</div>
    <div class="flex items-center gap-3">
      <div class="flex-1 rounded-full bg-slate-100 p-1">
        <div
          class="h-6 rounded-full bg-sky-300 inline-block"
          style="width:{debate?.left?.pct ?? 0}%"
        ></div>
        <div
          class="h-6 rounded-full bg-emerald-300 inline-block float-right"
          style="width:{debate?.right?.pct ?? 0}%"
        ></div>
      </div>
    </div>
    <div class="mt-2 flex justify-between text-xs text-slate-500">
      <div class="px-2 py-1 rounded text-sky-700 bg-sky-100/60">
        {debate?.left?.name ?? ""}{debate?.left?.pct ?? 0}%
      </div>
      <div class="px-2 py-1 rounded text-emerald-700 bg-emerald-100/60">
        {debate?.right?.name ?? ""}{debate?.right?.pct ?? 0}%
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
          <div class="flex items-center justify-between text-sm text-slate-700">
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
              <div class="h-3 w-full rounded-full bg-white overflow-hidden">
                <div
                  style="width:{mq.parts[0]}%"
                  class="h-full bg-sky-300 float-left"
                ></div>
                <div
                  style="width:{mq.parts[1]}%"
                  class="h-full bg-amber-200 float-left"
                ></div>
                <div
                  style="width:{mq.parts[2]}%"
                  class="h-full bg-rose-200 float-left"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>
