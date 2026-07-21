<!-- TaskSuggestions.svelte: shows suggested teacher actions with accept/reject buttons -->
<script lang="ts">
  export let suggestions: Array<any> = [];
  export let groups: Array<{
    id: string;
    chipTextClass?: string;
    chipBgClass?: string;
  }> = [];
  export let onAdd: (task: any) => void;
  export let onReject: (index: number) => void;

  function groupChipClasses(groupId: string) {
    const g = groups.find((x) => x.id === groupId);
    return `${g?.chipTextClass ?? "text-slate-700"} ${g?.chipBgClass ?? "bg-slate-100"}`;
  }
</script>

<div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
  <h3 class="font-display text-lg font-bold text-slate-900 mb-3">
    Recommended actions before next expedition
  </h3>
  <div class="space-y-3">
    {#each suggestions as s, i}
      <div class="rounded-2xl border border-accent-100 p-4 bg-accent-50/40">
        <div class="flex flex-col gap-2">
          <div class="flex items-start justify-between gap-4">
            <div>
              {#if s.group}
                <span class="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-1.5 {groupChipClasses(s.group)}">Group {s.group}</span>
              {/if}
              <div class="text-sm font-medium text-slate-900">{s.title}</div>
              <div class="text-xs text-slate-600 mt-1">{s.summary}</div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button
                class="text-xs font-bold px-4 py-2 text-white rounded-full shadow-md shadow-accent-300/40 hover:opacity-90 transition-opacity"
                style="background: linear-gradient(100deg, #A855F7, #EC4899);"
                on:click={() => onAdd && onAdd(s)}
              >
                Accept
              </button>
              <button
                class="text-xs font-bold px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 transition-colors"
                on:click={() => onReject && onReject(i)}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    {/each}
    {#if suggestions.length === 0}
      <div class="text-xs text-slate-500">No suggestions right now.</div>
    {/if}
  </div>
</div>
