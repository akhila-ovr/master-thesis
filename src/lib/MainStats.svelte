<!-- MainStats.svelte: component to render the top stats grid. -->
<script lang="ts">
  export let stats: Array<{
    label: string;
    value: string;
    note?: string;
    accent?: boolean;
    tone?: "success" | "warning" | "danger";
    cta?: string;
    onCtaClick?: () => void;
  }> = [];

  const toneClasses = {
    success: "text-emerald-500",
    warning: "text-amber-500",
    danger: "text-rose-500",
  } as const;
</script>

<div class="grid gap-3 md:grid-cols-3 mb-4">
  {#each stats as s}
    <div class="rounded-lg border border-slate-200 bg-white p-3 text-center">
      <div class="text-xs text-slate-500">{s.label}</div>
      <div
        class={`mt-2 text-2xl font-semibold ${toneClasses[s.tone ?? "success"]}`}
      >
        {s.value}
      </div>
      {#if s.cta}
        <button
          type="button"
          on:click={s.onCtaClick}
          class="mt-1 text-xs font-medium text-sky-600 underline underline-offset-2 hover:text-sky-700"
        >
          {s.cta}
        </button>
      {:else if s.note}
        <div class="mt-1 text-xs text-slate-500" class:text-rose-600={s.accent}>
          {s.note}
        </div>
      {/if}
    </div>
  {/each}
</div>
