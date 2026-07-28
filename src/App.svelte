<!-- App.svelte: application root — contains shared data and passes it to child components.
     Components: MainStats, QuestionBreakdown, StudentGroups -->
<script lang="ts">
  import MainStats from "./lib/MainStats.svelte";
  import QuestionBreakdown from "./lib/QuestionBreakdown.svelte";
  import StudentGroups from "./lib/Groups.svelte";

  export const questionTypes = [
    {
      label: "True / False (3 questions)",
      parts: [55, 25, 20],
      questions: [
        {
          parts: [62, 20, 18],
          question: "Sea turtles can mistake plastic bags for jellyfish.",
          options: ["True", "False"],
          answer: "True",
        },
        {
          parts: [57, 25, 18],
          question: "Fish can get sick from eating tiny pieces of plastic.",
          options: ["True", "False"],
          answer: "True",
        },
        {
          parts: [31, 34, 35],
          question: "All plastic in the ocean sinks straight to the bottom.",
          options: ["True", "False"],
          answer: "False",
        },
      ],
    },
    {
      label: "Multiple choice (4 questions)",
      parts: [70, 20, 10],
      questions: [
        {
          parts: [78, 15, 7],
          question: "What are tiny broken-down pieces of plastic called?",
          options: ["Microplastics", "Nanofish", "Plastic dust", "Sea sand"],
          answer: "Microplastics",
        },
        {
          parts: [65, 20, 15],
          question:
            "Which of these animals is most likely to mistake a plastic bag for food?",
          options: ["Sea turtle", "Eagle", "Rabbit", "Squirrel"],
          answer: "Sea turtle",
        },
        {
          parts: [70, 18, 12],
          question:
            "What happens when a small fish eats plastic and a bigger fish eats that small fish?",
          options: [
            "The plastic disappears",
            "The plastic passes up the food chain",
            "The bigger fish becomes healthier",
            "Nothing happens",
          ],
          answer: "The plastic passes up the food chain",
        },
        {
          parts: [67, 27, 6],
          question: "What is the best way to stop plastic ending up in the ocean?",
          options: [
            "Burn it at the beach",
            "Throw it further inland",
            "Reduce, reuse, and recycle it properly",
            "Bury it in the sand",
          ],
          answer: "Reduce, reuse, and recycle it properly",
        },
      ],
    },
    {
      label: "Fill in blanks (2 questions)",
      parts: [58, 28, 14],
      questions: [
        {
          parts: [60, 25, 15],
          question: "Plastic bags can look like ______ to a hungry sea turtle.",
          options: ["jellyfish", "seaweed", "coral", "sand"],
          answer: "jellyfish",
        },
        {
          parts: [56, 31, 13],
          question:
            "When plastic breaks into very small pieces, we call it ______.",
          options: ["microplastic", "macroplastic", "nanofish", "plastic dust"],
          answer: "microplastic",
        },
      ],
    },
    {
      label: "Drag & drop (2 questions)",
      parts: [72, 20, 8],
      questions: [
        {
          parts: [74, 18, 8],
          question: "Drag each item to where it most commonly ends up in the ocean.",
          options: [
            "Plastic bottle → floating on the surface",
            "Fishing net → tangled around coral",
            "Plastic bag → drifting near the seabed",
          ],
        },
        {
          parts: [70, 22, 8],
          question:
            "Drag each animal to the food chain step where it is most at risk from eating plastic.",
          options: [
            "Plankton → eats microplastics directly",
            "Small fish → eats plankton with plastic inside",
            "Seabird → eats fish with plastic inside",
          ],
        },
      ],
    },
    {
      label: "Sorting (1 question)",
      parts: [66, 24, 10],
      questions: [
        {
          parts: [66, 24, 10],
          question:
            "Put these in order from least harmful to most harmful for ocean animals.",
          options: [
            "Litter left on the beach",
            "Plastic bag floating in the sea",
            "Plastic bag eaten by a turtle",
          ],
        },
      ],
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

  // Theme: two color systems.
  // 1) Semantic (correct/retry/incorrect) for anything scoring right vs wrong.
  // 2) Categorical colors for data with no right/wrong answer — creative
  //    paths, debate sides. Purple/amber/sky, matching the app's pastel
  //    accent palette rather than a single-hue ramp.
  export const themeColors = {
    correct: "#10b981", // emerald-500
    retry: "#f59e0b", // amber-500
    incorrect: "#f43f5e", // rose-500
    categoryA: "#a855f7", // accent-500 (purple) — debate "Vio"
    categoryB: "#10b981", // emerald-500 — debate "Mint"
    pastelPalette: ["#a855f7", "#f59e0b", "#38bdf8"],
  };

  // Shared accent-ramp palette used across all creative pie charts (from theme)
  const creativePalette = themeColors.pastelPalette;

  // Four creative path questions; each has three path-option percentages
  // All use the same soft pastel palette for consistency
  export const creative = [
    { label: "You are at the park and see a plastic juice bottle on the grass near a duck pond. What do you do?", parts: [45, 32, 23], colors: creativePalette },
    // { label: "You want to help the ocean animals. Which change to your school lunch would make the biggest difference?", parts: [30, 40, 30], colors: creativePalette },
    // { label: "Path Q3", parts: [25, 50, 25], colors: creativePalette },
    // { label: "Path Q4", parts: [60, 20, 20], colors: creativePalette },
  ];
  const creativeOptionLabels = [
    "Pick it up and put it in a bin",
    "Tell a friend to help you pick it up",
    "Leave it because it's not your trash",
  ];

  export const debate = {
    title:
      'Topic: "Humans should stop all development near wildlife habitats"',
    left: {
      name: "Vio",
      pct: 58,
      stance:
        "Protect habitat first: slow development, avoid fragmentation, and keep wildlife corridors open.",
      students: ["Finn D.", "Amara K.", "Priya N.", "Luca B.", "Sofia M."],
    },
    right: {
      name: "Mint",
      pct: 42,
      stance:
        "Development can continue if it is carefully managed with mitigation and planning.",
      students: ["Omar S.", "Noah R.", "James T.", "Yara H.", "Lina P."],
    },
  };

  // Individual quiz answers, debate side, and creative-story pick aren't
  // tracked per student either — only class-wide aggregates exist (the
  // percentages shown in Question type breakdown / Creative story). Generate
  // each student's individual results deterministically so they're stable
  // across renders and roughly consistent with those aggregate percentages,
  // rather than genuinely random.
  function hashOf(...parts: string[]): number {
    return parts
      .join("|")
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  }

  function getDebateSide(name: string): string | null {
    if (debate.left.students.includes(name)) return debate.left.name;
    if (debate.right.students.includes(name)) return debate.right.name;
    return null;
  }

  function pickCreativeChoice(name: string): string {
    const [p0, p1] = creative[0]?.parts ?? [45, 32, 23];
    const roll = hashOf(name, "creative") % 100;
    if (roll < p0) return creativeOptionLabels[0];
    if (roll < p0 + p1) return creativeOptionLabels[1];
    return creativeOptionLabels[2];
  }

  // Individual quiz accuracy also isn't tracked per student — only the
  // class-wide per-question percentages exist (used for the aggregate bars
  // in Question type breakdown). For an individual student's 12 answers, use
  // their GROUP's known performance band instead of the class-wide numbers,
  // so a Group A student (quiz score below 55%) actually shows mostly wrong
  // answers rather than drifting toward the class average.
  const groupQuizParts: Record<string, [number, number, number]> = {
    A: [20, 25, 55], // below 55% combined correct
    B: [55, 30, 15], // 80%+ combined correct
    C: [60, 30, 10], // scored well, slightly ahead of B
    D: [35, 30, 35], // mixed
  };

  function pickOutcome(
    name: string,
    questionKey: string,
    parts: number[],
  ): "correct" | "retry" | "wrong" {
    const [p0, p1] = parts;
    const roll = hashOf(name, questionKey) % 100;
    if (roll < p0) return "correct";
    if (roll < p0 + p1) return "retry";
    return "wrong";
  }

  function computeQuizAnswers(name: string, group: string) {
    const parts = groupQuizParts[group] ?? [40, 30, 30];
    return questionTypes.flatMap((qt: any) =>
      qt.questions.map((q: any) => ({
        typeLabel: qt.label as string,
        qLabel: q.label as string,
        question: (q.question as string) ?? "",
        outcome: pickOutcome(name, `${q.label}-${q.question}`, parts),
      })),
    );
  }

  export const students = [
    {
      name: "Finn D.",
      group: "A",
      summary: "Names that plastic hurts fish and turtles, but doesn't explain why or how it happens.",
      transcript: `Sparkli: What did you learn about plastic and ocean animals today?
Finn: plastic is bad for the fish and the turtles get stuck in bags
Sparkli: Why do you think that happens?
Finn: i dont know it just happens i think`,
    },
    {
      name: "Omar S.",
      group: "A",
      summary: "Reflection is blank of real content: it just says the work was finished, with nothing about the expedition itself.",
      transcript: `Sparkli: What did you learn about plastic and ocean animals today?
Omar: it was ok i finished
Sparkli: Can you tell me one thing that happens to the animals?
Omar: um i dont remember`,
    },
    {
      name: "Noah R.",
      group: "B",
      summary: "Reflection doesn't mention anything from the expedition: just a brief comment that the task was done.",
      transcript: `Sparkli: What did you learn about plastic and ocean animals today?
Noah: it was good i did it
Sparkli: What happens to the animals when there is plastic in the sea?
Noah: i dont know sorry`,
    },
    {
      name: "Amara K.",
      group: "B",
      summary: "Suggests picking up litter at the beach, but doesn't explain why it matters or what happens if it's left.",
      transcript: `Sparkli: What did you learn about plastic and ocean animals today?
Amara: we should pick up litter at the beach
Sparkli: Why do you think picking up litter helps?
Amara: because its yucky and its good to pick it up`,
    },
    {
      name: "James T.",
      group: "B",
      summary: "Reflection is just two words and doesn't reference anything from the expedition.",
      transcript: `Sparkli: What did you learn about plastic and ocean animals today?
James: it was fine
Sparkli: Can you tell me anything about the animals and the plastic?
James: not really sorry`,
    },
    {
      name: "Luca B.",
      group: "C",
      summary: "Explains that fish mistake plastic for food and get it stuck inside them, ties it to his nan's beach cleanups, and notes he hadn't realized plastic actually gets stuck inside fish before.",
      transcript: `Sparkli: What did you learn about plastic and ocean animals today?
Luca: the fish eat the plastic because they think its food and it gets stuck inside them and makes them really sick
Sparkli: Have you heard about this before?
Luca: yeah my nan does beach cleanups but i didnt know it actually got stuck inside the fish thats so sad`,
    },
    {
      name: "Priya N.",
      group: "C",
      summary: "Explains how plastic breaks down and moves up the food chain from small fish to bigger ones, and reflects that she hadn't realized it could reach animals as large as whales.",
      transcript: `Sparkli: What did you learn about plastic and ocean animals today?
Priya: the plastic breaks into tiny tiny pieces and the small fish eat it and then bigger fish eat the small fish so the plastic goes up the whole chain
Sparkli: Did you know about this before?
Priya: i knew this happened before but i didnt realise it could go all the way up to whales thats scary`,
    },
    {
      name: "Yara H.",
      group: "C",
      summary: "Explains that turtles mistake plastic bags for jellyfish and get sick from eating them, and reflects that she hadn't realized how many turtles are affected.",
      transcript: `Sparkli: What did you learn about plastic and ocean animals today?
Yara: sea turtles eat plastic bags because they think they look like jellyfish and it makes them really really sick
Sparkli: Had you heard about this before?
Yara: i saw something about this before but i didnt know how many turtles actually got hurt by it thats so sad`,
    },
    {
      name: "Sofia M.",
      group: "D",
      summary: "Explains how microplastics enter the water and get eaten by small fish, and notes she hadn't realized plastic could break down into pieces that small.",
      transcript: `Sparkli: What did you learn about plastic and ocean animals today?
Sofia: microplastics get into the water and the little fish eat them without even knowing and then they get sick
Sparkli: Is there anything that surprised you?
Sofia: i didnt know plastic could break into pieces that tiny until we learned about it today`,
    },
    {
      name: "Lina P.",
      group: "D",
      summary: "Shares a personal observation about plastic on her local beach, but doesn't explain why it's a problem.",
      transcript: `Sparkli: What did you learn about plastic and ocean animals today?
Lina: my beach had lots of plastic on it
Sparkli: Why do you think that is a problem?
Lina: i dont know it was just there and it looked yucky`,
    },
  ].map((s) => ({
    ...s,
    debateSide: getDebateSide(s.name),
    creativeChoice: pickCreativeChoice(s.name),
    quizAnswers: computeQuizAnswers(s.name, s.group),
  }));

  // Class-wide quiz stats: hard-coded rather than derived from the
  // per-student quiz answers, since those are regenerated from a randomized
  // question order (see `shuffle` above) and would otherwise change on
  // every reload.
  export const stats = [
    {
      label: "Correct Answers - First Try",
      value: "46%",
      tone: "success",
    },
    {
      label: "Correct Answers - After Retry",
      value: "29%",
      tone: "warning",
    },
    {
      label: "Incorrect Answers",
      value: "25%",
      tone: "danger",
    },
  ];

  // Chip color maps to severity, not an arbitrary hue: danger (needs
  // re-teaching) > warning (needs more practice) > neutral (mixed) >
  // success (on track).
  export const groups = [
    {
      id: "A",
      label: "Group A: Low score",
      chipTextClass: "text-rose-700",
      chipBgClass: "bg-rose-100",
      description:
        "This group scored below 55% on the quiz.",
    },
    {
      id: "B",
      label: "Group B: High score, needed retries",
      chipTextClass: "text-amber-700",
      chipBgClass: "bg-amber-100",
      description:
        "This group scored 80%+ overall but needed several retries to get there.",
    },
    {
      id: "C",
      label: "Group C: High score, strong first attempt",
      chipTextClass: "text-emerald-700",
      chipBgClass: "bg-emerald-100",
      description:
        "This group scored well with strong first-attempt accuracy.",
    },
    {
      id: "D",
      label: "Group D: Mixed performance",
      chipTextClass: "text-slate-700",
      chipBgClass: "bg-slate-100",
      description:
        "This group has mixed quiz results across questions.",
    },
  ];

  // Helpers for student table (simple deterministic heuristics)
  function computeScore(name: string) {
    const sum = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return 50 + (sum % 46); // 50..95
  }

  function computeHints(_name: string) {
    return Math.floor(Math.random() * 3); // 0..2 (placeholder)
  }

  function computeDepth(name: string) {
    const sum = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return 2 + (sum % 4); // 2..5
  }

  function classificationLabel(s: any) {
    const txt = (s.summary || "").toLowerCase();
    if (txt.includes("surface")) return "Surface";
    if (txt.includes("error") || txt.includes("not sure")) return "Error";
    return "No issues";
  }

  function classificationClass(s: any) {
    const lab = classificationLabel(s);
    if (lab === "Error") return "text-rose-700 bg-rose-100";
    if (lab === "Surface") return "text-amber-700 bg-amber-100";
    return "text-emerald-700 bg-emerald-100";
  }

  function truncate(t: string, n: number) {
    if (!t) return "";
    return t.length > n ? t.slice(0, n - 1) + "…" : t;
  }

  let subtopics = [
    { name: "Context", score: 4 },
    { name: "Emotion", score: 5 },
    { name: "Next Steps", score: 3 }
  ];
</script>

<main class="app-canvas min-h-screen text-slate-800 p-6 md:p-8">
  <div class="mx-auto max-w-6xl">

    <header class="mb-6 flex flex-col sm:flex-row gap-3">
      <div
        class="flex-1 flex items-center gap-3.5 rounded-full pl-2.5 pr-5 py-2 shadow-lg shadow-accent-200/40"
        style="background: linear-gradient(100deg, #FDE68A 0%, #F9A8D4 45%, #C4B5FD 100%);"
      >
        <div class="w-11 h-11 rounded-full bg-white flex items-center justify-center text-xl shadow-sm shrink-0">🌿</div>
        <h1 class="font-display text-lg font-bold text-violet-950">
          Nature's Wonderful Animals
        </h1>
        <span class="ml-auto shrink-0 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-violet-800">Expedition review</span>
      </div>
      <div class="flex gap-2.5 shrink-0">
        <div class="flex items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-500 shadow-sm">Completed yesterday</div>
        <div class="flex items-center rounded-full border-2 border-slate-900 px-4 text-sm font-bold text-slate-900" style="background: linear-gradient(120deg, #FBCFE8, #E9D5FF);">{students.length} / {students.length} students</div>
      </div>
    </header>

    <MainStats {stats} />

    <!-- Question type breakdown next to Student groups -->
    <section class="mt-6 mb-6 grid gap-6 lg:grid-cols-2">
      <div>
        <QuestionBreakdown
          {questionTypes}
          {creative}
          {themeColors}
          {debate}
          {students}
        />
      </div>
      <div>
        <StudentGroups
          {students}
          {groups}
          {debate}
          {creative}
        />
      </div>
    </section>
  </div>
</main>
