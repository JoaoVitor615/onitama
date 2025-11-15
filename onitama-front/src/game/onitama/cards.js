// Conjunto de cartas do Onitama (movimentos relativos ao jogador A)
// Cada movimento é um par [dy, dx] onde dy -1 é avançar (para A); para B os movimentos são espelhados (dy *= -1)
export const CARDS = [
  { name: 'Tiger', color: 'blue', moves: [[-2, 0], [1, 0]] },
  { name: 'Dragon', color: 'red', moves: [[-1, -2], [-1, 2], [1, -1], [1, 1]] },
  { name: 'Frog', color: 'blue', moves: [[0, -2], [-1, -1], [1, 1]] },
  { name: 'Rabbit', color: 'red', moves: [[0, 2], [-1, 1], [1, -1]] },
  { name: 'Crab', color: 'blue', moves: [[0, -2], [0, 2], [-1, 0]] },
  { name: 'Elephant', color: 'red', moves: [[-1, -1], [-1, 1], [0, -1], [0, 1]] },
  { name: 'Goose', color: 'blue', moves: [[-1, -1], [0, -1], [0, 1], [1, 1]] },
  { name: 'Rooster', color: 'red', moves: [[-1, 1], [0, -1], [0, 1], [1, -1]] },
  { name: 'Monkey', color: 'red', moves: [[-1, -1], [-1, 1], [1, -1], [1, 1]] },
  { name: 'Mantis', color: 'red', moves: [[-1, -1], [-1, 1], [1, 0]] },
  { name: 'Crane', color: 'blue', moves: [[-1, 0], [1, -1], [1, 1]] },
  { name: 'Boar', color: 'blue', moves: [[-1, 0], [0, -1], [0, 1]] },
  { name: 'Ox', color: 'red', moves: [[-1, 0], [0, 1], [1, 0]] },
  { name: 'Horse', color: 'blue', moves: [[-1, 0], [0, -1], [1, 0]] },
  { name: 'Eel', color: 'blue', moves: [[-1, -1], [0, 1], [1, -1]] },
  { name: 'Cobra', color: 'red', moves: [[-1, 1], [0, -1], [1, 1]] },
];

export function shuffleDeck(seed = Date.now()) {
  const deck = CARDS.map((c) => ({ ...c }));
  // Fisher-Yates
  let s = seed % 2147483647; if (s <= 0) s += 2147483646;
  const rand = () => (s = (s * 48271) % 2147483647) / 2147483647;
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}