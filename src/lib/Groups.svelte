<!-- StudentGroups.svelte: renders group cards and shows a modal listing
		 students in a selected group (with illustrated avatars). Clicking a
		 student opens their full profile: quiz results, debate side, and
		 creative story pick. Component manages its own modal state. -->
<script lang="ts">
  export let students: Array<{
    name: string;
    group: string;
    debateSide?: string | null;
    creativeChoice?: string;
    quizAnswers?: Array<{
      typeLabel: string;
      qLabel: string;
      question: string;
      outcome: "correct" | "retry" | "wrong";
    }>;
  }> = [];
  export let groups: Array<{
    id: string;
    label: string;
    chipTextClass?: string;
    chipBgClass?: string;
    description: string;
  }> = [];
  export let debate: any = {};
  export let creative: Array<{ label: string }> = [];

  $: creativeQuestion = creative?.[0]?.label ?? "";

  function debateStanceFor(side: string | null | undefined) {
    if (!side) return "";
    if (side === debate?.left?.name) return debate?.left?.stance ?? "";
    if (side === debate?.right?.name) return debate?.right?.stance ?? "";
    return "";
  }

  const AVATAR_EMOJIS = ["🦊", "🐢", "🐬", "🦉", "🐧", "🦋", "🐨", "🐠", "🦜", "🦡", "🐿️", "🐙"];
  const AVATAR_BG = [
    "bg-rose-100",
    "bg-amber-100",
    "bg-emerald-100",
    "bg-sky-100",
    "bg-violet-100",
    "bg-pink-100",
  ];
  function hashOf(name: string) {
    return name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  }
  function avatarFor(name: string) {
    const h = hashOf(name);
    return {
      emoji: AVATAR_EMOJIS[h % AVATAR_EMOJIS.length],
      bg: AVATAR_BG[h % AVATAR_BG.length],
    };
  }

  const outcomeStyle: Record<string, { label: string; classes: string }> = {
    correct: { label: "Correct", classes: "bg-emerald-100 text-emerald-700" },
    retry: { label: "Correct after retry", classes: "bg-amber-100 text-amber-700" },
    wrong: { label: "Incorrect", classes: "bg-rose-100 text-rose-700" },
  };

  function quizStats(quizAnswers?: Array<{ outcome: string }>) {
    if (!quizAnswers || quizAnswers.length === 0) return null;
    const total = quizAnswers.length;
    const correct = quizAnswers.filter((q) => q.outcome === "correct").length;
    const retry = quizAnswers.filter((q) => q.outcome === "retry").length;
    const wrong = quizAnswers.filter((q) => q.outcome === "wrong").length;
    return {
      correctPct: Math.round((correct / total) * 100),
      retryPct: Math.round((retry / total) * 100),
      wrongPct: Math.round((wrong / total) * 100),
    };
  }

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
</script>

<div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
  <div class="flex items-center justify-between">
    <h2 class="font-display text-lg font-bold text-slate-900">Student groups</h2>
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
                Quiz results, debate side, and creative story pick.
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
                  {#if stats}
                    <div class="w-full flex items-center gap-2">
                      <div class="flex-1 min-w-0">
                        <div class="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                          <div class="h-full" style="width:{stats.correctPct}%; background:#10b981"></div>
                          <div class="h-full" style="width:{stats.retryPct}%; background:#f59e0b"></div>
                          <div class="h-full" style="width:{stats.wrongPct}%; background:#f43f5e"></div>
                        </div>
                        <div class="mt-1 text-[10px] text-slate-500 text-center">{stats.correctPct}% · {stats.retryPct}% · {stats.wrongPct}%</div>
                      </div>
                    </div>
                  {/if}
                </button>
              {/each}
            </div>
          {:else if selectedIndex !== null}
            {@const student = filtered[selectedIndex]}
            {@const avatar = avatarFor(student.name)}
            {@const stats = quizStats(student.quizAnswers)}
            <button
              on:click={backToList}
              class="text-xs font-bold text-accent-600 hover:text-accent-700 mb-4"
            >
              ← Back to students
            </button>

            <div class="flex items-center gap-3">
              <div class="w-16 h-16 rounded-full {avatar.bg} flex items-center justify-center text-3xl shadow-sm shrink-0">
                {avatar.emoji}
              </div>
              <div>
                <div class="font-display text-lg font-bold text-slate-900">{student.name}</div>
              </div>
            </div>

            <div class="mt-5 grid grid-cols-3 gap-3">
              <div class="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 text-center">
                <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Right</div>
                <div class="font-display mt-1 text-2xl font-extrabold text-emerald-600">{stats ? `${stats.correctPct}%` : "–"}</div>
              </div>
              <div class="rounded-2xl border border-amber-100 bg-amber-50/50 p-3 text-center">
                <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Right after retry</div>
                <div class="font-display mt-1 text-2xl font-extrabold text-amber-600">{stats ? `${stats.retryPct}%` : "–"}</div>
              </div>
              <div class="rounded-2xl border border-rose-100 bg-rose-50/50 p-3 text-center">
                <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Wrong</div>
                <div class="font-display mt-1 text-2xl font-extrabold text-rose-600">{stats ? `${stats.wrongPct}%` : "–"}</div>
              </div>
            </div>

            <div class="mt-3 grid grid-cols-2 gap-3">
              {#if student.debateSide}
                <div class="rounded-2xl border border-accent-100 bg-accent-50/40 p-3">
                  <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Debate</div>
                  <div class="mt-1 text-sm font-bold text-slate-900">Sided with {student.debateSide}</div>
                  {#if debateStanceFor(student.debateSide)}
                    <div class="mt-1 text-xs text-slate-500">{debateStanceFor(student.debateSide)}</div>
                  {/if}
                </div>
              {/if}
              {#if student.creativeChoice}
                <div class="rounded-2xl border border-accent-100 bg-accent-50/40 p-3">
                  <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Creative story</div>
                  {#if creativeQuestion}
                    <div class="mt-1 text-xs text-slate-500">{creativeQuestion}</div>
                  {/if}
                  <div class="mt-1 text-sm font-bold text-slate-900">{student.creativeChoice}</div>
                </div>
              {/if}
            </div>

            {#if student.quizAnswers && student.quizAnswers.length > 0}
              <div class="mt-5">
                <div class="text-sm font-bold text-slate-700 mb-2">Question results</div>
                <div class="space-y-1.5">
                  {#each student.quizAnswers as qa}
                    <div class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2">
                      <div class="min-w-0">
                        <span class="font-display inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent-100 text-accent-700 text-xs font-bold shrink-0 mr-2">{qa.qLabel}</span>
                        <span class="text-xs text-slate-700">{qa.question}</span>
                      </div>
                      <span class="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 {outcomeStyle[qa.outcome].classes}">{outcomeStyle[qa.outcome].label}</span>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>
