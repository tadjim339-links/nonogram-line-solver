'use strict';
// nonogram-line-solver: clues, a line-by-line solver and a "solvable by logic" check for nonogram pictures. No dependencies.

/** Clue for one line of 0/1 cells: the lengths of the runs of 1s, or [0] for an empty line. */
function runsOf(line) {
  const out = []; let k = 0;
  for (const v of line) { if (v === 1) k++; else if (k) { out.push(k); k = 0; } }
  if (k) out.push(k);
  return out.length ? out : [0];
}

/** Clues for a picture given as an array of strings ('#' = filled). Returns { rows, cols }. */
function cluesOf(picture) {
  const R = picture.length, C = picture[0].length, g = picture.map(s => [...s].map(ch => (ch === '#' ? 1 : 0)));
  return {
    rows: g.map(runsOf),
    cols: Array.from({ length: C }, (_, c) => runsOf(Array.from({ length: R }, (_, r) => g[r][c])))
  };
}

/**
 * One line. `known` has -1 (unknown), 0 (empty) or 1 (filled) per cell. Tries every way to place the clue's runs that agrees
 * with what is known and returns what all of them agree on (still -1 where they differ), or null if nothing fits.
 */
function lineSolve(clue, known) {
  const n = known.length, blocks = clue.length === 1 && clue[0] === 0 ? [] : clue;
  const canFill = new Uint8Array(n), canEmpty = new Uint8Array(n), cur = new Uint8Array(n);
  const tail = new Array(blocks.length + 1).fill(0);
  for (let i = blocks.length - 1; i >= 0; i--) tail[i] = tail[i + 1] + blocks[i] + (i < blocks.length - 1 ? 1 : 0);
  let any = false;
  (function place(bi, pos) {
    if (bi === blocks.length) {
      for (let j = pos; j < n; j++) if (known[j] === 1) return;
      any = true;
      for (let j = 0; j < n; j++) { if (cur[j]) canFill[j] = 1; else canEmpty[j] = 1; }
      return;
    }
    const len = blocks[bi];
    for (let s = pos; s + tail[bi] <= n; s++) {
      let ok = true;
      for (let j = pos; j < s; j++) if (known[j] === 1) { ok = false; break; }
      if (!ok) break;                       // a filled cell was skipped over: later starts only skip more
      for (let j = s; j < s + len; j++) if (known[j] === 0) { ok = false; break; }
      if (!ok) continue;
      if (s + len < n && known[s + len] === 1) continue;
      for (let j = s; j < s + len; j++) cur[j] = 1;
      place(bi + 1, Math.min(n, s + len + 1));
      for (let j = s; j < s + len; j++) cur[j] = 0;
    }
  })(0, 0);
  if (!any) return null;
  return Array.from({ length: n }, (_, j) => (canFill[j] && !canEmpty[j] ? 1 : canEmpty[j] && !canFill[j] ? 0 : -1));
}

/**
 * Solve a whole picture by lines only (no guessing). Returns { solved, grid, order }:
 * grid is rows of -1/0/1, order lists the filled cells [row, col] in the order logic finds them.
 */
function solve(rows, cols) {
  const R = rows.length, C = cols.length, k = Array.from({ length: R }, () => new Array(C).fill(-1)), order = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < R; r++) {
      const res = lineSolve(rows[r], k[r]); if (!res) return { solved: false, grid: k, order };
      for (let c = 0; c < C; c++) if (k[r][c] === -1 && res[c] !== -1) { k[r][c] = res[c]; changed = true; if (res[c] === 1) order.push([r, c]); }
    }
    for (let c = 0; c < C; c++) {
      const col = k.map(row => row[c]), res = lineSolve(cols[c], col); if (!res) return { solved: false, grid: k, order };
      for (let r = 0; r < R; r++) if (k[r][c] === -1 && res[r] !== -1) { k[r][c] = res[r]; changed = true; if (res[r] === 1) order.push([r, c]); }
    }
  }
  return { solved: k.every(row => row.every(v => v !== -1)), grid: k, order };
}

/** True when line reasoning alone solves the picture, which also means it has exactly one answer. */
function solvableByLogic(picture) { const { rows, cols } = cluesOf(picture); return solve(rows, cols).solved; }

module.exports = { runsOf, cluesOf, lineSolve, solve, solvableByLogic };
