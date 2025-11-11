import React, { useEffect, useMemo, useState } from 'react';
import { initState, getValidMoves, applyMove } from '../../game/onitama/logic';
import { Board } from './Board';
import { CardPanel } from './CardPanel';
import { emitGameState, subscribeGameState } from '../../api/ws';

/**
 * GameOnitama: modo local (single-client) por enquanto; integração WS será feita depois.
 */
export default function GameOnitama({ seed = undefined, roomCode, role, names }) {
  const [state, setState] = useState(() => initState(seed));
  const [validMoves, setValidMoves] = useState([]);
  const orientation = role === 'host' ? 'south' : 'north';
  const myPlayer = role === 'host' ? 'A' : 'B';

  const myCards = useMemo(() => state.hands[myPlayer], [state, myPlayer]);

  // sincronização via WS: recebe estado
  useEffect(() => {
    if (!roomCode) return;
    const off = subscribeGameState(roomCode, (st) => {
      setState(st);
      setValidMoves([]);
    });
    // Ao montar e ser host, envia estado inicial
    if (role === 'host') emitGameState(roomCode, state);
    return () => off && off();
  }, [roomCode, role]);

  const handleSelect = ({ y, x }) => {
    if (state.currentPlayer !== myPlayer) return; // só interage no próprio turno
    if (state.selectedCardIndex == null) {
      // sem carta selecionada, apenas marca peça
      setState((s) => ({ ...s, selected: { y, x } }));
      setValidMoves([]);
      return;
    }
    // com carta selecionada, computa movimentos
    const idx = state.selectedCardIndex;
    const moves = getValidMoves(state, y, x, idx);
    setState((s) => ({ ...s, selected: { y, x } }));
    setValidMoves(moves);
  };

  const handleSelectCard = (idx) => {
    if (idx === 'center') return;
    if (state.currentPlayer !== myPlayer) return; // não seleciona carta fora do turno
    setState((s) => ({ ...s, selectedCardIndex: idx }));
    // recomputa movimentos se já há peça selecionada
    if (state.selected) {
      const moves = getValidMoves(state, state.selected.y, state.selected.x, idx);
      setValidMoves(moves);
    }
  };

  const handleMove = (to) => {
    if (!state.selected || state.selectedCardIndex == null) return;
    const next = applyMove(state, state.selected, to, state.selectedCardIndex);
    setState(next);
    setValidMoves([]);
    if (roomCode) emitGameState(roomCode, next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '100%' }}>
      <div style={{ color: '#fff' }}>
        {state.winner ? (
          <div>Vitória de { (names && names[state.winner]) || (state.winner === 'A' ? 'Jogador A' : 'Jogador B') }!</div>
        ) : (
          <div>Vez de { (names && names[state.currentPlayer]) || (state.currentPlayer === 'A' ? 'Jogador A' : 'Jogador B') }</div>
        )}
      </div>
      <Board
        board={state.board}
        currentPlayer={state.currentPlayer}
        selected={state.selected}
        validMoves={validMoves}
        onSelect={handleSelect}
        onMove={handleMove}
        orientation={orientation}
      />
      <CardPanel
        myCards={myCards}
        nextCard={state.next?.[myPlayer]}
        selectedCardIndex={state.selectedCardIndex}
        onSelectCard={handleSelectCard}
        orientation={orientation}
        owner={myPlayer}
        canSelect={state.currentPlayer === myPlayer}
      />
    </div>
  );
}