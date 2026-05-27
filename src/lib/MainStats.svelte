<!-- MainStats.svelte: component to render the top stats grid. -->
<script lang="ts">
  export let stats: Array<{
    label: string;
    value: string;
    note?: string;
    accent?: boolean;
  }> = [];
</script>

<div class="grid gap-3 md:grid-cols-4 mb-4">
  {#each stats as s}
    <div class="rounded-lg border border-slate-200 bg-white p-3">
      <div class="text-xs text-slate-500">{s.label}</div>
      <div class="mt-2 text-2xl font-semibold text-slate-900">{s.value}</div>
      {#if s.note}
        <div class="mt-1 text-xs text-slate-500" class:text-rose-600={s.accent}>
          {s.note}
        </div>
      {/if}
    </div>
  {/each}
</div>
