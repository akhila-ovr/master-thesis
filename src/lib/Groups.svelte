<!-- StudentGroups.svelte: renders group cards and shows a modal listing
		 students in a selected group (with illustrated avatars). Clicking a
		 student opens their full profile: quiz results, debate side, creative
		 story pick, and reflection. Component manages its own modal state. -->
<script lang="ts">
  import StudentProfile from "./StudentProfile.svelte";
  import { avatarFor, quizStats, type Student } from "./studentHelpers";

  export let students: Array<Student> = [];
  export let groups: Array<{
    id: string;
    label: string;
    chipTextClass?: string;
    chipBgClass?: string;
    description: string;
  }> = [];
  export let debate: any = {};

  type View = "list" | "profile";
  let view: View = "list";
  let modalOpen = false;
  let filterGroup: string | null = null;
  $: filtered = filterGroup
    ? students.filter((s) => s.group === filterGroup)
    : students;
  $: activeGroup = groups.find((g) => g.id === filterGroup);
  let selectedIndex: number | null = null;

  function openGroup(gid: string) {
    filterGroup = gid;
    modalOpen = true;
    view = "list";
    selectedIndex = null;
  }
  function closeModal() {
    modalOpen = false;
    filterGroup = null;
    view = "list";
    selectedIndex = null;
  }
  function selectStudent(i: number) {
    selectedIndex = i;
    view = "profile";
  }
  function backToList() {
    view = "list";
    selectedIndex = null;
  }

  let howGeneratedOpen = false;
  function openHowGenerated() {
    howGeneratedOpen = true;
  }
  function closeHowGenerated() {
    howGeneratedOpen = false;
  }

  const howGeneratedNotes = [
    "Groups are formed by looking at how each student performed across the whole expedition, not just one number. They highlight patterns worth following up on, not fixed labels.",
  ];
  const howGeneratedBullets = [
    "Quiz accuracy: how many questions were answered correctly, correctly after a retry, or missed entirely",
    "Reflection quality: whether the written reflection just named a concept, or explained and connected it",
    "Debate stance: which side of the class debate a student argued for",
    "Creative story choice: which path a student picked in the open-ended scenario",
  ];
</script>

<div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
  <div class="flex items-center justify-between">
    <h2 class="font-display text-lg font-bold text-slate-900">Student groups</h2>
    <button on:click={openHowGenerated} class="text-xs font-bold text-accent-600 underline underline-offset-2 hover:text-accent-700">
      how generated?
    </button>
  </div>
  <div class="mt-3 space-y-3">
    {#each groups as g}
      <div
        class="rounded-2xl p-4 bg-accent-50/40 border border-accent-100"
      >
        <div>
          <div class="flex items-center justify-between gap-2">
            <div
              class="text-xs font-bold {g.chipTextClass} {g.chipBgClass} inline-block px-3 py-1 rounded-full"
            >
              {g.label}
            </div>
            <button
              on:click={() => openGroup(g.id)}
              class="shrink-0 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300"
              >Show students</button
            >
          </div>
          <div class="mt-3 text-sm text-slate-700">{g.description}</div>
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
        class="relative z-10 w-[90%] max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col"
      >
        <div class="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <div class="font-display text-base font-bold text-slate-900">
              {activeGroup?.label ?? "Students"}
            </div>
            <div class="text-xs text-slate-500 mt-1">
              {#if view === "list"}
                Select a student to see their full profile.
              {:else}
                Quiz results, debate side, creative story pick, and reflection.
              {/if}
            </div>
          </div>
          <button
            on:click={closeModal}
            class="text-xs font-bold px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 shrink-0"
            >Close</button
          >
        </div>

        <div class="overflow-auto p-5">
          {#if view === "list"}
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {#each filtered as st, i}
                {@const avatar = avatarFor(st.name)}
                {@const stats = quizStats(st.quizAnswers)}
                <button
                  on:click={() => selectStudent(i)}
                  class="flex flex-col items-center gap-2 p-4 rounded-2xl border border-accent-100 bg-accent-50/30 hover:bg-white hover:shadow-sm transition-colors"
                >
                  <div class="w-16 h-16 rounded-full {avatar.bg} flex items-center justify-center text-3xl shadow-sm">
                    {avatar.emoji}
                  </div>
                  <div class="text-sm font-medium text-slate-800 text-center">{st.name}</div>
                  {#if st.score || stats}
                    <div class="w-full flex items-center gap-2">
                      {#if st.score}
                        <span class="font-display inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent-100 text-accent-700 text-xs font-bold shrink-0">{st.score}</span>
                      {/if}
                      {#if stats}
                        <div class="flex-1 min-w-0">
                          <div class="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                            <div class="h-full" style="width:{stats.correctPct}%; background:#10b981"></div>
                            <div class="h-full" style="width:{stats.retryPct}%; background:#f59e0b"></div>
                            <div class="h-full" style="width:{stats.wrongPct}%; background:#f43f5e"></div>
                          </div>
                          <div class="mt-1 text-[10px] text-slate-500 text-center">{stats.correctPct}% · {stats.retryPct}% · {stats.wrongPct}%</div>
                        </div>
                      {/if}
                    </div>
                  {/if}
                </button>
              {/each}
            </div>
          {:else if selectedIndex !== null}
            <button
              on:click={backToList}
              class="text-xs font-bold text-accent-600 hover:text-accent-700 mb-4"
            >
              ← Back to students
            </button>

            <!-- groups omitted on purpose: the modal header already names the
                 group, so the profile's group chip would be redundant here -->
            <StudentProfile student={filtered[selectedIndex]} {debate} />
          {/if}
        </div>
      </div>
    </div>
  {/if}

  {#if howGeneratedOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div
        class="absolute inset-0 bg-black/40"
        role="button"
        tabindex="0"
        aria-label="Close modal"
        on:click={closeHowGenerated}
        on:keydown={(e) => {
          if (e.key === "Enter" || e.key === " ") closeHowGenerated();
        }}
      ></div>
      <div
        class="relative z-10 w-[90%] max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden max-h-[80vh]"
      >
        <div class="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <div class="font-display text-base font-bold text-slate-900">How groups are generated</div>
            <div class="text-xs text-slate-500 mt-1">Sparkli's AI grouping logic and the signals it looked for.</div>
          </div>
          <button
            on:click={closeHowGenerated}
            class="text-xs font-bold px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 shrink-0"
            >Close</button
          >
        </div>

        <div class="max-h-[calc(80vh-73px)] overflow-auto p-5 space-y-4">
          <div class="rounded-2xl border border-accent-100 bg-accent-50/50 p-4 text-sm text-slate-700">
            {#each howGeneratedNotes as note}
              <p>{note}</p>
            {/each}
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-4">
            <div class="text-sm font-bold text-slate-900">
              What the AI looked for:
            </div>
            <ul class="mt-3 space-y-2 list-disc pl-5 text-sm text-slate-700">
              {#each howGeneratedBullets as bullet}
                <li>{bullet}</li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
