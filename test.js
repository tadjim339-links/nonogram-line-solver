const assert = require('assert');
const { runsOf, cluesOf, lineSolve, solve, solvableByLogic } = require('./index.js');
assert.deepStrictEqual(runsOf([0, 1, 1, 0, 1]), [2, 1]);
assert.deepStrictEqual(runsOf([0, 0]), [0]);
assert.deepStrictEqual(lineSolve([5], [-1, -1, -1, -1, -1]), [1, 1, 1, 1, 1]);                 // a full clue fills the line
assert.deepStrictEqual(lineSolve([3], [-1, -1, -1, -1, -1]), [-1, -1, 1, -1, -1]);             // overlap of a sliding run
assert.deepStrictEqual(lineSolve([2, 1], [-1, -1, -1, -1, -1]), [-1, 1, -1, -1, -1]);          // ##.#. ##..# .##.# agree only on cell 1
assert.strictEqual(lineSolve([4], [1, 0, -1, -1, -1]), null);                                   // contradiction
const heart = ['.#.#.', '#####', '#####', '.###.', '..#..'];
assert.ok(solvableByLogic(heart));
const s = solve(...Object.values(cluesOf(heart)));
assert.deepStrictEqual(s.grid.map(r => r.map(v => (v === 1 ? '#' : '.')).join('')), heart);
assert.strictEqual(s.order.length, 16);
// a picture with two answers (a 2x2 checker) cannot be solved by logic
assert.strictEqual(solvableByLogic(['#.', '.#']), false);
// random pictures: when the solver says solved, the grid equals the picture
let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
let solvable = 0;
for (let n = 0; n < 300; n++) {
  const R = 3 + (n % 6), C = 3 + ((n * 7) % 6), pic = Array.from({ length: R }, () => Array.from({ length: C }, () => (rnd() < 0.6 ? '#' : '.')).join(''));
  const { rows, cols } = cluesOf(pic), r = solve(rows, cols);
  if (r.solved) { solvable++; assert.deepStrictEqual(r.grid.map(row => row.map(v => (v === 1 ? '#' : '.')).join('')), pic); }
}
assert.ok(solvable > 20, 'expected some random pictures to be solvable, got ' + solvable);
console.log('all tests passed (' + solvable + ' of 300 random pictures solvable by logic)');
