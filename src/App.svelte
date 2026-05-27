<!-- App.svelte: application root — contains shared data and passes it to child components.
     Components: MainStats, ReflectionSummary, QuestionBreakdown, StudentGroups -->
<script lang="ts">
  import MainStats from "./lib/MainStats.svelte";
  import ReflectionSummary from "./lib/ReflectionSummary.svelte";
  import QuestionBreakdown from "./lib/QuestionBreakdown.svelte";
  import StudentGroups from "./lib/Groups.svelte";
  import TaskSuggestions from "./lib/TaskSuggestions.svelte";
  import TasksList from "./lib/TasksList.svelte";

  // Shared data
  export const stats = [
    { label: "Completed", value: "8/10" },
    { label: "Avg. score", value: "64%", note: "below target", accent: true },
    { label: "Errors confirmed", value: "7", note: "by reflection" },
    {
      label: "Avg. ref depth",
      value: "2.4/5",
      note: "surface-level",
      accent: true,
    },
  ];

  export const questionTypes = [
    {
      label: "True / False (3 questions)",
      parts: [55, 25, 20],
      questions: [
        { parts: [62, 20, 18] },
        { parts: [57, 25, 18] },
        { parts: [31, 34, 35] },
      ],
    },
    {
      label: "Multiple choice (4 questions)",
      parts: [70, 20, 10],
      questions: [
        { parts: [78, 15, 7] },
        { parts: [65, 20, 15] },
        { parts: [70, 18, 12] },
        { parts: [67, 27, 6] },
      ],
    },
    {
      label: "Fill in blanks (2 questions)",
      parts: [58, 28, 14],
      questions: [{ parts: [60, 25, 15] }, { parts: [56, 31, 13] }],
    },
    {
      label: "Drag & drop (2 questions)",
      parts: [72, 20, 8],
      questions: [{ parts: [74, 18, 8] }, { parts: [70, 22, 8] }],
    },
    {
      label: "Sorting (1 question)",
      parts: [66, 24, 10],
      questions: [{ parts: [66, 24, 10] }],
    },
  ];

  // assign (randomized) labels Q1..Q12 to questions
  function shuffle<T>(arr: T[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  const qNums = shuffle(Array.from({ length: 12 }, (_, i) => i + 1));
  for (const qt of questionTypes) {
    for (const qq of qt.questions) {
      (qq as any).label = `Q${qNums.shift()}`;
    }
  }

  // Theme: kid-friendly modern palette (soft, distinct)
  export const themeColors = {
    primary: "#60A5FA", // soft blue
    secondary: "#A78BFA", // soft purple
    accent: "#FDBA74", // soft orange
    mint: "#86EFAC", // soft mint
    pink: "#FCA5A5", // soft pink
    // default trio for pie slices
    pastelPalette: ["#60A5FA", "#FDBA74", "#86EFAC"],
  };

  // Shared pastel palette used across all creative pie charts (from theme)
  const creativePalette = themeColors.pastelPalette;

  // Four creative path questions; each has three path-option percentages
  // All use the same soft pastel palette for consistency
  export const creative = [
    { label: "Path Q1", parts: [45, 32, 23], colors: creativePalette },
    { label: "Path Q2", parts: [30, 40, 30], colors: creativePalette },
    { label: "Path Q3", parts: [25, 50, 25], colors: creativePalette },
    { label: "Path Q4", parts: [60, 20, 20], colors: creativePalette },
  ];

  export const reflectionSummary =
    "Most students identify littering and plastic as harmful; several reflections describe effects without explaining the mechanism (missing ingestion pathway).";

  export const students = [
    {
      name: "Finn D.",
      group: "A",
      summary: "Strong; explains ingestion pathway",
      transcript: "I saw a turtle with plastic in its stomach...",
    },
    {
      name: "Omar S.",
      group: "A",
      summary: "Mentions habitat loss",
      transcript: "Animals lose their homes when we build here...",
    },
    {
      name: "Noah R.",
      group: "B",
      summary: "Surface-level",
      transcript: "Plastic is bad for animals.",
    },
    {
      name: "Amara K.",
      group: "B",
      summary: "Connects to community",
      transcript: "We can organize a clean-up...",
    },
    {
      name: "James T.",
      group: "B",
      summary: "Good detail on ingestion",
      transcript: "Ingestion causes blockages and toxins...",
    },
    {
      name: "Luca B.",
      group: "C",
      summary: "Short, correct",
      transcript: "They eat plastic by mistake.",
    },
    {
      name: "Priya N.",
      group: "C",
      summary: "Reflective",
      transcript: "I worry about long-term effects...",
    },
    {
      name: "Yara H.",
      group: "C",
      summary: "Surface",
      transcript: "Plastic is bad for sea life.",
    },
    {
      name: "Sofia M.",
      group: "D",
      summary: "Mechanism noted",
      transcript: "Microplastics enter the food chain...",
    },
    {
      name: "Lina P.",
      group: "D",
      summary: "Personal connection",
      transcript: "My local beach had plastic everywhere...",
    },
  ];

  export const groups = [
    {
      id: "A",
      label: "Group A",
      chipTextClass: "text-rose-700",
      chipBgClass: "bg-rose-100",
      description:
        "Low score + error in reflection — Scores below 55%. Need re-teaching.",
    },
    {
      id: "B",
      label: "Group B",
      chipTextClass: "text-indigo-700",
      chipBgClass: "bg-indigo-100",
      description:
        "High score, surface reflection — 80%+. Needs metacognitive prompting.",
    },
    {
      id: "C",
      label: "Group C",
      chipTextClass: "text-emerald-700",
      chipBgClass: "bg-emerald-100",
      description:
        "Strong score + rich reflection — Scores 80%+. Reflections show specific mechanisms and personal connections.",
    },
    {
      id: "D",
      label: "Group D",
      chipTextClass: "text-yellow-700",
      chipBgClass: "bg-yellow-100",
      description:
        "Mixed performance — Some correct answers but shallow reflections. Recommend targeted prompts.",
    },
  ];

  // Tasks & suggestions state
  let tasks: Array<any> = [];
  let tasksOpen = false;

  $: pendingTasks = tasks.filter((t) => !t.done);

  let suggestions: Array<any> = [
    {
      title: "Re-teach the ingestion pathway",
      summary:
        "Group A (5 students) scored below 55% and reflections miss the ingestion mechanism. Suggest re-teach before next expedition.",
      task: {
        title: "Re-teach ingestion pathway",
        priority: "high",
        note: "Use Finn D.'s reflection as example",
      },
      groundTruth: {
        score: "Group A avg: 48% (5/10)",
        transcript: "Finn D.: 'I saw a turtle with plastic in its stomach...'",
      },
    },
    {
      title: "Prompt self-evaluation",
      summary:
        "Group B students submitted surface reflections despite high scores — prompt metacognitive self-evaluation.",
      task: {
        title: "Prompt self-evaluation",
        priority: "normal",
        note: "Add 'I know this because...' prompt",
      },
      groundTruth: {
        score: "Group B avg: 82% (8/10)",
        transcript: "Noah R.: 'Plastic is bad for animals.' (surface-level)",
      },
    },
  ];

  function addSuggestionToTasks(s: any) {
    // add suggestion task silently (do not open modal)
    const merged = {
      ...s.task,
      reason: s.summary,
      groundTruth: s.groundTruth,
    };
    tasks = [merged, ...tasks];
    // remove suggestion
    suggestions = suggestions.filter((x) => x !== s);
  }

  function rejectSuggestion(i: number) {
    suggestions.splice(i, 1);
    suggestions = suggestions.slice();
  }

  function addTaskManually(t: any) {
    tasks = [{ ...t, done: false }, ...tasks];
  }

  function removeTask(i: number) {
    tasks.splice(i, 1);
    tasks = tasks.slice();
  }

  function openTasks() {
    tasksOpen = true;
  }

  function markTaskDone(i: number) {
    const t = tasks[i];
    if (!t) return;
    tasks[i] = { ...t, done: true };
    tasks = tasks.slice();
  }
</script>

<main class="min-h-screen bg-[#f6f3ee] text-slate-800 p-6">
  <div class="mx-auto max-w-6xl">
    <header class="mb-4 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">
          Nature's Wonderful Animals — <span
            class="text-sm font-normal text-slate-600">expedition review</span
          >
        </h1>
      </div>
      <div class="text-sm text-slate-600 flex items-center gap-3">
        <span>Completed yesterday · {students.length} students</span>
        <button
          class="text-xs px-3 py-1 bg-slate-100 rounded"
          on:click={openTasks}>Add a Task</button
        >
        <span class="rounded-full bg-rose-100 px-3 py-1 text-rose-700 text-xs"
          >Planning mode</span
        >
      </div>
    </header>

    <MainStats {stats} />

    <!-- Pending tasks preview (only show when there are pending tasks) -->
    {#if pendingTasks.length > 0}
      <div class="mt-4">
        <div class="rounded-lg border border-slate-200 bg-white p-4">
          <h3 class="text-sm font-semibold text-slate-900 mb-3">Tasks to do</h3>
          <div class="space-y-2">
            {#each pendingTasks as t}
              <div
                class="flex items-center justify-between gap-2 rounded border p-2"
              >
                <div>
                  <div class="text-sm font-medium">{t.title}</div>
                  {#if t.note}
                    <div class="text-xs text-slate-600">{t.note}</div>
                  {/if}
                </div>
                <div class="flex items-center gap-2">
                  <div class="text-xs text-slate-500">{t.priority}</div>
                  <button
                    class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                    on:click={() =>
                      markTaskDone(tasks.findIndex((x) => x === t))}
                    >Done</button
                  >
                  <button
                    class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded"
                    on:click={() => removeTask(tasks.findIndex((x) => x === t))}
                    >Remove</button
                  >
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}

    <!-- Suggested teacher actions -->
    <div class="mt-4 mb-6">
      <TaskSuggestions
        {suggestions}
        onAdd={addSuggestionToTasks}
        onReject={rejectSuggestion}
      />
    </div>

    <section class="grid gap-4 lg:grid-cols-2">
      <div class="space-y-4">
        <QuestionBreakdown
          {questionTypes}
          {creative}
          {themeColors}
          debate={{
            title:
              'Topic: "Humans should stop all development near wildlife habitats"',
            left: {
              name: "Vio",
              pct: 58,
              stance:
                "Protect habitat first: slow development, avoid fragmentation, and keep wildlife corridors open.",
              students: [
                "Finn D.",
                "Amara K.",
                "Priya N.",
                "Luca B.",
                "Sofia M.",
              ],
            },
            right: {
              name: "Mint",
              pct: 42,
              stance:
                "Development can continue if it is carefully managed with mitigation and planning.",
              students: [
                "Omar S.",
                "Noah R.",
                "James T.",
                "Yara H.",
                "Lina P.",
              ],
            },
          }}
        />
      </div>

      <div class="space-y-4">
        <ReflectionSummary {reflectionSummary} {students} />
        <StudentGroups {students} {groups} />
      </div>
    </section>
  </div>
  <TasksList
    {tasks}
    open={tasksOpen}
    onClose={() => (tasksOpen = false)}
    onAdd={addTaskManually}
    onRemove={removeTask}
    on:done={(e) => markTaskDone(e.detail)}
  />
</main>
