<!-- ReflectionSummary.svelte: shows the reflection summary and provides an
     internal modal to view all student reflections. -->
<script lang="ts">
  export let reflectionSummary: string = "";
  export let students: Array<{
    name: string;
    summary: string;
    transcript: string;
  }> = [];

  let modalOpen = false;
  let selectedIndex: number | null = null;
  let showTranscript = false;

  function openModal() {
    modalOpen = true;
    selectedIndex = null;
    showTranscript = false;
  }
  function closeModal() {
    modalOpen = false;
    selectedIndex = null;
    showTranscript = false;
  }
  function selectStudent(i: number) {
    selectedIndex = i;
    showTranscript = false;
  }
  function toggleTranscript() {
    showTranscript = !showTranscript;
  }
</script>

<div class="rounded-lg border border-slate-200 bg-white p-4">
  <div class="flex items-center justify-between">
    <h2 class="text-sm font-semibold">Reflection theme summary</h2>
    <button class="text-xs text-slate-400 underline">how generated?</button>
  </div>
  <div
    class="mt-3 rounded p-3 bg-white text-sm text-slate-700 border border-slate-100"
  >
    {reflectionSummary}
  </div>
  <div class="mt-3 flex gap-2">
    <button
      on:click={openModal}
      class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 bg-white"
      >See all {students.length} reflections</button
    >
    <button
      class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 bg-white"
      >Override summary</button
    >
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
        class="relative z-10 w-[90%] max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div class="flex">
          <div
            class="w-1/3 border-r border-slate-100 max-h-[70vh] overflow-auto"
          >
            <div class="p-4 text-sm font-semibold">
              Reflections ({students.length})
            </div>
            {#each students as st, i}
              <button
                on:click={() => selectStudent(i)}
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
                    {students[selectedIndex].name}
                  </div>
                  <div class="text-sm text-slate-600 mt-1">
                    {students[selectedIndex].summary}
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
                  on:click={closeModal}
                  class="text-xs px-2 py-1 bg-slate-100 rounded">Close</button
                >
              </div>
            </div>

            {#if selectedIndex !== null}
              <div class="mt-4">
                <div class="text-sm text-slate-700">Summary</div>
                <div class="mt-2 text-sm text-slate-800">
                  {students[selectedIndex].summary}
                </div>
                <div class="mt-4">
                  <button
                    on:click={toggleTranscript}
                    class="rounded-full border border-slate-200 px-3 py-1 text-xs"
                    >{showTranscript
                      ? "Hide transcript"
                      : "Show transcript"}</button
                  >
                </div>
                {#if showTranscript}
                  <pre
                    class="mt-3 p-3 bg-slate-50 text-sm text-slate-700 rounded max-h-48 overflow-auto">{students[
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
</div>
