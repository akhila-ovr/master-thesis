<script lang="ts">
  const stats = [
    { label: "Completed", value: "19/22" },
    { label: "Avg. score", value: "64%", note: "below target", accent: true },
    { label: "Errors confirmed", value: "7", note: "by reflection" },
    {
      label: "Avg. ref depth",
      value: "2.4/5",
      note: "surface-level",
      accent: true,
    },
  ];

  const questionTypes = [
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

  // assign a random mapping of question numbers 1..12 to the per-type questions
  function shuffle<T>(arr: T[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  const qNums = shuffle(Array.from({ length: 12 }, (_, i) => i + 1));
  // mutate questionTypes to assign labels Qn from shuffled numbers
  for (const qt of questionTypes) {
    for (const qq of qt.questions) {
      const n = qNums.shift();
      qq.label = `Q${n}`;
    }
  }

  // question modal state
  let qModalOpen = false;
  let qModalTitle = "";
  let qModalQuestions = [] as Array<{ label: string; parts: number[] }>;
  function openQuestionModal(idx: number) {
    qModalTitle = questionTypes[idx].label;
    qModalQuestions = questionTypes[idx].questions.map((x) => ({
      label: x.label,
      parts: x.parts,
    }));
    qModalOpen = true;
  }
  function closeQuestionModal() {
    qModalOpen = false;
    qModalQuestions = [];
    qModalTitle = "";
  }

  const debate = {
    title:
      'Debate: "Humans should stop all development near wildlife habitats"',
    left: { name: "Vio", pct: 58 },
    right: { name: "Mint", pct: 42 },
  };

  const creative = [
    { label: "Rescue the sea turtle", pct: 45 },
    { label: "Report the pollution", pct: 32 },
    { label: "Organise a clean-up", pct: 23 },
  ];

  const reflectionSummary =
    "Most students identify littering and plastic as harmful; several reflections describe effects without explaining the mechanism (missing ingestion pathway).";

  const students = [
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

  let modalOpen = false;
  let filterGroup: string | null = null;
  $: filtered = filterGroup
    ? students.filter((s) => s.group === filterGroup)
    : students;
  let selectedStudent = null;
  let showTranscript = false;
  function openModal(group: string | null = null) {
    modalOpen = true;
    filterGroup = group;
    selectedStudent = null;
    showTranscript = false;
  }
  function closeModal() {
    modalOpen = false;
    filterGroup = null;
    selectedStudent = null;
    showTranscript = false;
  }
  function selectStudent(i: number) {
    selectedStudent = filtered[i];
    showTranscript = false;
  }
  function toggleTranscript() {
    showTranscript = !showTranscript;
  }
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
        <span>Completed yesterday · 10 students</span>
        <span class="rounded-full bg-rose-100 px-3 py-1 text-rose-700 text-xs"
          >Planning mode</span
        >
      </div>
    </header>

    <div class="grid gap-3 md:grid-cols-4 mb-4">
      {#each stats as s}
        <div class="rounded-lg border border-slate-200 bg-white p-3">
          <div class="text-xs text-slate-500">{s.label}</div>
          <div class="mt-2 text-2xl font-semibold text-slate-900">
            {s.value}
          </div>
          {#if s.note}
            <div
              class="mt-1 text-xs text-slate-500"
              class:text-rose-600={s.accent}
            >
              {s.note}
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <section class="grid gap-4 lg:grid-cols-2">
      <div class="space-y-4">
        <div class="rounded-lg border border-slate-200 bg-white p-4">
          <h2 class="text-sm font-semibold text-slate-900">
            Question type breakdown
          </h2>
          <div class="mt-4 space-y-4">
            {#each questionTypes as q, idx}
              <div>
                <div
                  class="flex items-center justify-between text-xs text-slate-500 mb-2"
                >
                  <div>{q.label}</div>
                  <button
                    on:click={() => openQuestionModal(idx)}
                    class="text-xs text-slate-600">Show details</button
                  >
                </div>
                <div
                  class="h-3 w-full rounded-full bg-slate-100 overflow-hidden"
                >
                  <div
                    style="width:{q.parts[0]}%"
                    class="h-full bg-sky-300 float-left"
                  ></div>
                  <div
                    style="width:{q.parts[1]}%"
                    class="h-full bg-amber-200 float-left"
                  ></div>
                  <div
                    style="width:{q.parts[2]}%"
                    class="h-full bg-rose-200 float-left"
                  ></div>
                </div>
              </div>
            {/each}
          </div>

          <div class="mt-4 rounded border border-slate-100 p-3 bg-white">
            <div class="text-sm text-slate-700 mb-2">{debate.title}</div>
            <div class="flex items-center gap-3">
              <div class="flex-1 rounded-full bg-slate-100 p-1">
                <div
                  class="h-6 rounded-full bg-sky-300 inline-block"
                  style="width:{debate.left.pct}%"
                ></div>
                <div
                  class="h-6 rounded-full bg-emerald-300 inline-block float-right"
                  style="width:{debate.right.pct}%"
                ></div>
              </div>
            </div>
            <div class="mt-2 flex justify-between text-xs text-slate-500">
              <div class="px-2 py-1 rounded text-sky-700 bg-sky-100/60">
                {debate.left.name}
                {debate.left.pct}%
              </div>
              <div class="px-2 py-1 rounded text-emerald-700 bg-emerald-100/60">
                {debate.right.name}
                {debate.right.pct}%
              </div>
            </div>
          </div>

          <div class="mt-4">
            <h3 class="text-sm font-semibold text-slate-900 mb-2">
              Creative story: which path did students take?
            </h3>
            <div class="space-y-3">
              {#each creative as c}
                <div>
                  <div
                    class="flex items-center justify-between text-sm text-slate-700"
                  >
                    <div class="w-2/3">{c.label}</div>
                    <div class="w-1/3 text-right text-slate-500">{c.pct}%</div>
                  </div>
                  <div class="h-2 w-full rounded-full bg-slate-100 mt-1">
                    <div
                      class="h-2 rounded-full bg-violet-300"
                      style="width:{c.pct}%"
                    ></div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="rounded-lg border border-slate-200 bg-white p-4">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold">Reflection theme summary</h2>
            <a href="#" class="text-xs text-slate-400 underline"
              >how generated?</a
            >
          </div>
          <div
            class="mt-3 rounded p-3 bg-white text-sm text-slate-700 border border-slate-100"
          >
            {reflectionSummary}
          </div>
          <div class="mt-3 flex gap-2">
            <button
              on:click={() => openModal()}
              class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 bg-white"
              >See all {students.length} reflections</button
            >

            <button
              class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 bg-white"
              >Override summary</button
            >
          </div>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-4">
          <h2 class="text-sm font-semibold">
            Student groups — quant + reflection
          </h2>
          <div class="mt-3 space-y-3">
            <div
              class="rounded p-3 bg-slate-50 border border-slate-100 flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between">
                  <div
                    class="text-xs text-rose-700 inline-block bg-rose-100 px-2 py-1 rounded"
                  >
                    Group A
                  </div>
                  <div class="text-sm text-slate-600">
                    {students.filter((s) => s.group === "A").length} students
                  </div>
                </div>
                <div class="mt-3 text-sm text-slate-700">
                  Low score + error in reflection — Scores below 55%. Need
                  re-teaching.
                </div>
              </div>
              <div class="mt-4">
                <button
                  on:click={() => openModal("A")}
                  class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 bg-white"
                  >Show students</button
                >
              </div>
            </div>

            <div
              class="rounded p-3 bg-slate-50 border border-slate-100 flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between">
                  <div
                    class="text-xs text-indigo-700 inline-block bg-indigo-100 px-2 py-1 rounded"
                  >
                    Group B
                  </div>
                  <div class="text-sm text-slate-600">
                    {students.filter((s) => s.group === "B").length} students
                  </div>
                </div>
                <div class="mt-3 text-sm text-slate-700">
                  High score, surface reflection — 80%+. Needs metacognitive
                  prompting.
                </div>
              </div>
              <div class="mt-4">
                <button
                  on:click={() => openModal("B")}
                  class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 bg-white"
                  >Show students</button
                >
              </div>
            </div>

            <div
              class="rounded p-3 bg-slate-50 border border-slate-100 flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between">
                  <div
                    class="text-xs text-emerald-700 inline-block bg-emerald-100 px-2 py-1 rounded"
                  >
                    Group C
                  </div>
                  <div class="text-sm text-slate-600">
                    {students.filter((s) => s.group === "C").length} students
                  </div>
                </div>
                <div class="mt-3 text-sm text-slate-700">
                  Strong score + rich reflection — Scores 80%+. Reflections show
                  specific mechanisms and personal connections.
                </div>
              </div>
              <div class="mt-4">
                <button
                  on:click={() => openModal("C")}
                  class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 bg-white"
                  >Show students</button
                >
              </div>
            </div>

            <div
              class="rounded p-3 bg-slate-50 border border-slate-100 flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between">
                  <div
                    class="text-xs text-yellow-700 inline-block bg-yellow-100 px-2 py-1 rounded"
                  >
                    Group D
                  </div>
                  <div class="text-sm text-slate-600">
                    {students.filter((s) => s.group === "D").length} students
                  </div>
                </div>
                <div class="mt-3 text-sm text-slate-700">
                  Mixed performance — Some correct answers but shallow
                  reflections. Recommend targeted prompts.
                </div>
              </div>
              <div class="mt-4">
                <button
                  on:click={() => openModal("D")}
                  class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 bg-white"
                  >Show students</button
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  {#if modalOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" on:click={closeModal}></div>
      <div
        class="relative z-10 w-[90%] max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div class="flex">
          <div
            class="w-1/3 border-r border-slate-100 max-h-[70vh] overflow-auto"
          >
            <div class="p-4 text-sm font-semibold">
              Reflections ({filtered.length})
            </div>
            {#each filtered as st, i}
              <button
                on:click={() => selectStudent(i)}
                class="w-full text-left p-3 hover:bg-slate-50 border-t border-slate-100"
              >
                <div class="text-sm text-slate-800">{st.name}</div>
                <div class="text-xs text-slate-500 mt-1">{st.summary}</div>
              </button>
            {/each}
          </div>

          <div class="w-2/3 p-4">
            <div class="flex items-start justify-between">
              <div>
                {#if selectedStudent}
                  <div class="text-base font-semibold">
                    {selectedStudent.name}
                  </div>
                  <div class="text-sm text-slate-600 mt-1">
                    {selectedStudent.summary}
                  </div>
                {:else}
                  <div class="text-base font-semibold">Select a student</div>
                  <div class="text-sm text-slate-600 mt-1">
                    Choose a student to view full reflection.
                  </div>
                {/if}
              </div>
              <div>
                <button
                  on:click={closeModal}
                  class="text-xs px-2 py-1 bg-slate-100 rounded">Close</button
                >
              </div>
            </div>

            {#if selectedStudent}
              <div class="mt-4">
                <div class="text-sm text-slate-700">Summary</div>
                <div class="mt-2 text-sm text-slate-800">
                  {selectedStudent.summary}
                </div>
                <div class="mt-4">
                  <button
                    on:click={toggleTranscript}
                    class="rounded-full border border-slate-200 px-3 py-1 text-xs"
                    >{showTranscript
                      ? "Hide transcript"
                      : "Show transcript"}</button
                  >
                </div>
                {#if showTranscript}
                  <pre
                    class="mt-3 p-3 bg-slate-50 text-sm text-slate-700 rounded max-h-48 overflow-auto">{selectedStudent.transcript}</pre>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
  {#if qModalOpen}
    <div class="fixed inset-0 z-60 flex items-center justify-center">
      <div
        class="absolute inset-0 bg-black/40"
        on:click={closeQuestionModal}
      ></div>
      <div
        class="relative z-70 w-[90%] max-w-2xl bg-white rounded-lg shadow-lg overflow-auto max-h-[80vh]"
      >
        <div
          class="p-4 border-b border-slate-100 flex items-center justify-between"
        >
          <div class="text-sm font-semibold">{qModalTitle}</div>
          <button
            on:click={closeQuestionModal}
            class="text-xs px-2 py-1 bg-slate-100 rounded">Close</button
          >
        </div>
        <div class="p-4 space-y-3">
          {#each qModalQuestions as qq}
            <div class="rounded border border-slate-100 bg-slate-50 p-3">
              <div
                class="flex items-center justify-between text-xs text-slate-700 mb-2"
              >
                <div>{qq.label}</div>
                <div class="text-xs text-slate-600">
                  {qq.parts[0]}% · {qq.parts[1]}% · {qq.parts[2]}%
                </div>
              </div>
              <div class="h-3 w-full rounded-full bg-white overflow-hidden">
                <div
                  style="width:{qq.parts[0]}%"
                  class="h-full bg-sky-300 float-left"
                ></div>
                <div
                  style="width:{qq.parts[1]}%"
                  class="h-full bg-amber-200 float-left"
                ></div>
                <div
                  style="width:{qq.parts[2]}%"
                  class="h-full bg-rose-200 float-left"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</main>
