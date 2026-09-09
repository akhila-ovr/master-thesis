<!-- StoryGraph.svelte: the Creative Story Builder decision tree drawn as a
     bare-bones horizontal node-link diagram. Each node shows only its option
     label and how many of the class's routes pass through it. Click a node to
     read what that choice leads to and to highlight the path to it; click
     again to clear. Two step-2 options share the same step-3 pair, so the
     tree merges back together on the right. -->
<script lang="ts">
  import type { Student } from "./studentHelpers";
  import { STORY_TREE, storyRouteFor } from "./expedition";

  export let students: Array<Student> = [];

  type Node = {
    key: string;
    col: number;
    label: string;
    result: string;
    nextQuestion?: string;
  };

  const COL_W = 210;
  const COL_GAP = 72;
  const MARGIN = 20;
  const ROOT_H = 92;
  const BOX_H = 56;
  const ROW_GAP = 30;

  const col1 = STORY_TREE.options; // sphere, box
  const col2 = col1.flatMap((o) => o.next?.options ?? []); // steel, foam, magnets, weights

  // firm/loose and show/hide are each reached from two col-2 parents; draw
  // each once, keyed by option key.
  const col3: typeof col2 = [];
  const seen = new Set<string>();
  for (const o of col2)
    for (const leaf of o.next?.options ?? [])
      if (!seen.has(leaf.key)) {
        seen.add(leaf.key);
        col3.push(leaf);
      }

  const nodes: Node[] = [
    { key: "root", col: 0, label: "", result: STORY_TREE.question },
    ...col1.map((o) => ({
      key: o.key,
      col: 1,
      label: o.label,
      result: o.result,
      nextQuestion: o.next?.question,
    })),
    ...col2.map((o) => ({
      key: o.key,
      col: 2,
      label: o.label,
      result: o.result,
      nextQuestion: o.next?.question,
    })),
    ...col3.map((o) => ({
      key: o.key,
      col: 3,
      label: o.label,
      result: o.result,
    })),
  ];

  const edges: Array<{ from: string; to: string }> = [];
  col1.forEach((o) => edges.push({ from: "root", to: o.key }));
  col1.forEach((p) =>
    (p.next?.options ?? []).forEach((c) => edges.push({ from: p.key, to: c.key })),
  );
  col2.forEach((p) =>
    (p.next?.options ?? []).forEach((c) => edges.push({ from: p.key, to: c.key })),
  );

  const colCount = [1, col1.length, col2.length, col3.length];
  $: totalH = Math.max(...colCount.map((n) => n * (BOX_H + ROW_GAP)));

  type Box = Node & { x: number; y: number; w: number; h: number };
  $: boxes = nodes.reduce<Record<string, Box>>((map, n) => {
    const n_ = colCount[n.col];
    const idx = nodes.filter((m) => m.col === n.col).indexOf(n);
    const h = n.col === 0 ? ROOT_H : BOX_H;
    map[n.key] = {
      ...n,
      w: COL_W,
      h,
      x: MARGIN + n.col * (COL_W + COL_GAP),
      y: MARGIN + (totalH / n_) * (idx + 0.5),
    };
    return map;
  }, {});

  $: svgW = MARGIN * 2 + 4 * COL_W + 3 * COL_GAP;
  $: svgH = totalH + MARGIN * 2;

  function countThrough(key: string): number {
    return namesThrough(key).length;
  }

  // Names of the students whose route passes through this option.
  function namesThrough(key: string): string[] {
    if (key === "root") return students.map((s) => s.name);
    return students
      .filter((s) => storyRouteFor(s).some((o) => o.key === key))
      .map((s) => s.name);
  }

  function path(from: string, to: string): string {
    const a = boxes[from];
    const b = boxes[to];
    const x1 = a.x + a.w;
    const y1 = a.y;
    const x2 = b.x;
    const y2 = b.y;
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
  }

  let selected: string | null = null;
  function toggle(key: string) {
    selected = selected === key ? null : key;
  }
  $: selectedNode = selected ? boxes[selected] : null;

  // One bright, distinct color per student so each route is easy to follow.
  const ROUTE_COLORS = [
    "#f43f5e",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#14b8a6",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
    "#d946ef",
    "#ec4899",
  ];
  $: routes = students.map((s, i) => ({
    name: s.name,
    color: ROUTE_COLORS[i % ROUTE_COLORS.length],
    keys: ["root", ...storyRouteFor(s).map((o) => o.key)],
  }));

  // Students sharing an identical route get a small vertical fan-out so their
  // lines don't draw exactly on top of each other.
  $: routeJitter = (() => {
    const groups = new Map<string, string[]>();
    for (const r of routes) {
      const k = r.keys.join("|");
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(r.name);
    }
    const map: Record<string, number> = {};
    for (const names of groups.values())
      names.forEach((n, i) => (map[n] = (i - (names.length - 1) / 2) * 6));
    return map;
  })();

  function routePath(r: { keys: string[]; name: string }): string {
    const j = routeJitter[r.name] ?? 0;
    let d = "";
    for (let i = 0; i < r.keys.length - 1; i++) {
      const a = boxes[r.keys[i]];
      const b = boxes[r.keys[i + 1]];
      const x1 = a.x + a.w;
      const y1 = a.y + j;
      const x2 = b.x;
      const y2 = b.y + j;
      const mx = (x1 + x2) / 2;
      d +=
        (i === 0 ? `M ${x1} ${y1} ` : "") +
        `C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2} `;
    }
    return d;
  }

  let isolated: string | null = null;
  function toggleIsolate(name: string) {
    isolated = isolated === name ? null : name;
  }
