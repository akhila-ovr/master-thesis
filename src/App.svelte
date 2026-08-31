<!-- App.svelte: application root. Holds the shared expedition data and the
     header. The header student search (StudentSearch) is the only surface
     currently rendered; the rest of the dashboard is being rebuilt. -->
<script lang="ts">
  import StudentSearch from "./lib/StudentSearch.svelte";
  import ClassRoster from "./lib/ClassRoster.svelte";

  export const questionTypes = [
    {
      label: "True / False (3 questions)",
      parts: [55, 25, 20],
      questions: [
        {
          parts: [62, 20, 18],
          question: "Gravity pulls matter toward a central point.",
          options: ["True", "False"],
          answer: "True",
        },
        {
          parts: [57, 25, 18],
          question: "Every object with mass has its own gravitational pull.",
          options: ["True", "False"],
          answer: "True",
        },
        {
          parts: [31, 34, 35],
          question:
            "Asteroids will eventually turn into perfectly round spheres if they float in space long enough.",
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
          question: "Which statement best describes how Earth's gravity works?",
          options: [
            "Gravity pulls everything straight down toward the bottom of space",
            "Gravity pulls all matter inward toward the center core of the planet",
            "Gravity only pulls on water and air, not on solid ground",
            "Gravity pushes objects outward away from the center of the planet",
          ],
          answer:
            "Gravity pulls all matter inward toward the center core of the planet",
        },
        {
          parts: [65, 20, 15],
          question: "About how far down is the center of the Earth?",
          options: [
            "About 40 miles",
            "About 400 miles",
            "About 4,000 miles",
            "About 40,000 miles",
          ],
          answer: "About 4,000 miles",
        },
        {
          parts: [70, 18, 12],
          question: "What is the total amount of matter inside an object called?",
          options: ["Mass", "Weight", "Volume", "Speed"],
          answer: "Mass",
        },
        {
          parts: [67, 27, 6],
          question: "Why does an asteroid stay lumpy instead of becoming a sphere?",
          options: [
            "It is too cold to change shape",
            "It spins around too fast",
            "It does not have enough mass for a strong gravitational pull",
            "It is made entirely of ice",
          ],
          answer:
            "It does not have enough mass for a strong gravitational pull",
        },
      ],
    },
    {
      label: "Fill in blanks (2 questions)",
      parts: [58, 28, 14],
      questions: [
        {
          parts: [60, 25, 15],
          question: "Everything you can touch and see is made of ______.",
          options: ["matter", "gravity", "energy", "light"],
          answer: "matter",
        },
        {
          parts: [56, 31, 13],
          question:
            "This invisible force draws everything toward the ______ of the planet.",
          options: ["core", "surface", "edge", "sky"],
          answer: "core",
        },
      ],
    },
    {
      label: "Drag & drop (2 questions)",
      parts: [72, 20, 8],
      questions: [
        {
          parts: [74, 18, 8],
          question: "Drag each gravity cause to what it actually does in space.",
          options: [
            "Gathering huge amounts of matter → increases the gravitational pull",
            "Pulling equally from the center → creates a perfectly round shape",
            "Lacking enough total mass → results in a lumpy object",
            "Applying extreme gravitational pressure → bends and melts solid rock",
          ],
        },
        {
          parts: [70, 22, 8],
          question: "Drag each space object to the shape its mass gives it.",
          options: [
            "Planet Earth → round sphere",
            "A giant gas planet → round sphere",
            "A tiny asteroid → lumpy, irregular shape",
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
            "Put these in order from least mass to most mass.",
          options: [
            "Your kitchen table",
            "A tiny asteroid",
            "Planet Earth",
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
  // 2) Categorical colors for data with no right/wrong answer, e.g. creative
  //    paths, debate sides. Purple/amber/sky, matching the app's pastel
  //    accent palette rather than a single-hue ramp.
  export const themeColors = {
    correct: "#10b981", // emerald-500
    retry: "#f59e0b", // amber-500
    incorrect: "#f43f5e", // rose-500
    categoryA: "#a855f7", // accent-500 (purple), debate "Vio"
    categoryB: "#10b981", // emerald-500, debate "Mint"
    pastelPalette: ["#a855f7", "#f59e0b", "#38bdf8"],
  };

  // Shared accent-ramp palette used across all creative pie charts (from theme)
  const creativePalette = themeColors.pastelPalette;

  // Four creative path questions; each has three path-option percentages
  // All use the same soft pastel palette for consistency
  export const creative = [
    { label: "Maya and Leo are building a gravity model for the science fair to show how gravity pulls matter toward a center point. How should they build it?", parts: [46, 30, 24], colors: creativePalette },
    // { label: "Path Q2", parts: [30, 40, 30], colors: creativePalette },
    // { label: "Path Q3", parts: [25, 50, 25], colors: creativePalette },
    // { label: "Path Q4", parts: [60, 20, 20], colors: creativePalette },
  ];
  const creativeOptionLabels = [
    "Round ball base with heavy metal marbles",
    "Flat table base with metal marbles",
    "Round ball base with light paper dots",
  ];

  export const debate = {
    title:
      'Topic: "We should stop calling small space rocks planets if they are not round"',
    left: {
      name: "Vio",
      pct: 58,
      stance:
        "History and discovery matter more than labels: names carry the story of how we found each object, and taking a title away over size ignores that.",
      students: ["Finn D.", "Amara K.", "Priya N.", "Luca B.", "Sofia M."],
    },
    right: {
      name: "Mint",
      pct: 42,
      stance:
        "Science needs clear, mass-based definitions: if an object lacks the mass for gravity to pull it into a sphere, it should not be called a planet.",
      students: ["Omar S.", "Noah R.", "James T.", "Yara H.", "Lina P."],
    },
  };

  // Individual reflection depth scores (1-5, matching the reflection rubric)
  // aren't tracked per student directly, so generate them deterministically from
  // each student's group assignment (which sets the plausible score range)
  // plus a per-name hash (so scores are stable across renders, not random).
  const groupScoreRanges: Record<string, [number, number]> = {
    A: [1, 2], // low score, error in reflection
    B: [1, 2], // high score, but surface-level reflection
    C: [4, 5], // high score, rich reflection
    D: [2, 4], // mixed performance
  };

  function computeReflectionScore(name: string, group: string): number {
    const [min, max] = groupScoreRanges[group] ?? [2, 4];
    const span = max - min + 1;
    const hash = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return min + (hash % span);
  }

  // Individual quiz answers, debate side, and creative-story pick aren't
  // tracked per student either; only class-wide aggregates exist (the
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

  // Individual quiz accuracy also isn't tracked per student, just the
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
      summary: "Says gravity makes things fall, but describes it as pulling toward the ground rather than toward the planet's center.",
      transcript: `Sparkli: What did you learn about gravity today?
Finn: gravity pulls stuff down to the floor
Sparkli: Where is it pulling things to?
Finn: just down i think, i dont really know`,
    },
    {
      name: "Omar S.",
      group: "A",
      summary: "Reflection is blank of real content: it just says the work was finished, with nothing about gravity or mass.",
      transcript: `Sparkli: What did you learn about gravity today?
Omar: it was ok i finished
Sparkli: Can you tell me one thing about why Earth is round?
Omar: um i dont remember`,
    },
    {
      name: "Noah R.",
      group: "B",
      summary: "Reflection doesn't mention anything from the expedition: just a brief comment that the task was done.",
      transcript: `Sparkli: What did you learn about gravity today?
Noah: it was good i did it
Sparkli: What makes a planet round instead of lumpy?
Noah: i dont know sorry`,
    },
    {
      name: "Amara K.",
      group: "B",
      summary: "Says heavy planets have more gravity, but doesn't explain what that gravity then does or why it makes a sphere.",
      transcript: `Sparkli: What did you learn about gravity today?
Amara: big heavy planets have more gravity
Sparkli: What does that gravity actually do?
Amara: it just pulls harder i guess`,
    },
    {
      name: "James T.",
      group: "B",
      summary: "Reflection is just two words and doesn't reference anything from the expedition.",
      transcript: `Sparkli: What did you learn about gravity today?
James: it was fine
Sparkli: Can you tell me anything about mass or why Earth is round?
James: not really sorry`,
    },
    {
      name: "Luca B.",
      group: "C",
      summary: "Explains that gravity pulls all of Earth's matter toward the center from every side, ties it to a model volcano he once built, and notes he hadn't realized solid rock could bend under that pressure.",
      transcript: `Sparkli: What did you learn about gravity today?
Luca: gravity pulls all the rock towards the middle of the earth from every side so it squashes into a ball
Sparkli: Have you come across this before?
Luca: i built a model volcano once but i didnt know the rock actually bends from the pressure thats mad`,
    },
    {
      name: "Priya N.",
      group: "C",
      summary: "Explains the link between mass and gravity, more mass means a stronger inward pull, and reflects that she hadn't realized gas planets get pulled round too.",
      transcript: `Sparkli: What did you learn about gravity today?
Priya: the more mass something has the stronger its gravity so it pulls itself inwards into a sphere
Sparkli: Did you know about this before?
Priya: i knew big things had more gravity but i didnt realise even the gas planets get pulled into a ball`,
    },
    {
      name: "Yara H.",
      group: "C",
      summary: "Explains that asteroids stay lumpy because they lack the mass for strong gravity, and reflects that she used to think every space rock was round.",
      transcript: `Sparkli: What did you learn about gravity today?
Yara: asteroids are lumpy because they dont have enough mass so their gravity is too weak to pull them into a ball
Sparkli: Had you thought about this before?
Yara: i used to think all the space rocks were round like little planets so that surprised me`,
    },
    {
      name: "Sofia M.",
      group: "D",
      summary: "Explains that gravity pulls toward the center from all directions so down always points inward, but doesn't link it back to mass.",
      transcript: `Sparkli: What did you learn about gravity today?
Sofia: gravity pulls everything towards the centre of the earth from all directions so down always points to the middle
Sparkli: Is there anything that surprised you?
Sofia: i didnt know down meant the centre and not just towards the ground`,
    },
    {
      name: "Lina P.",
      group: "D",
      summary: "Shares that she saw a video of astronauts floating, but doesn't explain why gravity feels different there.",
      transcript: `Sparkli: What did you learn about gravity today?
Lina: i saw astronauts floating in a video once
Sparkli: Why do you think gravity is different for them?
Lina: i dont know they were just floating around`,
    },
  ].map((s) => ({
    ...s,
    score: computeReflectionScore(s.name, s.group),
    debateSide: getDebateSide(s.name),
    creativeChoice: pickCreativeChoice(s.name),
    quizAnswers: computeQuizAnswers(s.name, s.group),
  }));

  // Chip color maps to severity, not an arbitrary hue: danger (needs
  // re-teaching) > warning (needs deeper prompting) > neutral (mixed) >
  // success (on track).
  export const groups = [
    {
      id: "A",
      label: "Group A: Low score, error in reflection",
      chipTextClass: "text-rose-700",
      chipBgClass: "bg-rose-100",
      description:
        "This group scored below 55% and reflections show errors or misconceptions. Recommend re-teaching key concepts.",
    },
    {
      id: "B",
      label: "Group B: High score, surface reflection",
      chipTextClass: "text-amber-700",
      chipBgClass: "bg-amber-100",
      description:
        "This group scored 80%+ but their reflections are surface-level. Recommend prompting for deeper thinking.",
    },
    {
      id: "C",
      label: "Group C: High score, rich reflection",
      chipTextClass: "text-emerald-700",
      chipBgClass: "bg-emerald-100",
      description:
        "This group scored well and provided rich reflections. No immediate action needed, but consider enrichment activities.",
    },
    {
      id: "D",
      label: "Group D: Mixed performance",
      chipTextClass: "text-slate-700",
      chipBgClass: "bg-slate-100",
      description:
        "This group has mixed scores and reflections. Recommend reviewing individual student performance for targeted support.",
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
        <div class="w-11 h-11 rounded-full bg-white flex items-center justify-center text-xl shadow-sm shrink-0">🌍</div>
        <h1 class="font-display text-lg font-bold text-violet-950">
          The Invisible Grip That Shapes Our World
        </h1>
        <span class="ml-auto shrink-0 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-violet-800">Expedition review</span>
      </div>
      <div class="flex gap-2.5 shrink-0">
        <div class="flex items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-500 shadow-sm">{students.length} students</div>
        <StudentSearch {students} {groups} {debate} />
      </div>
    </header>

    <ClassRoster {students} {questionTypes} {debate} />
  </div>
</main>
