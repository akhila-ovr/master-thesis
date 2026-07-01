<!-- ReflectionSummary.svelte: shows the reflection summary and provides an
     internal modal to view all student reflections. -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let reflectionSummary: string = "";
  export let students: Array<{
    name: string;
    summary: string;
    transcript: string;
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
      examples: ["we should not drop litter", "plastic is very bad"],
    },
    {
      score: "3",
      rating: "Explaining",
      characteristics:
        "Gives a reason or simple cause-effect chain using because, so, or that's why.",
      examples: [
        "the animals eat the plastic because they think its food and then they get sick",
        "we need to pick up litter near the sea because the animals will eat it and get really sick",
      ],
    },
    {
      score: "4",
      rating: "Explaining + personal connection or self-awareness",
      characteristics:
        "Explains a cause-effect chain and also connects it to prior knowledge, a real example, or what they did not know before.",
      examples: [
        "I already knew plastic was bad because my mum tells me to use a bag for life, but I didnt know the animals actually eat it",
        "we watched something at school about ocean pollution and I didnt realise it killed them",
      ],
    },
    {
      score: "5",
      rating: "Explaining + personal connection AND self-awareness",
      characteristics:
        "Explains the mechanism, connects it to personal experience or prior knowledge, and names something they now understand or are still wondering about.",
      examples: [
        "I knew about plastic from a documentary, but I didnt really understand why it was so bad until now",
        "I knew you had to pick up litter because my school does litter picks, but I still dont understand why they cant smell that its not real food",
      ],
    },
  ];

  const criticalReflectionExamples = [
    "why do the companies keep making plastic bags if they know its bad",
    "its not really fair that kids have to fix it when the adults made the mess",
  ];

  let modalMode: ModalMode = null;
  let selectedIndex: number | null = null;
  let showTranscript = false;

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
    selectedIndex = null;
    showTranscript = false;
  }
  function openGenerated() {
    modalMode = "generated";
    selectedIndex = null;
    showTranscript = false;
  }
  function closeModal() {
    if (modalMode === "rubric") {
      dispatch("closeRubric");
    }
    modalMode = null;
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

<div class="rounded-lg border border-slate-200 bg-white p-4">
  <div class="flex items-center justify-between">
    <h2 class="text-sm font-semibold">Reflection theme summary</h2>
    <button on:click={openGenerated} class="text-xs text-slate-400 underline">
      how generated?
    </button>
  </div>
  <div
    class="mt-3 rounded p-3 bg-white text-sm text-slate-700 border border-slate-100"
  >
    {reflectionSummary}
  </div>
  <div class="mt-3 flex gap-2">
    <button
      on:click={openModal}
      class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 bg-white"
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
        class="relative z-10 w-[90%] max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden max-h-[80vh]"
      >
        <div
          class="flex items-center justify-between border-b border-slate-100 p-4"
        >
          <div>
            <div class="text-sm font-semibold">
              {#if modalMode === "students"}
                Reflections ({students.length})
              {:else if modalMode === "rubric"}
                Reflection depth rubric
              {:else}
                How the reflection summary was generated
              {/if}
            </div>
            <div class="text-xs text-slate-500 mt-1">
              {#if modalMode === "students"}
                Select a student to view the full reflection.
              {:else if modalMode === "rubric"}
                How the reflection depth score is assigned.
              {:else}
                Sparkli's AI summary notes and the signals it looked for.
              {/if}
            </div>
          </div>
          <button
            on:click={closeModal}
            class="text-xs px-2 py-1 bg-slate-100 rounded">Close</button
          >
        </div>

        {#if modalMode === "students"}
          <div class="flex">
            <div
              class="w-1/3 border-r border-slate-100 max-h-[calc(80vh-57px)] overflow-auto"
            >
              {#each students as st, i}
                <button
                  on:click={() => selectStudent(i)}
                  class="w-full text-left p-3 hover:bg-slate-50 border-t border-slate-100"
                >
                  <div class="text-sm text-slate-800">{st.name}</div>
                  <div class="text-xs text-slate-500 mt-1">{st.summary}</div>
                </button>
              {/each}
            </div>
            <div class="w-2/3 p-4 max-h-[calc(80vh-57px)] overflow-auto">
              <div class="flex items-start justify-between">
                <div>
                  {#if selectedIndex !== null}
                    <div class="text-base font-semibold">
                      {students[selectedIndex].name}
                    </div>
                    <div class="text-sm text-slate-600 mt-1">
                      {students[selectedIndex].summary}
                    </div>
                  {:else}
                    <div class="text-base font-semibold">Select a student</div>
                    <div class="text-sm text-slate-600 mt-1">
                      Choose a student to view full reflection.
                    </div>
                  {/if}
                </div>
              </div>

              {#if selectedIndex !== null}
                <div class="mt-4">
                  <div class="text-sm text-slate-700">Summary</div>
                  <div class="mt-2 text-sm text-slate-800">
                    {students[selectedIndex].summary}
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
                      class="mt-3 p-3 bg-slate-50 text-sm text-slate-700 rounded max-h-48 overflow-auto">{students[
                        selectedIndex
                      ].transcript}</pre>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        {:else if modalMode === "rubric"}
          <div class="max-h-[calc(80vh-57px)] overflow-auto p-4 space-y-6">
            <div class="overflow-hidden rounded-lg border border-slate-200">
              <table class="w-full text-left text-sm">
                <thead
                  class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"
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
                        <div class="text-lg font-semibold text-sky-700">
                          {row.score}
                        </div>
                        <div class="mt-1 text-xs font-medium text-slate-700">
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

            <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div class="text-sm font-semibold text-slate-900">
                R4 critical reflection flag
              </div>
              <div class="mt-2 text-sm text-slate-700">
                <span class="font-semibold">R4</span> is present when a student spontaneously
                raises responsibility, fairness, or whether individual action is
                enough.
              </div>
              <div class="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <div
                    class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Present
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
          <div class="max-h-[calc(80vh-57px)] overflow-auto p-4 space-y-4">
            <div
              class="rounded-lg border border-sky-100 bg-sky-50 p-4 text-sm text-slate-700"
            >
              {#each generatedSummaryNotes as note}
                <p>{note}</p>
              {/each}
            </div>

            <div class="rounded-lg border border-slate-200 bg-white p-4">
              <div class="text-sm font-semibold text-slate-900">
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
