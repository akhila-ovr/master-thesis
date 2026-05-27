<!-- StudentGroups.svelte: renders group cards and shows a modal listing
		 students in a selected group. Component manages its own modal and student viewer. -->
<script lang="ts">
  export let students: Array<{
    name: string;
    group: string;
    summary: string;
    transcript: string;
  }> = [];
  export let groups: Array<{
    id: string;
    label: string;
    chipTextClass?: string;
    chipBgClass?: string;
    description: string;
  }> = [];

  let modalOpen = false;
  let filterGroup: string | null = null;
  $: filtered = filterGroup
    ? students.filter((s) => s.group === filterGroup)
    : students;
  let selectedIndex: number | null = null;
  let showTranscript = false;

  function openGroup(gid: string) {
    filterGroup = gid;
    modalOpen = true;
    selectedIndex = null;
    showTranscript = false;
  }
  function closeModal() {
    modalOpen = false;
    filterGroup = null;
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
  <h2 class="text-sm font-semibold">Student groups — quant + reflection</h2>
  <div class="mt-3 space-y-3">
    {#each groups as g}
      <div
        class="rounded p-3 bg-slate-50 border border-slate-100 flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between">
            <div
              class="text-xs {g.chipTextClass} {g.chipBgClass} inline-block px-2 py-1 rounded"
            >
              {g.label}
            </div>
            <div class="text-sm text-slate-600">
              {students.filter((s) => s.group === g.id).length} students
            </div>
          </div>
          <div class="mt-3 text-sm text-slate-700">{g.description}</div>
        </div>
        <div class="mt-4">
          <button
            on:click={() => openGroup(g.id)}
            class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 bg-white"
            >Show students</button
          >
        </div>
      </div>
    {/each}
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
              Reflections ({filtered.length})
            </div>
            {#each filtered as st, i}
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
                  on:click={closeModal}
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
                    on:click={toggleTranscript}
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
</div>
