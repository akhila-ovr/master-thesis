<!-- TaskSuggestions.svelte: shows suggested teacher actions with Add/Reject buttons -->
<script lang="ts">
  export let suggestions: Array<any> = [];
  export let onAdd: (task: any) => void;
  export let onReject: (index: number) => void;
</script>

<div class="rounded-lg border border-slate-200 bg-white p-4">
  <h3 class="text-sm font-semibold text-slate-900 mb-3">
    Recommended actions before next expedition
  </h3>
  <div class="space-y-3">
    {#each suggestions as s, i}
      <div class="rounded border border-slate-200 p-3 bg-slate-50">
        <div class="flex flex-col gap-2">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-sm font-medium text-slate-900">{s.title}</div>
              <div class="text-xs text-slate-600 mt-1">{s.summary}</div>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="text-xs px-3 py-1 bg-blue-500 text-white rounded"
                on:click={() => onAdd && onAdd(s)}
              >
                Add to tasks list
              </button>
              <button
                class="text-xs px-2 py-1 bg-transparent border border-slate-200 rounded text-slate-600"
                on:click={() => onReject && onReject(i)}
              >
                Reject
              </button>
            </div>
          </div>
          {#if s.groundTruth}
            <div class="text-xs text-slate-500">
              <div><strong>Ground truth:</strong> {s.groundTruth.score}</div>
              {#if s.groundTruth.transcript}
                <div class="mt-1">
                  <strong>Transcript:</strong>
                  {s.groundTruth.transcript}
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    {/each}
    {#if suggestions.length === 0}
      <div class="text-xs text-slate-500">No suggestions right now.</div>
    {/if}
  </div>
</div>
