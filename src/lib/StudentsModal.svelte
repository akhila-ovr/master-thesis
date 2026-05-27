<!-- StudentsModal.svelte: standalone modal that lists students and shows a selected
		 student's summary and transcript. This file is provided for reuse but not
		 required if components implement their own modals. -->
<script lang="ts">
  export let modalOpen: boolean = false;
  export let filtered: Array<{
    name: string;
    summary: string;
    transcript: string;
  }> = [];
  export let selectedIndex: number | null = null;
  export let showTranscript: boolean = false;

  export let onClose: () => void = () => {};
  export let onSelect: (i: number) => void = () => {};
  export let onToggleTranscript: () => void = () => {};
</script>

{#if modalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
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
      class="relative z-10 w-[90%] max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden"
    >
      <div class="flex">
        <div class="w-1/3 border-r border-slate-100 max-h-[70vh] overflow-auto">
          <div class="p-4 text-sm font-semibold">
            Reflections ({filtered.length})
          </div>
          {#each filtered as st, i}
            <button
              on:click={() => onSelect(i)}
              class="w-full text-left p-3 hover:bg-slate-50 border-t border-slate-100"
            >
              <div class="text-sm text-slate-800">{st.name}</div>
              <div class="text-xs text-slate-500 mt-1">{st.summary}</div>
            </button>
          {/each}
        </div>

        <div class="w-2/3 p-4">
          <div class="flex items-start justify-between">
            <div>
              {#if selectedIndex !== null}
                <div class="text-base font-semibold">
                  {filtered[selectedIndex].name}
                </div>
                <div class="text-sm text-slate-600 mt-1">
                  {filtered[selectedIndex].summary}
                </div>
              {:else}
                <div class="text-base font-semibold">Select a student</div>
                <div class="text-sm text-slate-600 mt-1">
                  Choose a student to view full reflection.
                </div>
              {/if}
            </div>
            <div>
              <button
                on:click={onClose}
                class="text-xs px-2 py-1 bg-slate-100 rounded">Close</button
              >
            </div>
          </div>

          {#if selectedIndex !== null}
            <div class="mt-4">
              <div class="text-sm text-slate-700">Summary</div>
              <div class="mt-2 text-sm text-slate-800">
                {filtered[selectedIndex].summary}
              </div>
              <div class="mt-4">
                <button
                  on:click={onToggleTranscript}
                  class="rounded-full border border-slate-200 px-3 py-1 text-xs"
                  >{showTranscript
                    ? "Hide transcript"
                    : "Show transcript"}</button
                >
              </div>
              {#if showTranscript}
                <pre
                  class="mt-3 p-3 bg-slate-50 text-sm text-slate-700 rounded max-h-48 overflow-auto">{filtered[
                    selectedIndex
                  ].transcript}</pre>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
