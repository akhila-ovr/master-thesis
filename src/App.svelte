<script lang="ts">
  const stats = [
    { label: "Completed", value: "19/22" },
    { label: "Avg. score", value: "64%", note: "below target", accent: true },
    { label: "Errors confirmed", value: "7", note: "by reflection" },
    {
      label: "Avg. ref| depth",
      value: "2.4|5",
      note: "surface-level",
      accent: true,
    },
  ];
</script>

<section class="min-h-screen bg-[#f6f3ee] text-slate-100">
  <div class="mx-auto max-w-6xl px-4 py-3">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold tracking-tight text-slate-900">
          Nature's Wonderful Animals —
          <span class="block text-base font-normal text-slate-900">expedition review</span>
        </h1>
      </div>

      <div class="flex flex-wrap items-center gap-3 text-sm text-slate-400">
        <span>Completed yesterday · 22 students</span>
        <a href="#" class="text-slate-400 underline decoration-slate-600 underline-offset-4">
          Batched overnight? why?
        </a>
      </div>
    </header>

    <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {#each stats as stat}
        <div class="rounded-2xl border border-slate-200 bg-white/75 px-4 py-4 shadow-sm backdrop-blur">
          <p class="text-sm text-slate-500">{stat.label}</p>
          <p class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
          {#if stat.note}
            <p class="mt-1 text-sm {stat.accent ? 'text-rose-500' : 'text-slate-500'}">
              {stat.note}
            </p>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>
