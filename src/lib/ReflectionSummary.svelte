<!-- ReflectionSummary.svelte: shows the reflection summary and provides an
     internal modal to view all student reflections. -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let reflectionSummary: string = "";
  export let students: Array<{
    name: string;
    summary: string;
    transcript: string;
    score?: number;
  }> = [];
  export let rubricOpen = false;

  const dispatch = createEventDispatcher<{ closeRubric: void }>();

  type ModalMode = "students" | "rubric" | "generated" | null;

  const generatedSummaryNotes = [
    "This summary was written by Sparkli's AI based on the reflections your students submitted at the end of the expedition. It identifies the most common themes and gaps across all submitted reflections.",
  ];

  const generatedSummaryBullets = [
    "Concepts students mentioned most often",
    "Explanations students gave versus concepts they only named",
    "Ideas that appeared in the expedition but were missing from most reflections",
  ];

  const reflectionRubric = [
    {
      score: "1",
      rating: "No reflection",
      characteristics:
        "No meaningful content about the expedition. Blank, single word, off-topic, or only says they finished.",
      examples: ["good", "it was ok i finished"],
    },
    {
      score: "2",
      rating: "Naming only",
      characteristics:
        "Names something from the expedition with no explanation of why, how, or what it means.",
      examples: ["gravity pulls things down", "Earth is round because of gravity"],
    },
    {
      score: "3",
      rating: "Explaining",
      characteristics:
        "Gives a reason or simple cause-effect chain using because, so, or that's why.",
      examples: [
        "asteroids stay lumpy because they dont have enough mass so their gravity is too weak to pull them into a ball",
        "the rock gets pulled to the middle from every side so it squashes into a sphere",
      ],
    },
    {
      score: "4",
      rating: "Explaining + personal connection or self-awareness",
      characteristics:
        "Explains a cause-effect chain and also connects it to prior knowledge, a real example, or what they did not know before.",
      examples: [
        "I knew big planets had more gravity from a space book, but I didnt know it pulled them into a sphere",
        "we watched a video about astronauts floating and I didnt realise down just means towards the centre",
      ],
    },
    {
      score: "5",
      rating: "Explaining + personal connection AND self-awareness",
      characteristics:
        "Explains the mechanism, connects it to personal experience or prior knowledge, and names something they now understand or are still wondering about.",
      examples: [
        "I knew the Earth was round from globes at school, but I didnt understand it was gravity pulling all the mass inward until now",
        "I knew gravity made things fall, but Im still wondering why the gas planets go round too when theyre not solid",
      ],
    },
  ];

  const criticalReflectionExamples = [
    "is it fair to take the planet name away from something just because its small",
    "who actually gets to decide what counts as a planet",
  ];

  type RubricPage = "explanation" | "table";

  let modalMode: ModalMode = null;
  let selectedIndex: number | null = null;
  let showTranscript = false;
  let rubricPage: RubricPage = "explanation";

  $: if (rubricOpen && modalMode !== "students") {
    modalMode = "rubric";
  }

  function openModal() {
    modalMode = "students";
    selectedIndex = null;
    showTranscript = false;
  }
  function openRubric() {
    modalMode = "rubric";
    rubricPage = "explanation";
    selectedIndex = null;
    showTranscript = false;
  }
  function openGenerated() {
    modalMode = "generated";
    selectedIndex = null;
    showTranscript = false;
  }
  function viewRubricTable() {
    rubricPage = "table";
  }
  function backToExplanation() {
    rubricPage = "explanation";
  }
  function closeModal() {
    if (modalMode === "rubric") {
      dispatch("closeRubric");
    }
    modalMode = null;
    rubricPage = "explanation";
    selectedIndex = null;
    showTranscript = false;
  }
  function selectStudent(i: number) {
    selectedIndex = i;
    showTranscript = false;
  }
  function toggleTranscript() {
    showTranscript = !showTranscript;
  }
</script>

