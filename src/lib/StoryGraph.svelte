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
    if (key === "root") return students.length;
    return students.filter((s) => storyRouteFor(s).some((o) => o.key === key))
      .length;
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

  // keys on the root-to-selected path (for edge/node highlighting)
  $: onPath = (() => {
    if (!selected || selected === "root") return new Set<string>();
    const set = new Set<string>(["root"]);
    // walk parents up from the selected node using the edge list
    let cur: string | undefined = selected;
    while (cur && cur !== "root") {
      set.add(cur);
      cur = edges.find((e) => e.to === cur)?.from;
    }
    return set;
  })();
  function edgeActive(e: { from: string; to: string }): boolean {
    return onPath.has(e.from) && onPath.has(e.to);
  }

  $: selectedNode = selected ? boxes[selected] : null;
</script>

<div class="mt-3">
  <p class="text-xs text-slate-400">
    Click a choice to see what it leads to and highlight the path to it.
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
          stroke={edgeActive(e) ? "#7c3aed" : "#cbd5e1"}
          stroke-width={edgeActive(e) ? 2.5 : 1.5}
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
                  : onPath.has(b.key)
                    ? 'border-accent-300 bg-white text-slate-800'
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
    </div>
  {/if}
</div>
