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
    success: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-rose-600",
  } as const;

  const iconCircleClasses = {
    success: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-600",
    danger: "bg-rose-100 text-rose-600",
  } as const;

  const iconGlyph = {
    success: "✓",
    warning: "↻",
    danger: "✕",
  } as const;
</script>

<div class="grid gap-4 md:grid-cols-3 mb-4">
  {#each stats as s}
    <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex items-start justify-between gap-3">
        <div class="text-xs font-semibold text-slate-500">{s.label}</div>
        <span
          class={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${iconCircleClasses[s.tone ?? "success"]}`}
        >
          {iconGlyph[s.tone ?? "success"]}
        </span>
      </div>
      <div
        class={`font-display mt-3 text-3xl font-extrabold ${toneClasses[s.tone ?? "success"]}`}
      >
        {s.value}
      </div>
      {#if s.cta}
        <button
          type="button"
          on:click={s.onCtaClick}
          class="mt-2 text-xs font-medium text-accent-600 underline underline-offset-2 hover:text-accent-700"
        >
          {s.cta}
        </button>
      {:else if s.note}
        <div class="mt-2 text-xs text-slate-500" class:text-rose-600={s.accent}>
          {s.note}
        </div>
      {/if}
    </div>
  {/each}
</div>
