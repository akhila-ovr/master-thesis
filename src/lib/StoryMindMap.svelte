<!-- StoryMindMap.svelte: the Creative Story Builder tree, drawn once as a
     branching diagram, with every student's own route through it overlaid as
     a colored line ending in their name at whichever box they landed on.
     Click a name (or a line) to trace just that student; click again to
     clear. Hovering does the same as a quick preview when nothing is
     pinned. Box heights are measured from the real rendered DOM (not
     guessed from character counts), so text never gets clipped regardless
     of how it wraps. -->
<script lang="ts">
  import { avatarFor, type Student } from "./studentHelpers";
  import {
    STORY_TREE,
    storyDetailFor,
    storyInterpretation,
    storyRouteFor,
    type StoryOption,
  } from "./expedition";

  export let students: Array<Student> = [];

  type NodeDef = {
    id: string;
    col: number;
    label: string;
    result: string;
    nextQuestion?: string;
    isRoot: boolean;
  };
  type Box = NodeDef & { x: number; y: number; w: number; h: number };
  type Edge = { from: string; to: string };
  type Route = { student: Student; keys: string[]; color: string };

  const COL_W = 250;
  const COL_GAP = 90;
  const MARGIN = 24;
  const NAME_COL_W = 168;
  const ROW_GAP = 24; // vertical breathing room between boxes in a column
  const MIN_BOX_H = 90;

  // Rough guess used only until the real DOM measurement arrives (avoids a
  // large flash of an under/over-sized box on first paint).
  function estimateHeight(o: { label?: string; result: string; nextQuestion?: string }, isRoot: boolean): number {
    const padY = 20;
    if (isRoot) return padY + Math.max(1, Math.ceil(o.result.length / 34)) * 17;
    const labelLines = Math.max(1, Math.ceil((o.label?.length ?? 0) / 28));
    const resultLines = Math.max(1, Math.ceil(o.result.length / 38));
    let h = padY + labelLines * 16 + resultLines * 15;
    if (o.nextQuestion) h += 6 + Math.max(1, Math.ceil((o.nextQuestion.length + 6) / 42)) * 13;
    return h;
  }

  const col1Opts = STORY_TREE.options; // sphere, box
  const col2Opts = col1Opts.flatMap((o) => o.next?.options ?? []); // steel, foam, magnets, weights

  // firm/loose and show/hide are each referenced by two col2 parents (the
  // tree merges back together) -- dedupe by key so each is drawn once.
  const col3Opts: StoryOption[] = [];
  const seenLeaf = new Set<string>();
  for (const o of col2Opts) {
    for (const leaf of o.next?.options ?? []) {
      if (!seenLeaf.has(leaf.key)) {
        seenLeaf.add(leaf.key);
        col3Opts.push(leaf);
      }
    }
  }

  const nodeDefs: NodeDef[] = [
    { id: "root", col: 0, label: "", result: STORY_TREE.question, isRoot: true },
    ...col1Opts.map((o) => ({ id: o.key, col: 1, label: o.label, result: o.result, nextQuestion: o.next?.question, isRoot: false })),
    ...col2Opts.map((o) => ({ id: o.key, col: 2, label: o.label, result: o.result, nextQuestion: o.next?.question, isRoot: false })),
    ...col3Opts.map((o) => ({ id: o.key, col: 3, label: o.label, result: o.result, isRoot: false })),
  ];

  const edges: Edge[] = [];
  col1Opts.forEach((o) => edges.push({ from: "root", to: o.key }));
  col2Opts.forEach((o) => {
    const parent = col1Opts.find((p) => (p.next?.options ?? []).some((c) => c.key === o.key));
    if (parent) edges.push({ from: parent.key, to: o.key });
  });
  col2Opts.forEach((o) => {
    (o.next?.options ?? []).forEach((leaf) => edges.push({ from: o.key, to: leaf.key }));
  });

  // Real measured content height per box id, filled in by the measureBox
  // action below. Falls back to the rough estimate until it arrives.
  let measured: Record<string, number> = {};

  function measureBox(node: HTMLElement, id: string) {
    function update() {
      const h = node.offsetHeight;
      if (h && measured[id] !== h) measured = { ...measured, [id]: h };
    }
    update();
    const ro = new ResizeObserver(update);
    ro.observe(node);
    return { destroy: () => ro.disconnect() };
  }

  $: colRowH = [0, 1, 2, 3].map((ci) => {
    const heights = nodeDefs
      .filter((d) => d.col === ci)
      .map((d) => measured[d.id] ?? estimateHeight(d, d.isRoot));
    return Math.max(MIN_BOX_H, ...heights) + ROW_GAP;
  });
  $: colCounts = [0, 1, 2, 3].map((ci) => nodeDefs.filter((d) => d.col === ci).length);
  $: totalH = Math.max(...colCounts.map((n, ci) => n * colRowH[ci]));

  $: boxes = (() => {
    const map: Record<string, Box> = {};
    for (const ci of [0, 1, 2, 3]) {
      const list = nodeDefs.filter((d) => d.col === ci);
      const rowH = totalH / list.length;
      list.forEach((d, i) => {
        map[d.id] = {
          ...d,
          x: MARGIN + ci * (COL_W + COL_GAP),
          y: MARGIN + rowH * (i + 0.5),
          w: COL_W,
          h: measured[d.id] ?? estimateHeight(d, d.isRoot),
        };
      });
    }
    return map;
  })();

  function bezier(x1: number, y1: number, x2: number, y2: number): string {
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
  }
  function edgePath(e: Edge): string {
    const a = boxes[e.from];
    const b = boxes[e.to];
    return bezier(a.x + a.w, a.y, b.x, b.y);
  }

  $: svgW = MARGIN + 3 * (COL_W + COL_GAP) + COL_W + NAME_COL_W + MARGIN;
  $: svgH = totalH + MARGIN * 2;

  function hueFor(name: string): number {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return h % 360;
  }

  $: routes = students.map((s) => ({
    student: s,
    keys: ["root", ...storyRouteFor(s).map((o) => o.key)],
    color: `hsl(${hueFor(s.name)} 62% 45%)`,
  })) as Route[];

  // Students sharing an identical route get a small vertical fan-out so
  // their lines stay visible instead of drawing exactly on top of each other.
  $: routeGroups = (() => {
    const map = new Map<string, Route[]>();
    for (const r of routes) {
      const k = r.keys.join("|");
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    }
    return map;
  })();

  function jitterFor(r: Route): number {
    const group = routeGroups.get(r.keys.join("|")) ?? [r];
    const idx = group.indexOf(r);
    const n = group.length;
    return (idx - (n - 1) / 2) * 7;
  }

  function routePath(r: Route): string {
    const j = jitterFor(r);
    let d = "";
    for (let i = 0; i < r.keys.length - 1; i++) {
      const a = boxes[r.keys[i]];
      const b = boxes[r.keys[i + 1]];
      const x1 = a.x + a.w;
      const y1 = a.y + j;
      const x2 = b.x;
      const y2 = b.y + j;
      if (i === 0) d += `M ${x1} ${y1} `;
      const mx = (x1 + x2) / 2;
      d += `C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2} `;
    }
    return d;
  }

  $: leafGroups = col3Opts.map((leaf) => ({
    box: boxes[leaf.key],
    routes: routes.filter((r) => r.keys[r.keys.length - 1] === leaf.key),
  }));

  function countThrough(id: string): number {
    return routes.filter((r) => r.keys.includes(id)).length;
  }

  let pinned: string | null = null;
  let hovered: string | null = null;
  function toggle(name: string) {
    pinned = pinned === name ? null : name;
  }
  $: active = pinned ?? hovered;
