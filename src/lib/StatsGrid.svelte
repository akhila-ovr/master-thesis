<!-- StatsGrid.svelte: renders the three top-level stat cards. -->
<script lang="ts">
  export let stats: Array<{
    label: string;
    value: string;
    note?: string;
    accent?: boolean;
  }> = [];
</script>

<div class="grid gap-4 md:grid-cols-3 mb-4">
  {#each stats as s}
    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</div>
      <div class="mt-2 text-3xl font-bold text-slate-900">{s.value}</div>
      {#if s.note}
        <div class="mt-2 text-xs text-slate-500" class:text-rose-600={s.accent}>
          {s.note}
        </div>
      {/if}
    </div>
  {/each}
</div>
