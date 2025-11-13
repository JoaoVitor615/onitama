import React, { useEffect, useMemo, useRef, useState } from 'react';
import { initState, getValidMoves, applyMove, passTurn, TURN_MS, findRestorePosition, findRestorePositionFromInitial, TEMPLE_A, TEMPLE_B } from '../../game/onitama/logic';
import { Board } from './Board';
import { CardPanel } from './CardPanel';
import { emitGameState, subscribeGameState } from '../../api/ws';

/**
 * GameOnitama: modo local (single-client) por enquanto; integração WS será feita depois.
 */
export default function GameOnitama({ seed = undefined, roomCode, role, names, skins, powers, scenario = null, blocked = false, onExit = null }) {
  const HEAL_POWER_ID = 11; // Heal identificado pelo id do produto
  const MYSTIC_SWAP_ID = 12; // Troca Mística identificado pelo id do produto
  const [state, setState] = useState(() => initState(seed));
  const [validMoves, setValidMoves] = useState([]);
  const [remainingMs, setRemainingMs] = useState(TURN_MS);
  const lastTurnStartRef = useRef(state.turnStartedAt);
  const [showTimeoutMsg, setShowTimeoutMsg] = useState(false);
  const timeoutRef = useRef(null);
  const playedLoseSoundRef = useRef(false);
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
        // Sinaliza visualmente que o tempo esgotou
        setShowTimeoutMsg(true);
        setTimeout(() => setShowTimeoutMsg(false), 1800);
        const next = passTurn(state);
        lastTurnStartRef.current = next.turnStartedAt;
        setState(next);
        setValidMoves([]);
        if (roomCode) emitGameState(roomCode, next);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [state, roomCode]);

  // Som de derrota: toca quando a partida termina e eu NÃO sou o vencedor
  useEffect(() => {
    if (state?.winner && myPlayer !== state.winner && !playedLoseSoundRef.current) {
      playedLoseSoundRef.current = true;
      try { new Audio('/sound/fx/ui/erro_1.wav').play().catch(() => {}); } catch (_) {}
    }
    if (!state?.winner) {
      playedLoseSoundRef.current = false;
    }
  }, [state?.winner, myPlayer]);

  // Animação do banner de tempo esgotado (fade-in/out)
  useEffect(() => {
    if (!showTimeoutMsg || !timeoutRef.current) return;
    const el = timeoutRef.current;
    try {
      el.animate([
        { opacity: 0, transform: 'translateY(-8px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 250, easing: 'ease-out', fill: 'forwards' });
      const hide = setTimeout(() => {
        el.animate([
          { opacity: 1 },
          { opacity: 0 }
        ], { duration: 400, easing: 'ease-in', fill: 'forwards' });
      }, 1400);
      return () => clearTimeout(hide);
    } catch (_) {}
  }, [showTimeoutMsg]);

  const handleSelect = ({ y, x }) => {
    if (isBlocked) return;
    if (state.currentPlayer !== myPlayer) return; // só interage no próprio turno
    // Se há poder ativo, intercepta clique para aplicar
    if (activePowerIdx != null) {
      const power = myPowers[activePowerIdx];
      // Bomba: requer seleção de peça inimiga estudante
      if (power && power.id === 5) {
        const piece = state.board[y][x];
        if (piece && piece.owner !== myPlayer && piece.type === 'student') {
          // dispara animação de bomba nesta célula
          setBombTarget({ y, x });
        }
      }
      // Troca Mística: selecionar um peão próprio (não Mestre) para trocar com o Mestre
      if (power && power.id === MYSTIC_SWAP_ID) {
        const piece = state.board[y][x];
        if (piece && piece.owner === myPlayer && piece.type === 'student') {
          const next = structuredClone(state);
          // localizar Mestre do jogador atual
          let masterPos = null;
          for (let iy = 0; iy < next.board.length; iy++) {
            for (let ix = 0; ix < next.board[iy].length; ix++) {
              const p = next.board[iy][ix];
              if (p && p.owner === myPlayer && p.type === 'master') {
                masterPos = { y: iy, x: ix };
                break;
              }
            }
            if (masterPos) break;
          }
          if (!masterPos) return; // não deveria acontecer
          // efetua a troca (swap de objetos)
          const masterPiece = next.board[masterPos.y][masterPos.x];
          const studentPiece = next.board[y][x];
          next.board[masterPos.y][masterPos.x] = studentPiece;
          next.board[y][x] = masterPiece;
          // checagem de vitória por templo após o Mestre mover
          const newMasterPos = { y, x };
          if (myPlayer === 'A' && newMasterPos.y === TEMPLE_B.y && newMasterPos.x === TEMPLE_B.x) {
            next.winner = 'A';
          } else if (myPlayer === 'B' && newMasterPos.y === TEMPLE_A.y && newMasterPos.x === TEMPLE_A.x) {
            next.winner = 'B';
          }
          // marca poder usado
          const used = Array.isArray(next.powersUsed?.[myPlayer]) ? [...next.powersUsed[myPlayer]] : [false, false, false];
          used[activePowerIdx] = true;
          next.powersUsed = { ...next.powersUsed, [myPlayer]: used };
          // passa o turno após uso do poder
          const after = passTurn(next);
          setActivePowerIdx(null);
          setState(after);
          setValidMoves([]);
          if (roomCode) emitGameState(roomCode, after);
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
    // detecta se haverá captura de peão (alvo é estudante inimigo) antes de aplicar o movimento
    const preTarget = state.board[to.y][to.x];
    const willCaptureStudent = !!preTarget && preTarget.type === 'student' && preTarget.owner !== state.currentPlayer;
    const next = applyMove(state, state.selected, to, state.selectedCardIndex);
    setState(next);
    setValidMoves([]);
    // reproduz som de "soco" apenas para captura de peão por movimento normal (exceto bomba)
    if (willCaptureStudent) {
      try { new Audio('/sound/fx/soco/soco_4.wav').play().catch(() => {}); } catch (_) {}
    }
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
    // registra em graveyard e pilha do dono da peça eliminada
    if (piece && piece.type === 'student') {
      next.graveyard[piece.owner].students += 1;
      if (piece.initial) {
        next.defeatedStack[piece.owner].push({ y: piece.initial.y, x: piece.initial.x });
      }
    }
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

  // Uso do Heal: restaura o último peão derrotado (nunca o Mestre)
  const useHeal = () => {
    if (isBlocked || state.currentPlayer !== myPlayer) return;
    const power = myPowers[activePowerIdx];
    const isHeal = power && (power.id === HEAL_POWER_ID);
    if (!isHeal) return;
    const stack = state.defeatedStack?.[myPlayer] || [];
    if (!stack.length) { setActivePowerIdx(null); return; }
    const initial = stack[stack.length - 1];
    const pos = findRestorePositionFromInitial(state.board, initial) || findRestorePosition(state.board, myPlayer);
    if (!pos) { setActivePowerIdx(null); return; }
    const next = structuredClone(state);
    next.board[pos.y][pos.x] = { owner: myPlayer, type: 'student' };
    next.graveyard[myPlayer].students = Math.max(0, (next.graveyard[myPlayer].students || 0) - 1);
    // remove da pilha o último derrotado
    next.defeatedStack[myPlayer] = stack.slice(0, stack.length - 1);
    const used = Array.isArray(next.powersUsed?.[myPlayer]) ? [...next.powersUsed[myPlayer]] : [false, false, false];
    used[activePowerIdx] = true;
    next.powersUsed = { ...next.powersUsed, [myPlayer]: used };
    const after = passTurn(next);
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
      {showTimeoutMsg && (
        <div ref={timeoutRef} style={{
          background: 'rgba(255,90,90,0.85)',
          color: '#fff',
          fontWeight: 800,
          border: '2px solid rgba(255,255,255,0.65)',
          textShadow: '0 0 6px rgba(255,255,255,0.4)',
          borderRadius: 10,
          padding: '8px 12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.35)'
        }}>Tempo de jogada esgotado!</div>
      )}
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
          myPlayer={myPlayer}
        />
        {/* Painel de poderes (lado direito) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '160px' }}>
          <div style={{ color: '#fff', fontWeight: 'bold' }}>Poderes</div>
          {myPowers.map((p, idx) => {
            const used = state.powersUsed?.[myPlayer]?.[idx];
            const isActive = activePowerIdx === idx;
            const isHeal = p && (p.id === HEAL_POWER_ID);
            const isMystic = p && (p.id === MYSTIC_SWAP_ID);
            const hasDefeated = (state.graveyard?.[myPlayer]?.students || 0) > 0;
            // precisa ter ao menos um peão próprio no tabuleiro para usar Troca Mística
            let hasMyStudent = false;
            if (Array.isArray(state.board)) {
              outer: for (let iy = 0; iy < state.board.length; iy++) {
                for (let ix = 0; ix < state.board[iy].length; ix++) {
                  const pc = state.board[iy][ix];
                  if (pc && pc.owner === myPlayer && pc.type === 'student') { hasMyStudent = true; break outer; }
                }
              }
            }
            const canUseBase = !isBlocked && state.currentPlayer === myPlayer && !used && p != null;
            const canUse = canUseBase && (!isHeal || hasDefeated) && (!isMystic || hasMyStudent);
            const label = p?.nome || (p?.id ? `Poder ${p.id}` : 'Vazio');
            const ext = p?.extensao || 'png';
            const imgSrc = p?.imagem ? `/skins/${p.imagem}/${p.imagem}_poder.${ext}` : null; // opcional, caso haja imagem específica
            return (
              <div key={idx} onClick={() => {
                if (!canUse) return;
                setActivePowerIdx(idx);
                // aplica imediatamente se for Heal
                const pw = myPowers[idx];
                const isHealNow = pw && (pw.id === HEAL_POWER_ID);
                if (isHealNow) {
                  // ligeiro atraso para feedback de seleção
                  setTimeout(() => useHeal(), 0);
                }
              }} style={{
                background: '#222', color: '#fff', borderRadius: '8px', padding: '8px',
                border: isActive ? '2px solid #4a90e2' : '1px solid #555',
                cursor: canUse ? 'pointer' : 'default', opacity: canUse ? 1 : 0.6,
                minHeight: '60px', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p ? (p.id === 5 ? '💣' : (isHeal ? '💖' : (isMystic ? '🔄' : '✨'))) : '—'}
                </div>
                <div style={{ fontSize: '14px' }}>
                  <div style={{ fontWeight: 'bold' }}>{label}</div>
                  <div style={{ color: '#bbb', fontSize: '12px' }}>{used ? 'Usado' : (canUse ? (isActive ? 'Selecionado' : 'Disponível') : (isHeal && !hasDefeated ? 'Sem peças a restaurar' : (isMystic && !hasMyStudent ? 'Sem peões disponíveis' : 'Indisponível')))}</div>
                </div>
              </div>
            );
          })}
          {activePowerIdx != null && myPowers[activePowerIdx]?.id === 5 && (
            <div style={{ color: '#fff', fontSize: '12px' }}>Selecione uma peça inimiga para usar o poder.</div>
          )}
          {activePowerIdx != null && myPowers[activePowerIdx]?.id === MYSTIC_SWAP_ID && (
            <div style={{ color: '#fff', fontSize: '12px' }}>Selecione um peão próprio para trocar com o Mestre.</div>
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

      {/* Overlay de fim de jogo: vitória/derrota */}
      {isGameOver && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 5000, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Jersey 10', sans-serif" }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            {state.winner === myPlayer ? (
              <>
                <img src="/assets/trofeu.png" alt="Troféu" style={{ width: 360, maxWidth: '60vw' }} />
                <div className="victoryText" aria-label="YOU WIN!" style={{ color: '#ffd24d', textShadow: '0 0 12px rgba(255,210,77,0.6)', fontFamily: "'Jersey 10', sans-serif" }}>
                  {/* Texto com animação letra a letra e exclamação piscando */}
                  {(() => {
                    const txt = 'YOU WIN!';
                    const letters = txt.split('');
                    const letterDelay = 0.2; // segundos por letra
                    return letters.map((ch, idx) => {
                      if (ch === ' ') {
                        return <span key={idx} className="victory-space" aria-hidden="true">&nbsp;</span>;
                      }
                      const isExcl = ch === '!';
                      const delay = idx * letterDelay;
                      const style = isExcl
                        ? { animationDelay: `${delay + 0.2}s` }
                        : { animationDelay: `${delay}s` };
                      const className = isExcl ? 'victory-excl' : 'victory-letter';
                      return (
                        <span key={idx} className={className} style={style}>{ch}</span>
                      );
                    });
                  })()}
                </div>
              </>
            ) : (
              <div style={{ fontSize: '9dvh', color: '#ff5a5a', textShadow: '0 0 10px rgba(255,90,90,0.5)', fontFamily: "'Jersey 10', sans-serif" }}>GAME OVER</div>
            )}
            <button onClick={() => { if (onExit) onExit(); }} style={{
              background: '#8b0000', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: 10,
              cursor: 'pointer', fontSize: 18, fontWeight: 800
            }}>Sair da sala</button>
          </div>
        </div>
      )}
    </div>
  );
}