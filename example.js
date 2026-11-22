const { cluesOf, solve } = require('./index.js');
const picture = ['.#.#.', '#####', '#####', '.###.', '..#..'];
const { rows, cols } = cluesOf(picture);
console.log('rows', JSON.stringify(rows), 'cols', JSON.stringify(cols));
const s = solve(rows, cols);
console.log('solved by logic:', s.solved);
console.log(s.grid.map(r => r.map(v => (v === 1 ? '#' : '.')).join('')).join('\n'));