<div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
  <div class="flex items-center justify-between">
    <h2 class="font-display text-lg font-bold text-slate-900">Reflection theme summary</h2>
    <button on:click={openGenerated} class="text-xs font-bold text-accent-600 underline underline-offset-2 hover:text-accent-700">
      how generated?
    </button>
  </div>
  <div
    class="mt-3 rounded-2xl p-4 bg-accent-50/60 text-sm text-slate-700 border border-accent-100"
  >
    {reflectionSummary}
  </div>
  <div class="mt-3 flex gap-2">
    <button
      on:click={openModal}
      class="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300"
      >See all {students.length} reflections</button
    >
  </div>

  {#if modalMode}
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div
        class="absolute inset-0 bg-black/40"
        role="button"
        tabindex="0"
        aria-label="Close modal"
        on:click={closeModal}
        on:keydown={(e) => {
          if (e.key === "Enter" || e.key === " ") closeModal();
        }}
      ></div>
      <div
        class="relative z-10 w-[90%] max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden max-h-[80vh]"
      >
        <div
          class="flex items-center justify-between border-b border-slate-200 p-4"
        >
          <div>
            <div class="font-display text-base font-bold text-slate-900">
              {#if modalMode === "students"}
                Reflections ({students.length})
              {:else if modalMode === "rubric"}
                Reflection depth score
              {:else}
                How the reflection summary was generated
              {/if}
            </div>
            <div class="text-xs text-slate-500 mt-1">
              {#if modalMode === "students"}
                Select a student to view the full reflection.
              {:else if modalMode === "rubric" && rubricPage === "explanation"}
                Explanation of the reflection depth score.
              {:else if modalMode === "rubric"}
                Rubric to explain how the reflection depth score is assigned.
              {:else}
                Sparkli's AI summary notes and the signals it looked for.
              {/if}
            </div>
          </div>
          <button
            on:click={closeModal}
            class="text-xs font-bold px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 shrink-0">Close</button
          >
        </div>

        {#if modalMode === "students"}
          <div class="flex">
            <div
              class="w-1/3 border-r border-accent-100 bg-accent-50/30 max-h-[calc(80vh-73px)] overflow-auto p-2 space-y-1"
            >
              {#each students as st, i}
                <button
                  on:click={() => selectStudent(i)}
                  class="w-full text-left p-3 rounded-2xl transition-colors {selectedIndex === i ? 'bg-white shadow-sm ring-1 ring-accent-200' : 'hover:bg-white/70'}"
                >
                  <div class="flex items-center justify-between gap-2">
                    <div class="text-sm font-medium text-slate-800">{st.name}</div>
                    {#if st.score}
                      <span class="font-display shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent-100 text-accent-700 text-xs font-bold">{st.score}</span>
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
            <div class="w-2/3 p-5 max-h-[calc(80vh-73px)] overflow-auto">
              <div class="flex items-start justify-between">
                <div>
                  {#if selectedIndex !== null}
                    <div class="flex items-center gap-2.5">
                      <div class="font-display text-lg font-bold text-slate-900">
                        {students[selectedIndex].name}
                      </div>
                      {#if students[selectedIndex].score}
                        <span class="font-display inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent-100 text-accent-700 font-bold text-sm shrink-0">{students[selectedIndex].score}</span>
                      {/if}
                    </div>
                  {:else}
                    <div class="font-display text-lg font-bold text-slate-900">Select a student</div>
                    <div class="text-sm text-slate-600 mt-1">
                      Choose a student to view full reflection.
                    </div>
                  {/if}
                </div>
              </div>

              {#if selectedIndex !== null}
                <div class="mt-4">
                  <div class="text-sm font-bold text-slate-700">Summary</div>
                  <div class="mt-2 text-sm text-slate-800">
                    {students[selectedIndex].summary}
                  </div>
                  <div class="mt-4">
                    <button
                      on:click={toggleTranscript}
                      class="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >{showTranscript
                        ? "Hide transcript"
                        : "Show transcript"}</button
                    >
                  </div>
                  {#if showTranscript}
                    <pre
                      class="mt-3 p-4 bg-accent-50/60 border border-accent-100 text-sm text-slate-700 rounded-2xl whitespace-pre-wrap break-words">{students[
                        selectedIndex
                      ].transcript}</pre>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        {:else if modalMode === "rubric" && rubricPage === "explanation"}
          <div class="max-h-[calc(80vh-73px)] overflow-auto p-5 space-y-5">
            <div class="text-sm text-slate-700">
              The class scored <span class="font-bold text-accent-700">2.8/5</span> on their reflections.
            </div>

            <div class="rounded-2xl border border-accent-100 bg-accent-50/50 p-4">
              <div class="text-xs font-bold uppercase tracking-wide text-accent-700 mb-1.5">The core gap</div>
              <div class="text-sm text-slate-700">Most reflections cluster around one gap: students can say that Earth is round and that gravity is involved, but far fewer can explain the mechanism. A line like "gravity pulls it down" or "Earth is round because of gravity" shows awareness without the chain; the student hasn't connected mass to gravity, gravity to a pull toward the center from every direction, and that pull to the object being squeezed into a sphere.</div>
            </div>

            <div class="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <div class="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-1.5">What separates high scores from low ones</div>
              <div class="text-sm text-slate-700">The strongest reflections share a consistent structure: they name the mechanism, link it to something the student already knew (a family habit, a video, an earlier lesson), and flag something new they've realized. That combination, not just recall, is what pushes a score up.</div>
            </div>

            <div class="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
              <div class="text-xs font-bold uppercase tracking-wide text-amber-700 mb-1.5">A pattern worth noting</div>
              <div class="text-sm text-slate-700">A few students who scored well on the quiz still wrote blank or near-blank reflections. That gap looks less like a lack of understanding, and more like difficulty translating what they know into a written explanation.</div>
            </div>
            <button
              on:click={viewRubricTable}
              class="text-xs font-bold px-4 py-2 text-white rounded-full shadow-md shadow-accent-300/40 hover:opacity-90"
              style="background: linear-gradient(100deg, #A855F7, #EC4899);"
            >
              View rubric
            </button>
          </div>
        {:else if modalMode === "rubric"}
          <div class="max-h-[calc(80vh-73px)] overflow-auto p-5 space-y-6">
            <button
              on:click={backToExplanation}
              class="text-xs font-bold text-accent-600 hover:text-accent-700"
            >
              ← Back to explanation
            </button>
            <div class="overflow-hidden rounded-2xl border border-slate-200">
              <table class="w-full text-left text-sm">
                <thead
                  class="bg-accent-50/60 text-xs uppercase tracking-wide text-slate-500"
                >
                  <tr>
                    <th class="px-4 py-3">Rating</th>
                    <th class="px-4 py-3">Characteristics</th>
                    <th class="px-4 py-3">Examples</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                  {#each reflectionRubric as row}
                    <tr class="align-top">
                      <td class="px-4 py-4 w-24">
                        <span class="font-display inline-flex items-center justify-center w-9 h-9 rounded-full bg-accent-100 text-accent-700 font-bold">
                          {row.score}
                        </span>
                        <div class="mt-1.5 text-xs font-medium text-slate-700">
                          {row.rating}
                        </div>
                      </td>
                      <td class="px-4 py-4 text-slate-700">
                        {row.characteristics}
                      </td>
                      <td class="px-4 py-4 text-slate-700">
                        <ul class="space-y-1 list-disc pl-4">
                          {#each row.examples as example}
                            <li>{example}</li>
                          {/each}
                        </ul>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>

            <div class="rounded-2xl border border-accent-100 bg-accent-50/40 p-4">
              <div class="text-sm font-bold text-slate-900">
                Critical reflection flag
              </div>
              <div class="mt-2 text-sm text-slate-700">
                The <span class="font-semibold">critical reflection</span> flag is present when a student spontaneously
                raises responsibility, fairness, or whether individual action is
                enough.
              </div>
              <div class="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <div
                    class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Examples
                  </div>
                  <ul
                    class="mt-2 space-y-1 list-disc pl-4 text-sm text-slate-700"
                  >
                    {#each criticalReflectionExamples as example}
                      <li>{example}</li>
                    {/each}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        {:else}
          <div class="max-h-[calc(80vh-73px)] overflow-auto p-5 space-y-4">
            <div
              class="rounded-2xl border border-accent-100 bg-accent-50/50 p-4 text-sm text-slate-700"
            >
              {#each generatedSummaryNotes as note}
                <p>{note}</p>
              {/each}
            </div>

            <div class="rounded-2xl border border-slate-200 bg-white p-4">
              <div class="text-sm font-bold text-slate-900">
                What the AI looked for:
              </div>
              <ul class="mt-3 space-y-2 list-disc pl-5 text-sm text-slate-700">
                {#each generatedSummaryBullets as bullet}
                  <li>{bullet}</li>
                {/each}
              </ul>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
