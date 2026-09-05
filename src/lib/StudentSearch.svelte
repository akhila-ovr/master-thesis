<!-- StudentSearch.svelte: header search box with a filtering dropdown of
     students. Picking one opens a full-page overlay with that student's
     detailed stats (StudentProfile). Replaces the old "N / N students" badge. -->
<script lang="ts">
  import StudentProfile from "./StudentProfile.svelte";
  import { avatarFor } from "./studentHelpers";

  export let students: Array<any> = [];
  export const groups: Array<any> = []; // accepted for API compat; not shown (StudentProfile dropped the group chip)
  export let debate: any = {};

  let query = "";
  let open = false; // dropdown visible
  let selected: any = null; // student whose detail page is open
  let activeIndex = 0;

  $: matches = query.trim()
    ? students.filter((s) =>
        s.name.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : students;

  // Keep the highlighted row in range as the filter narrows.
  $: if (activeIndex > matches.length - 1) activeIndex = 0;

  function choose(s: any) {
    selected = s;
    open = false;
    query = "";
  }
  function closePage() {
    selected = null;
  }
  function onKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, matches.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (matches[activeIndex]) choose(matches[activeIndex]);
    } else if (e.key === "Escape") {
      open = false;
    }
  }
</script>

<svelte:window
  on:keydown={(e) => {
    if (e.key === "Escape" && selected) selected = null;
  }}
/>

<div class="relative">
  <div
    class="relative z-30 flex h-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 shadow-sm"
  >
    <span class="text-sm text-slate-400" aria-hidden="true">🔍</span>
    <input
      type="text"
      bind:value={query}
      on:focus={() => (open = true)}
      on:input={() => (open = true)}
      on:keydown={onKeydown}
      placeholder="Search students"
      aria-label="Search students"
      class="w-40 bg-transparent py-2 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none"
    />
  </div>

  {#if open}
    <button
      class="fixed inset-0 z-20 cursor-default"
      tabindex="-1"
      aria-label="Close search"
      on:click={() => (open = false)}
    ></button>
    <div
      class="absolute right-0 z-30 mt-2 max-h-72 w-64 overflow-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
    >
      {#if matches.length === 0}
        <div class="px-3 py-2 text-sm text-slate-400">No students found</div>
      {:else}
        {#each matches as s, i}
          {@const a = avatarFor(s.name)}
          <button
            on:click={() => choose(s)}
            on:mouseenter={() => (activeIndex = i)}
            class="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left {i ===
            activeIndex
              ? 'bg-accent-50'
              : 'hover:bg-slate-50'}"
          >
            <span
              class="w-8 h-8 rounded-full {a.bg} flex items-center justify-center text-lg shrink-0"
              >{a.emoji}</span
            >
            <span class="text-sm font-medium text-slate-800">{s.name}</span>
          </button>
        {/each}
      {/if}
    </div>
  {/if}
</div>

{#if selected}
  <div class="fixed inset-0 z-50 overflow-auto bg-slate-50">
    <div class="mx-auto max-w-4xl p-6 md:p-10">
      <div class="mb-6 flex items-center justify-between">
        <button
          on:click={closePage}
          class="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >← Back to dashboard</button
        >
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Student detail
        </div>
      </div>
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <StudentProfile student={selected} {debate} />
      </div>
    </div>
  </div>
{/if}
