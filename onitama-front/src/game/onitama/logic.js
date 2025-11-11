import { shuffleDeck, CARDS } from './cards';

export const BOARD_SIZE = 5;
export const TEMPLE_A = { y: 4, x: 2 };
export const TEMPLE_B = { y: 0, x: 2 };

export function initialBoard() {
  const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
  // B no topo (y=0), A embaixo (y=4)
  const studentsCols = [0, 1, 3, 4];
  studentsCols.forEach((x) => { board[0][x] = { owner: 'B', type: 'student' }; });
  board[0][2] = { owner: 'B', type: 'master' };
  studentsCols.forEach((x) => { board[4][x] = { owner: 'A', type: 'student' }; });
  board[4][2] = { owner: 'A', type: 'master' };
  return board;
}

export function initState(seed) {
  const seedA = (seed ?? Date.now());
  const seedB = seedA + 17;
  const deckA = shuffleDeck(seedA);
  const deckB = shuffleDeck(seedB);
  const state = {
    board: initialBoard(),
    hands: { A: [deckA[0], deckA[1]], B: [deckB[0], deckB[1]] },
    next: { A: deckA[2], B: deckB[2] },
    deckA: deckA.slice(3),
    deckB: deckB.slice(3),
    currentPlayer: 'A',
    winner: null,
    selected: null, // { y, x }
    selectedCardIndex: null, // 0 ou 1
  };
  // inicia aleatório por cor da próxima carta do A/B para variar quem começa
  if (state.next?.A?.color === 'red') state.currentPlayer = 'B';
  return state;
}

export function inBounds(y, x) {
  return y >= 0 && y < BOARD_SIZE && x >= 0 && x < BOARD_SIZE;
}

function transformMovesForOwner(card, owner) {
  if (owner === 'A') return card.moves;
  return card.moves.map(([dy, dx]) => [-dy, dx]); // espelha verticalmente para B
}

export function getValidMoves(state, fromY, fromX, cardIndex) {
  const piece = state.board[fromY][fromX];
  if (!piece) return [];
  if (piece.owner !== state.currentPlayer) return [];
  const card = state.hands[piece.owner][cardIndex];
  if (!card) return [];
  const moves = transformMovesForOwner(card, piece.owner);
  const res = [];
  for (const [dy, dx] of moves) {
    const ny = fromY + dy;
    const nx = fromX + dx;
    if (!inBounds(ny, nx)) continue;
    const target = state.board[ny][nx];
    if (target && target.owner === piece.owner) continue; // não pode ocupar própria peça
    res.push({ y: ny, x: nx, capture: !!target });
  }
  return res;
}

export function applyMove(state, from, to, cardIndex) {
  if (state.winner) return state;
  const piece = state.board[from.y][from.x];
  if (!piece || piece.owner !== state.currentPlayer) return state;
  const valid = getValidMoves(state, from.y, from.x, cardIndex);
  if (!valid.find((m) => m.y === to.y && m.x === to.x)) return state;

  const next = structuredClone(state);
  // mover/capturar
  const target = next.board[to.y][to.x];
  if (target && target.type === 'master') {
    next.winner = piece.owner; // captura do mestre
  }
  next.board[to.y][to.x] = { ...piece };
  next.board[from.y][from.x] = null;

  // vitória por templo
  if (piece.type === 'master') {
    if (to.y === TEMPLE_B.y && to.x === TEMPLE_B.x && piece.owner === 'A') next.winner = 'A';
    if (to.y === TEMPLE_A.y && to.x === TEMPLE_A.x && piece.owner === 'B') next.winner = 'B';
  }

  // troca de carta usada pela "próxima" do jogador (independente por jogador)
  const owner = piece.owner;
  const used = next.hands[owner][cardIndex];
  next.hands[owner][cardIndex] = next.next[owner];
  // escolhe próxima carta aleatória para o jogador (independente)
  const pool = owner === 'A' ? next.deckA : next.deckB;
  if (pool.length === 0) {
    // quando esgota, reembaralha todas as cartas evitando duplicar as que estão nas mãos e próximas
    const excludeNames = new Set([
      next.hands.A[0]?.name, next.hands.A[1]?.name,
      next.hands.B[0]?.name, next.hands.B[1]?.name,
      next.next.A?.name, next.next.B?.name,
    ].filter(Boolean));
    const re = CARDS.filter(c => !excludeNames.has(c.name)).map(c => ({ ...c }));
    // simples Fisher-Yates
    for (let i = re.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [re[i], re[j]] = [re[j], re[i]];
    }
    if (owner === 'A') next.deckA = re; else next.deckB = re;
  }
  const pool2 = owner === 'A' ? next.deckA : next.deckB;
  const candidate = pool2.shift();
  // garante que próxima carta dos dois jogadores não seja a mesma
  if (candidate && candidate.name === next.next[owner === 'A' ? 'B' : 'A']?.name) {
    const alt = pool2.shift();
    if (alt) next.next[owner] = alt; else next.next[owner] = candidate;
  } else {
    next.next[owner] = candidate || next.next[owner];
  }

  // alterna jogador
  next.currentPlayer = owner === 'A' ? 'B' : 'A';
  next.selected = null;
  next.selectedCardIndex = null;
  return next;
}