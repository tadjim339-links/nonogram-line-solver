# nonogram-line-solver

A small, dependency-free JavaScript module for nonogram (picture-logic) puzzles. It writes the clues for a picture, solves a puzzle one line at a time, and tells you whether a picture can be solved by logic alone, which also means it has exactly one answer.

A nonogram is a grid with number clues beside each row and above each column. A clue lists the lengths of the runs of filled squares in that line, in order, so `3 1` means three filled squares, a gap, then one filled square. The filled squares make a picture.

## Use

```js
const { cluesOf, solve, solvableByLogic } = require('./index.js');

const heart = ['.#.#.', '#####', '#####', '.###.', '..#..'];   // '#' = filled
const { rows, cols } = cluesOf(heart);
console.log(rows, cols);              // [[1,1],[5],[5],[3],[1]] [[2],[4],[4],[4],[2]]

const result = solve(rows, cols);
console.log(result.solved);           // true: line reasoning alone finishes it
console.log(result.order.slice(0, 5)); // the first squares that logic proves, as [row, col]

console.log(solvableByLogic(['#.', '.#'])); // false: two answers, so logic cannot decide
```

`node example.js` prints the clues and the solved picture. `npm test` checks the line solver on small cases, then generates 300 random pictures and confirms that whenever the solver reports "solved", its grid is exactly the original picture.

## How it works

1. **One line.** `lineSolve(clue, known)` tries every way to place the clue's runs that agrees with the squares already known (`-1` unknown, `0` empty, `1` filled). Squares that are filled in every arrangement are filled; squares that are empty in every arrangement are empty; the rest stay unknown. If no arrangement fits, it returns `null`.
2. **The whole picture.** `solve` sweeps the rows and then the columns, feeding what each line learns into the crossing lines, until nothing changes.
3. **Verdict.** If every square is known at the end, the picture was solved by pure reasoning, no guessing. A picture that stalls with unknown squares needs guessing or has more than one answer.

The `order` list is useful for hints: it is the order in which squares can be worked out, each one justified by the squares before it. Lines in typical puzzle sizes (up to about 12 squares) are enumerated directly, which is instant.

## Where it is used

The checker decides which pictures are allowed in [Needlenook, a free cross-stitch nonogram game](https://cozypuzzlegames.com/nonogram/?utm_source=github&utm_medium=readme): a picture is only used when this kind of line reasoning solves it completely, and the game's hint button follows the same solving order. More puzzle games are listed at cozypuzzlegames.com.

## License

MIT
