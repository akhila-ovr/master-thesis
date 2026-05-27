<!-- App.svelte: application root — contains shared data and passes it to child components.
     Components: MainStats, ReflectionSummary, QuestionBreakdown, StudentGroups -->
<script lang="ts">
  import MainStats from "./lib/MainStats.svelte";
  import ReflectionSummary from "./lib/ReflectionSummary.svelte";
  import QuestionBreakdown from "./lib/QuestionBreakdown.svelte";
  import StudentGroups from "./lib/Groups.svelte";

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

  export const creative = [
    { label: "Rescue the sea turtle", pct: 45 },
    { label: "Report the pollution", pct: 32 },
    { label: "Organise a clean-up", pct: 23 },
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
</script>

<main
  class="min-h-screen bg-[#f6f3ee] text-slate-800 p-6"
  style="font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;"
>
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
        <span class="rounded-full bg-rose-100 px-3 py-1 text-rose-700 text-xs"
          >Planning mode</span
        >
      </div>
    </header>

    <MainStats {stats} />

    <section class="grid gap-4 lg:grid-cols-2">
      <div class="space-y-4">
        <QuestionBreakdown
          {questionTypes}
          {creative}
          debate={{
            title:
              'Debate: "Humans should stop all development near wildlife habitats"',
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
</main>