</script>

<div class="mt-3">
  <p class="text-xs italic text-slate-400">
    Click a name (or a line) to trace that student's route, see time spent per decision, and what each choice means; click again to clear.
  </p>
  <div class="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
    <svg
      width={svgW}
      height={svgH}
      viewBox="0 0 {svgW} {svgH}"
      class="block"
      role="img"
      aria-label="Creative story branching diagram with each student's route highlighted"
    >
      <!-- static tree skeleton -->
      {#each edges as e}
        <path d={edgePath(e)} fill="none" stroke="#cbd5e1" stroke-width="2" />
      {/each}

      <!-- per-student route overlays -->
      {#each routes as r}
        <path
          d={routePath(r)}
          fill="none"
          stroke={r.color}
          stroke-width={active === r.student.name ? 3 : 1.5}
          stroke-opacity={active === null ? 0.5 : active === r.student.name ? 1 : 0.08}
          stroke-linecap="round"
          class="cursor-pointer transition-[stroke-opacity,stroke-width] duration-150"
          role="button"
          tabindex="0"
          aria-label="{r.student.name}'s route"
          on:mouseenter={() => (hovered = r.student.name)}
          on:mouseleave={() => (hovered = null)}
          on:click={() => toggle(r.student.name)}
          on:keydown={(e) => (e.key === "Enter" || e.key === " ") && toggle(r.student.name)}
        />
      {/each}

      <!-- tree node boxes: height comes from the real rendered content via
           use:measureBox, so text is never clipped -->
      {#each Object.values(boxes) as box (box.id)}
        <foreignObject x={box.x} y={box.y - box.h / 2} width={box.w} height={box.h}>
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            class="rounded-xl border border-slate-200 bg-slate-50 p-2.5"
            use:measureBox={box.id}
          >
            {#if box.isRoot}
              <p class="text-xs font-medium text-slate-700">{box.result}</p>
            {:else}
              <div class="flex items-start justify-between gap-1">
                <span class="text-xs font-semibold text-slate-800">{box.label}</span>
                <span
                  class="shrink-0 rounded-full bg-slate-200 px-1.5 text-[10px] font-bold text-slate-600"
                  title="Students who reached this point"
                >
                  {countThrough(box.id)}
                </span>
              </div>
              <p class="mt-1 text-[11px] leading-snug text-slate-500">
                {box.result}
              </p>
              {#if box.nextQuestion}
                <p class="mt-1 text-[10px] italic leading-snug text-slate-400">
                  Next: {box.nextQuestion}
                </p>
              {/if}
            {/if}
          </div>
        </foreignObject>
      {/each}

      <!-- names, stacked next to the box each student's route ends at -->
      {#each leafGroups as g}
        {#each g.routes as r, i}
          {@const y = g.box.y - ((g.routes.length - 1) * 15) / 2 + i * 15}
          <text
            x={g.box.x + g.box.w + 14}
            y={y}
            class="cursor-pointer select-none text-[11px] font-medium transition-opacity duration-150"
            fill={r.color}
            opacity={active === null ? 1 : active === r.student.name ? 1 : 0.25}
            role="button"
            tabindex="0"
            aria-label="Trace {r.student.name}'s route"
            on:mouseenter={() => (hovered = r.student.name)}
            on:mouseleave={() => (hovered = null)}
            on:click={() => toggle(r.student.name)}
            on:keydown={(e) => (e.key === "Enter" || e.key === " ") && toggle(r.student.name)}
          >
            ● {r.student.name}
          </text>
        {/each}
      {/each}
    </svg>
  </div>

  {#if pinned}
    {@const student = students.find((s) => s.name === pinned)}
    {#if student}
      {@const avatar = avatarFor(student.name)}
      {@const detail = storyDetailFor(student)}
      {@const totalMinutes = detail.reduce((sum, d) => sum + d.minutes, 0)}
      <div class="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg {avatar.bg}"
            >
              {avatar.emoji}
            </div>
            <div>
              <div class="text-sm font-bold text-slate-800">{student.name}</div>
              <div class="text-xs text-slate-500">
                {totalMinutes} min across {detail.length} decisions
              </div>
            </div>
          </div>
          <button
            type="button"
            class="rounded-full px-2 py-0.5 text-xs text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            on:click={() => (pinned = null)}
          >
            Clear ✕
          </button>
        </div>

        <div class="mt-3 space-y-2.5">
          {#each detail as d}
            <div class="rounded-lg border border-slate-200 bg-white p-3">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Step {d.level}
                </span>
                <span class="text-[10px] font-semibold text-slate-400">{d.minutes} min</span>
              </div>
              <p class="mt-1 text-sm font-medium text-slate-700">{d.question}</p>
              <p class="mt-1.5 text-sm font-semibold text-emerald-700">Chose: {d.choice}</p>
              <p class="mt-1 text-xs leading-snug text-slate-500">{d.result}</p>
            </div>
          {/each}
        </div>

        <div class="mt-3 rounded-lg border border-slate-200 bg-white p-3">
          <div class="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            AI Insights
          </div>
          <p class="mt-1 text-sm text-slate-600">{storyInterpretation(student)}</p>
        </div>
      </div>
    {/if}
  {/if}
</div>
