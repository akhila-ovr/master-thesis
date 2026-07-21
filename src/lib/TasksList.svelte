<!-- TasksList.svelte: modal to view and manage teacher tasks; includes form to add new tasks -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let tasks: Array<any> = [];
  export let open: boolean = false;
  export let onClose: () => void;
  export let onAdd: (task: any) => void;
  export let onRemove: (index: number) => void;

  const dispatch = createEventDispatcher();

  let title = "";
  let priority = "normal";
  let note = "";
  let targetedIdea = "";

  function submit(e: Event) {
    e.preventDefault();
    if (!title.trim()) return;
    // Manually added items are standard tasks, not suggestions
    const t = { title: title.trim(), priority, note, targetedIdea, isSuggestion: false };
    onAdd && onAdd(t);
    title = "";
    priority = "normal";
    note = "";
    targetedIdea = "";
  }

  function acceptSuggestion(index: number) {
    tasks[index].isSuggestion = false;
    // Trigger Svelte reactivity
    tasks = [...tasks];
  }
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div
      class="absolute inset-0 bg-black/40"
      role="button"
      tabindex="0"
      aria-label="Close tasks modal"
      on:click={onClose}
      on:keydown={(e) => {
        const k = (e as KeyboardEvent).key;
        if (k === "Enter" || k === " ") onClose && onClose();
      }}
    ></div>
    <div
      class="relative z-10 w-[90%] max-w-2xl bg-white rounded-3xl shadow-xl overflow-auto max-h-[80vh]"
    >
      <div class="p-4 border-b border-slate-200 flex items-center justify-between">
        <div class="font-display text-base font-bold text-slate-900">Tasks list</div>
        <button
          class="text-xs font-bold px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 shrink-0"
          on:click={onClose}>Close</button
        >
      </div>

      <div class="p-5 space-y-4">
        <form on:submit|preventDefault={submit} class="space-y-2">
          <div class="flex gap-2">
            <input
              class="flex-1 px-4 py-2.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-accent-400"
              placeholder="Task title"
              bind:value={title}
            />
            <select class="px-3 py-2.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-accent-400" bind:value={priority}>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
            <button
              class="px-5 py-2.5 text-white text-sm font-bold rounded-full shadow-md shadow-accent-300/40 hover:opacity-90"
              style="background: linear-gradient(100deg, #A855F7, #EC4899);"
              type="submit">Add</button
            >
          </div>
          <textarea
            class="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-accent-400"
            rows="2"
            placeholder="Note (optional)"
            bind:value={note}
          ></textarea>
        </form>

        <div>
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Existing tasks & Suggestions
          </div>
          <div class="space-y-2">
            {#each tasks as t, i}
              <div
                class="rounded-2xl border p-3 {t.isSuggestion
                  ? 'bg-accent-50/60 border-accent-200'
                  : 'border-slate-200'}"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <div
                      class="text-sm font-medium {t.done && !t.isSuggestion
                        ? 'line-through text-slate-400'
                        : 'text-slate-900'}"
                    >
                      {t.title}
                    </div>
                    {#if t.note}
                      <div class="text-xs text-slate-600 mt-1">{t.note}</div>
                    {/if}
                    {#if t.targetedIdea}
                      <div class="text-xs text-slate-500 mt-2">
                        <strong>Targeted idea:</strong>
                        {t.targetedIdea}
                      </div>
                    {/if}
                    {#if t.reason}
                      <div class="text-xs text-slate-500 mt-2">
                        <strong>Why:</strong>
                        {t.reason}
                      </div>
                    {/if}
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <div class="text-xs text-slate-500">{t.priority}</div>

                    {#if t.isSuggestion}
                      <!-- Suggestion Actions -->
                      <button
                        class="text-xs font-bold px-3 py-1.5 text-white rounded-full shadow-sm hover:opacity-90"
                        style="background: linear-gradient(100deg, #A855F7, #EC4899);"
                        on:click={() => acceptSuggestion(i)}>Accept</button
                      >
                      <button
                        class="text-xs font-bold px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-full hover:bg-slate-50"
                        on:click={() => onRemove && onRemove(i)}>Reject</button
                      >
                    {:else}
                      <!-- Standard Task Actions -->
                      {#if t.done}
                        <div
                          class="text-xs font-bold px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full"
                        >
                          Done
                        </div>
                      {:else}
                        <button
                          class="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100"
                          on:click={() => dispatch("done", i)}>Mark done</button
                        >
                      {/if}
                      <button
                        class="text-xs font-bold px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full hover:bg-rose-100"
                        on:click={() => onRemove && onRemove(i)}>Remove</button
                      >
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
            {#if tasks.length === 0}
              <div class="text-xs text-slate-500">No tasks yet.</div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
