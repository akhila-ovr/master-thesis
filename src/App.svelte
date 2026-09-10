<!-- App.svelte: application root. Holds the shared expedition data and the
     header. The header student search (StudentSearch) is the only surface
     currently rendered; the rest of the dashboard is being rebuilt. -->
<script lang="ts">
  import StudentSearch from "./lib/StudentSearch.svelte";
  import ClassOverview from "./lib/ClassOverview.svelte";

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

  // Per-student exercise results, taken straight from the class scoreboard
  // rather than generated. The dashboard only ever asks "did this student
  // pass this exercise type?" (passedTypeOf), so each type is recorded as a
  // plain pass (every question of that type correct) or fail (all wrong).
  type QuizTypeKey = "mc" | "fill" | "sort" | "tf" | "drag";
  const QUIZ_PASS: Record<string, Record<QuizTypeKey, boolean>> = {
    "Finn D.":  { mc: false, fill: false, sort: false, tf: true,  drag: false },
    "Omar S.":  { mc: false, fill: false, sort: false, tf: false, drag: false },
    "Noah R.":  { mc: false, fill: false, sort: false, tf: true,  drag: false },
    "Amara K.": { mc: true,  fill: true,  sort: true,  tf: false, drag: true  },
    "James T.": { mc: true,  fill: true,  sort: false, tf: true,  drag: true  },
    "Luca B.":  { mc: true,  fill: true,  sort: true,  tf: false, drag: true  },
    // T/F marked wrong on purpose: her reflection shows the "time, not mass,
    // rounds an asteroid" misconception that this exercise tests.
    "Priya N.": { mc: true,  fill: true,  sort: false, tf: false, drag: true  },
    "Yara H.":  { mc: true,  fill: true,  sort: true,  tf: true,  drag: true  },
    "Sofia M.": { mc: true,  fill: true,  sort: false, tf: true,  drag: true  },
    "Lina P.":  { mc: true,  fill: true,  sort: false, tf: true,  drag: true  },
  };

  const QUIZ_TYPE_KEY: Record<string, QuizTypeKey> = {
    "Multiple choice (4 questions)": "mc",
    "Fill in blanks (2 questions)": "fill",
    "Sorting (1 question)": "sort",
    "True / False (3 questions)": "tf",
    "Drag & drop (2 questions)": "drag",
  };

  function computeQuizAnswers(name: string) {
    const passMap = QUIZ_PASS[name];
    return questionTypes.flatMap((qt: any) => {
      const ok = passMap?.[QUIZ_TYPE_KEY[qt.label as string]] ?? false;
      return qt.questions.map((q: any) => ({
        typeLabel: qt.label as string,
        qLabel: q.label as string,
        question: (q.question as string) ?? "",
        outcome: (ok ? "correct" : "wrong") as "correct" | "retry" | "wrong",
      }));
    });
  }

  export const students = [
    {
      name: "Finn D.",
      summary: "Says gravity makes things fall, but describes it as pulling toward the ground rather than toward the planet's center.",
      transcript: `Sparkli: What did you learn about gravity today?
Finn: it makes stuff fall down onto the ground
Sparkli: Where is it pulling things to?
Finn: um just down? i dont really get it`,
    },
    {
      name: "Omar S.",
      summary: "Reflection is blank of real content: it just says the work was finished, with nothing about gravity or mass.",
      transcript: `Sparkli: What did you learn about gravity today?
Omar: it was ok i finished mine
Sparkli: Can you tell me one thing about why Earth is round?
Omar: umm i cant remember sorry`,
    },
    {
      name: "Noah R.",
      summary: "Two misconceptions in the reflection: calls gravity the air pushing down, and thinks Earth is round because it spins fast. Nothing about the pull toward the center or the role of mass, and exercise scores are low across the board.",
      transcript: `Sparkli: What did you learn about gravity today?
Noah: gravity is the air pushing down on us and that holds everything on the ground
Sparkli: What makes a planet round instead of lumpy?
Noah: i think the earth spins really fast so it goes round`,
    },
    {
      name: "Amara K.",
      summary: "Says heavy planets have more gravity, but doesn't explain what that gravity then does or why it makes a sphere.",
      transcript: `Sparkli: What did you learn about gravity today?
Amara: big heavy planets have way more gravity
Sparkli: What does that gravity actually do?
Amara: it just pulls stuff harder i think`,
    },
    {
      name: "James T.",
      summary: "Uses the right words at a high level, gravity is an important force for planets and space, but nothing specific from the expedition: no mention of the pull toward the center, mass, or what makes a body round. Exercise scores are strong.",
      transcript: `Sparkli: What did you learn about gravity today?
James: i learned gravity is a really important force for planets and space
Sparkli: Can you tell me anything about mass or why Earth is round?
James: we did loads about how gravity works, it was pretty interesting`,
    },
    {
      name: "Luca B.",
      summary: "Explains that gravity pulls all of Earth's matter toward the center from every side, ties it to a model volcano he once built, and notes he hadn't realized solid rock could bend under that pressure.",
      transcript: `Sparkli: What did you learn about gravity today?
Luca: gravity pulls all the rock into the middle of the earth from every side and it squishes it into a big round ball
Sparkli: Have you come across this before?
Luca: i made a model volcano at home once and i didnt know the rock actually bends from all that squishing thats so cool`,
    },
    {
      name: "Priya N.",
      summary: "A thorough explanation of mass driving the inward pull that squashes a body into a sphere, but with one slip: she thinks small asteroids will round out too if given enough time, when it is mass, not time, that does it.",
      transcript: `Sparkli: What did you learn about gravity today?
Priya: the more heavy a planet is the stronger its gravity gets so it pulls itself inwards and squishes into a round ball, and i think even small asteroids will slowly get pulled round too if theyre floating out there long enough
Sparkli: Did you know about this before?
Priya: i knew big things had more gravity but i didnt know even the puffy gas planets get pulled into a ball too`,
    },
    {
      name: "Yara H.",
      summary: "Explains that asteroids stay lumpy because they lack the mass for strong gravity, and reflects that she used to think every space rock was round.",
      transcript: `Sparkli: What did you learn about gravity today?
Yara: asteroids stay all lumpy cause they dont have enough mass so their gravity is too weak to pull them into a ball
Sparkli: Had you thought about this before?
Yara: i used to think all the space rocks were round like tiny planets so that really surprised me`,
    },
    {
      name: "Sofia M.",
      summary: "Explains that gravity pulls toward the center from all directions so down always points inward, but doesn't link it back to mass.",
      transcript: `Sparkli: What did you learn about gravity today?
Sofia: gravity pulls everything to the middle of the earth from all the sides so down always points to the centre
Sparkli: Is there anything that surprised you?
Sofia: i didnt know down actually means the middle not just the floor`,
    },
    {
      name: "Lina P.",
      summary: "Shares that she saw a video of astronauts floating, but doesn't explain why gravity feels different there.",
      transcript: `Sparkli: What did you learn about gravity today?
Lina: i saw a video of astronauts just floating about in space once
Sparkli: Why do you think gravity is different for them?
Lina: i dont really know they were just floating up there`,
    },
  ].map((s) => ({
    ...s,
    debateSide: getDebateSide(s.name),
    creativeChoice: pickCreativeChoice(s.name),
    quizAnswers: computeQuizAnswers(s.name),
  }));

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
        <div
          class="w-11 h-11 rounded-full bg-white flex items-center justify-center text-xl shadow-sm shrink-0"
        >
          🌍
        </div>
        <h1 class="font-display text-lg font-bold text-violet-950">
          Why is the Earth round?
        </h1>
        <span class="ml-auto shrink-0 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-violet-800">Expedition review</span>
      </div>
      <div class="flex gap-2.5 shrink-0">
        <div class="flex items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-500 shadow-sm">{students.length} students</div>
        <StudentSearch {students} {debate} />
      </div>
    </header>

    <ClassOverview {students} {questionTypes} {debate} />
  </div>
</main>
