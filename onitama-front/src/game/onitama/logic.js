import { shuffleDeck } from './cards';

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
  const deck = shuffleDeck(seed);
  const state = {
    board: initialBoard(),
    hands: { A: [deck[0], deck[1]], B: [deck[2], deck[3]] },
    center: deck[4],
    deck: deck.slice(5), // não usado após inicialização; mantido por referência
    currentPlayer: 'A',
    winner: null,
    selected: null, // { y, x }
    selectedCardIndex: null, // 0 ou 1
  };
  // Jogador com carta vermelha no centro inicia (regra oficial); se center.color==='red', B começa
  if (state.center?.color === 'red') state.currentPlayer = 'B';
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

  // troca de carta usada pela do centro
  const owner = piece.owner;
  const used = next.hands[owner][cardIndex];
  next.hands[owner][cardIndex] = next.center;
  next.center = used;

  // alterna jogador
  next.currentPlayer = owner === 'A' ? 'B' : 'A';
  next.selected = null;
  next.selectedCardIndex = null;
  return next;
}