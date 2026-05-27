<!-- QuestionModal.svelte: small modal to display per-question bars. -->
<script lang="ts">
  export let open: boolean = false;
  export let title: string = "";
  export let questions: Array<{ label: string; parts: number[] }> = [];
  export let onClose: () => void = () => {};
</script>

{#if open}
  <div class="fixed inset-0 z-60 flex items-center justify-center">
    <div
      class="absolute inset-0 bg-black/40"
      role="button"
      tabindex="0"
      aria-label="Close modal"
      on:click={onClose}
      on:keydown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClose();
      }}
    ></div>
    <div
      class="relative z-70 w-[90%] max-w-2xl bg-white rounded-lg shadow-lg overflow-auto max-h-[80vh]"
    >
      <div
        class="p-4 border-b border-slate-100 flex items-center justify-between"
      >
        <div class="text-sm font-semibold">{title}</div>
        <button
          on:click={onClose}
          class="text-xs px-2 py-1 bg-slate-100 rounded">Close</button
        >
      </div>
      <div class="p-4 space-y-3">
        {#each questions as qq}
          <div class="rounded border border-slate-100 bg-slate-50 p-3">
            <div
              class="flex items-center justify-between text-xs text-slate-700 mb-2"
            >
              <div>{qq.label}</div>
              <div class="text-xs text-slate-600">
                {qq.parts[0]}% · {qq.parts[1]}% · {qq.parts[2]}%
              </div>
            </div>
            <div class="h-3 w-full rounded-full bg-white overflow-hidden">
              <div
                style="width:{qq.parts[0]}%"
                class="h-full bg-sky-300 float-left"
              ></div>
              <div
                style="width:{qq.parts[1]}%"
                class="h-full bg-amber-200 float-left"
              ></div>
              <div
                style="width:{qq.parts[2]}%"
                class="h-full bg-rose-200 float-left"
              ></div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}
