import React, { useEffect, useMemo, useRef, useState } from 'react';
import { initState, getValidMoves, applyMove, passTurn, TURN_MS } from '../../game/onitama/logic';
import { Board } from './Board';
import { CardPanel } from './CardPanel';
import { emitGameState, subscribeGameState } from '../../api/ws';

/**
 * GameOnitama: modo local (single-client) por enquanto; integração WS será feita depois.
 */
export default function GameOnitama({ seed = undefined, roomCode, role, names, skins, powers, scenario = null, blocked = false }) {
  const [state, setState] = useState(() => initState(seed));
  const [validMoves, setValidMoves] = useState([]);
  const [remainingMs, setRemainingMs] = useState(TURN_MS);
  const lastTurnStartRef = useRef(state.turnStartedAt);
  const orientation = role === 'host' ? 'south' : 'north';
  const myPlayer = role === 'host' ? 'A' : 'B';
  const myPowers = useMemo(() => powers?.[myPlayer] || [null, null, null], [powers, myPlayer]);
  const [activePowerIdx, setActivePowerIdx] = useState(null);
  const [bombTarget, setBombTarget] = useState(null);
  const isGameOver = !!state?.winner;
  const isBlocked = blocked || isGameOver;

  const myCards = useMemo(() => state.hands[myPlayer], [state, myPlayer]);

  // sincronização via WS: recebe estado
  useEffect(() => {
    if (!roomCode) return;
    const off = subscribeGameState(roomCode, (st) => {
      setState(st);
      setValidMoves([]);
      // reseta contagem de tempo ao receber novo estado
      if (st && st.turnStartedAt) {
        lastTurnStartRef.current = st.turnStartedAt;
        const deadline = st.turnStartedAt + TURN_MS;
        setRemainingMs(Math.max(0, deadline - Date.now()));
      }
      // ao receber estado, limpa power ativo e animação pendente
      setActivePowerIdx(null);
      setBombTarget(null);
    });
    // Ao montar e ser host, envia estado inicial
    if (role === 'host') emitGameState(roomCode, state);
    return () => off && off();
  }, [roomCode, role]);

  // Timer de turno: atualiza restante e aplica passagem quando expira
  useEffect(() => {
    const interval = setInterval(() => {
      const deadline = (state?.turnStartedAt || Date.now()) + TURN_MS;
      const rem = Math.max(0, deadline - Date.now());
      setRemainingMs(rem);
      if (rem === 0 && !state.winner) {
        // Evita repetir para o mesmo início de turno
        if (lastTurnStartRef.current !== state.turnStartedAt) return;
        // Efetua passagem de turno e emite estado (qualquer cliente pode emitir para garantir liveness)
        const next = passTurn(state);
        lastTurnStartRef.current = next.turnStartedAt;
        setState(next);
        setValidMoves([]);
        if (roomCode) emitGameState(roomCode, next);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [state, roomCode]);

  const handleSelect = ({ y, x }) => {
    if (isBlocked) return;
    if (state.currentPlayer !== myPlayer) return; // só interage no próprio turno
    // Se há poder ativo, intercepta clique para aplicar
    if (activePowerIdx != null) {
      const power = myPowers[activePowerIdx];
      if (power && power.id === 5) {
        const piece = state.board[y][x];
        if (piece && piece.owner !== myPlayer && piece.type === 'student') {
          // dispara animação de bomba nesta célula
          setBombTarget({ y, x });
        }
      }
      return; // não prossegue com seleção normal
    }
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
    if (isBlocked) return;
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
    if (isBlocked) return;
    if (!state.selected || state.selectedCardIndex == null) return;
    const next = applyMove(state, state.selected, to, state.selectedCardIndex);
    setState(next);
    setValidMoves([]);
    if (roomCode) emitGameState(roomCode, next);
  };

  // Conclusão da animação de bomba: remove peça, consome poder e passa turno
  const handleBombDone = () => {
    if (!bombTarget || activePowerIdx == null) return;
    const power = myPowers[activePowerIdx];
    if (!power || power.id !== 5) return;
    const { y, x } = bombTarget;
    const piece = state.board[y][x];
    if (!piece || piece.owner === myPlayer || piece.type !== 'student') { setBombTarget(null); return; }
    const next = structuredClone(state);
    next.board[y][x] = null; // elimina o peão inimigo
    // marca poder usado
    const used = Array.isArray(next.powersUsed?.[myPlayer]) ? [...next.powersUsed[myPlayer]] : [false, false, false];
    used[activePowerIdx] = true;
    next.powersUsed = { ...next.powersUsed, [myPlayer]: used };
    // passa o turno após uso do poder
    const after = passTurn(next);
    setBombTarget(null);
    setActivePowerIdx(null);
    setState(after);
    setValidMoves([]);
    if (roomCode) emitGameState(roomCode, after);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '100%' }}>
      <div style={{ color: '#fff' }}>
        {state.winner ? (
          <div>Vitória de { (names && names[state.winner]) || (state.winner === 'A' ? 'Jogador A' : 'Jogador B') }!</div>
        ) : (
          <div>
            Vez de { (names && names[state.currentPlayer]) || (state.currentPlayer === 'A' ? 'Jogador A' : 'Jogador B') }
            {' '}• Tempo: { Math.ceil(remainingMs / 1000) }s
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <Board
          board={state.board}
          currentPlayer={state.currentPlayer}
          selected={state.selected}
          validMoves={validMoves}
          onSelect={handleSelect}
          onMove={handleMove}
          orientation={orientation}
          skins={skins}
          scenario={scenario}
          bombTarget={bombTarget}
          onBombDone={handleBombDone}
        />
        {/* Painel de poderes (lado direito) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '160px' }}>
          <div style={{ color: '#fff', fontWeight: 'bold' }}>Poderes</div>
          {myPowers.map((p, idx) => {
            const used = state.powersUsed?.[myPlayer]?.[idx];
            const isActive = activePowerIdx === idx;
            const canUse = !isBlocked && state.currentPlayer === myPlayer && !used && p != null;
            const label = p?.nome || (p?.id ? `Poder ${p.id}` : 'Vazio');
            const ext = p?.extensao || 'png';
            const imgSrc = p?.imagem ? `/skins/${p.imagem}/${p.imagem}_poder.${ext}` : null; // opcional, caso haja imagem específica
            return (
              <div key={idx} onClick={() => { if (canUse) setActivePowerIdx(idx); }} style={{
                background: '#222', color: '#fff', borderRadius: '8px', padding: '8px',
                border: isActive ? '2px solid #4a90e2' : '1px solid #555',
                cursor: canUse ? 'pointer' : 'default', opacity: canUse ? 1 : 0.6,
                minHeight: '60px', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p ? (p.id === 5 ? '💣' : '✨') : '—'}
                </div>
                <div style={{ fontSize: '14px' }}>
                  <div style={{ fontWeight: 'bold' }}>{label}</div>
                  <div style={{ color: '#bbb', fontSize: '12px' }}>{used ? 'Usado' : (canUse ? (isActive ? 'Selecionado' : 'Disponível') : 'Indisponível')}</div>
                </div>
              </div>
            );
          })}
          {activePowerIdx != null && (
            <div style={{ color: '#fff', fontSize: '12px' }}>Selecione uma peça inimiga para usar o poder.</div>
          )}
        </div>
      </div>
      <CardPanel
        myCards={myCards}
        nextCard={state.next?.[myPlayer]}
        selectedCardIndex={state.selectedCardIndex}
        onSelectCard={handleSelectCard}
        orientation={orientation}
        owner={myPlayer}
        canSelect={!isBlocked && state.currentPlayer === myPlayer}
      />
    </div>
  );
}