</script>

<div class="mt-3">
  <p class="text-xs text-slate-400">
    Each colored line is one student's route through the tree. Click a line or a
    name below to follow just that student; click a choice for its detail.
  </p>
  <div class="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
    <svg
      width={svgW}
      height={svgH}
      viewBox="0 0 {svgW} {svgH}"
      class="block"
      role="img"
      aria-label="Creative Story Builder decision tree"
    >
      {#each edges as e}
        <path
          d={path(e.from, e.to)}
          fill="none"
          stroke="#e2e8f0"
          stroke-width="1.5"
        />
      {/each}

      {#each routes as r}
        <path
          d={routePath(r)}
          fill="none"
          stroke={r.color}
          stroke-width={isolated === r.name ? 4 : 2}
          stroke-linecap="round"
          stroke-opacity={isolated === null
            ? 0.85
            : isolated === r.name
              ? 1
              : 0.12}
          class="cursor-pointer"
          role="button"
          tabindex="0"
          aria-label="Follow {r.name}'s route"
          on:click={() => toggleIsolate(r.name)}
          on:keydown={(e) =>
            (e.key === "Enter" || e.key === " ") && toggleIsolate(r.name)}
        />
      {/each}

      {#each Object.values(boxes) as b (b.key)}
        <foreignObject x={b.x} y={b.y - b.h / 2} width={b.w} height={b.h}>
          <div xmlns="http://www.w3.org/1999/xhtml" class="h-full">
            {#if b.key === "root"}
              <div
                class="flex h-full items-center rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs font-medium leading-snug text-slate-700"
              >
                {b.result}
              </div>
            {:else}
              <button
                type="button"
                on:click={() => toggle(b.key)}
                class="flex h-full w-full items-center justify-between gap-2 rounded-lg border px-3 text-left text-xs font-semibold transition-colors {selected ===
                b.key
                  ? 'border-accent-500 bg-accent-50 text-accent-800'
                  : 'border-slate-300 bg-white text-slate-800 hover:border-slate-400'}"
              >
                <span class="leading-snug">{b.label}</span>
                <span
                  class="shrink-0 rounded-full bg-slate-100 px-1.5 text-[10px] font-bold text-slate-500"
                  title="Students whose route passes through here"
                >
                  {countThrough(b.key)}
                </span>
              </button>
            {/if}
          </div>
        </foreignObject>
      {/each}
    </svg>
  </div>

  <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1">
    {#each routes as r}
      <button
        type="button"
        on:click={() => toggleIsolate(r.name)}
        class="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 transition-opacity {isolated &&
        isolated !== r.name
          ? 'opacity-30'
          : 'opacity-100'}"
      >
        <span
          class="h-2.5 w-2.5 shrink-0 rounded-full"
          style="background:{r.color}"
        ></span>
        {r.name}
      </button>
    {/each}
  </div>

  {#if selectedNode}
    <div
      class="mt-2 rounded-lg border border-accent-200 bg-accent-50/60 p-3 text-xs leading-relaxed text-slate-600"
    >
      <span class="font-semibold text-accent-800">{selectedNode.label}</span>
      <span class="text-slate-300">·</span>
      {countThrough(selectedNode.key)}/{students.length} students
      <p class="mt-1">{selectedNode.result}</p>
      {#if selectedNode.nextQuestion}
        <p class="mt-1 text-slate-400">Next: {selectedNode.nextQuestion}</p>
      {/if}
      {#if namesThrough(selectedNode.key).length}
        <p class="mt-1.5">
          <span class="font-semibold text-accent-800">Chose this:</span>
          {namesThrough(selectedNode.key).join(", ")}
        </p>
      {/if}
    </div>
  {/if}
</div>
