import React, { useEffect, useMemo, useRef, useState } from 'react';
import { initState, getValidMoves, applyMove, passTurn, TURN_MS, findRestorePosition, findRestorePositionFromInitial, TEMPLE_A, TEMPLE_B, BOARD_SIZE } from '../../game/onitama/logic';
import { Board } from './Board';
import { CardPanel } from './CardPanel';
import { emitGameState, subscribeGameState } from '../../api/ws';
import { carregarUsuarioPorHash, atualizarMoedas } from '../../api/usuarios';
import { getUsuarioHash } from '../../api/http';
import { stopBattleMusic, playVictoryAudio } from '../../utils/bgMusic';

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
  const playedWinSoundRef = useRef(false);
  const orientation = role === 'host' ? 'south' : 'north';
  const myPlayer = role === 'host' ? 'A' : 'B';
  const myPowers = useMemo(() => powers?.[myPlayer] || [null, null, null], [powers, myPlayer]);
  const [activePowerIdx, setActivePowerIdx] = useState(null);
  const [bombTarget, setBombTarget] = useState(null);
  const [showBombError, setShowBombError] = useState(false);
  const bombErrorRef = useRef(null);
  const [healAt, setHealAt] = useState(null);
  const [swapAt, setSwapAt] = useState(null);
  const prevStateRef = useRef(null);
  const lastBombTsRef = useRef(0);
  const isGameOver = !!state?.winner;
  const isBlocked = blocked || isGameOver;
  const rewardGrantedRef = useRef(false);

  const myCards = useMemo(() => state.hands[myPlayer], [state, myPlayer]);
  const isCatSkin = useMemo(() => {
    const s = skins?.[myPlayer];
    const base = s?.base || s?.folder || '';
    return String(base).toLowerCase() === 'gato';
  }, [skins, myPlayer]);
  const isDogSkin = useMemo(() => {
    const s = skins?.[myPlayer];
    const base = s?.base || s?.folder || '';
    return String(base).toLowerCase() === 'cachorro';
  }, [skins, myPlayer]);

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
      setActivePowerIdx(null);
      if (!st?.fx?.bombTarget) setBombTarget(null);
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
        // Sinaliza visualmente que o tempo esgotou APENAS para o jogador da vez no cliente correspondente
        if (state.currentPlayer === myPlayer) {
          setShowTimeoutMsg(true);
          setTimeout(() => setShowTimeoutMsg(false), 1800);
        }
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

  // Ao finalizar a partida, parar a música de batalha para todos
  useEffect(() => {
    if (state?.winner) {
      try { stopBattleMusic(); } catch (_) {}
    }
  }, [state?.winner]);

  // Som de vitória: toca apenas para o jogador vencedor
  useEffect(() => {
    if (state?.winner && myPlayer === state.winner && !playedWinSoundRef.current) {
      playedWinSoundRef.current = true;
      try { playVictoryAudio(); } catch (_) {}
    }
    if (!state?.winner) {
      playedWinSoundRef.current = false;
    }
  }, [state?.winner, myPlayer]);

  useEffect(() => {
    if (!state?.winner || rewardGrantedRef.current) return;
    rewardGrantedRef.current = true;
    const gain = myPlayer === state.winner ? 100 : 20;
    try {
      const hash = getUsuarioHash();
      if (!hash) { return; }
      carregarUsuarioPorHash(hash)
        .then((usuario) => {
          const id = usuario?.id_usuario;
          const current = typeof usuario?.moedas === 'number' ? usuario.moedas : Number(usuario?.moedas || 0);
          const total = (Number(current) || 0) + gain;
          if (!id) { return; }
          atualizarMoedas(id, total).catch(() => {});
        })
        .catch(() => {});
    } catch (_) {
      // falha silenciosa; não bloqueia UI de pós-jogo
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

  // Feedback visual quando tentar usar míssil no Mestre
  useEffect(() => {
    if (!showBombError || !bombErrorRef.current) return;
    try {
      const el = bombErrorRef.current;
      el.animate([
        { opacity: 0, transform: 'scale(0.98)' },
        { opacity: 1, transform: 'scale(1)' }
      ], { duration: 200, easing: 'ease-out', fill: 'forwards' });
      const hide = setTimeout(() => {
        el.animate([
          { opacity: 1 },
          { opacity: 0 }
        ], { duration: 400, easing: 'ease-in', fill: 'forwards' });
      }, 1500);
      return () => clearTimeout(hide);
    } catch (_) {}
  }, [showBombError]);

  useEffect(() => {
    const fx = state?.fx;
    if (!fx || !fx.bombTarget) return;
    const pos = fx.bombTarget; // posição em coordenadas do tabuleiro (raw)
    lastBombTsRef.current = fx.bombTarget.ts || Date.now();
    // Passa posição "raw" diretamente; Board faz o mapeamento visual por orientação
    setBombTarget(pos);
  }, [state?.fx, orientation]);

  useEffect(() => {
    const prev = prevStateRef.current;
    const curr = state;
    if (!prev || !curr || !Array.isArray(prev.board) || !Array.isArray(curr.board)) { prevStateRef.current = curr; return; }
    const n = curr.board.length;
    const toCanon = (pos) => {
      if (!pos) return pos;
      return (orientation === 'north') ? { y: BOARD_SIZE - 1 - pos.y, x: BOARD_SIZE - 1 - pos.x } : pos;
    };
    const countStudents = (bd, owner) => {
      let c = 0;
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          const p = bd[y][x];
          if (p && p.owner === owner && p.type === 'student') c++;
        }
      }
      return c;
    };
    const owner = prev.currentPlayer;
    const other = owner === 'A' ? 'B' : 'A';
    const prevOwnerCount = countStudents(prev.board, owner);
    const currOwnerCount = countStudents(curr.board, owner);
    const prevOtherCount = countStudents(prev.board, other);
    const currOtherCount = countStudents(curr.board, other);
    if (owner !== myPlayer) {
    if (currOwnerCount === prevOwnerCount + 1) {
      let pos = null;
      for (let y = 0; y < n && !pos; y++) {
        for (let x = 0; x < n; x++) {
          const a = prev.board[y][x];
          const b = curr.board[y][x];
          if (!a && b && b.owner === owner && b.type === 'student') { pos = { y, x }; break; }
        }
      }
      if (pos) {
        const cpos = toCanon(pos);
        setHealAt(cpos);
        setTimeout(() => setHealAt(null), 1100);
      }
    } else {
      let from = null;
      let to = null;
      for (let y = 0; y < n && !from; y++) {
        for (let x = 0; x < n; x++) {
          const a = prev.board[y][x];
          const b = curr.board[y][x];
          if (a && a.owner === owner && a.type === 'master' && b && b.owner === owner && b.type === 'student') { from = { y, x }; break; }
        }
      }
      for (let y = 0; y < n && !to; y++) {
        for (let x = 0; x < n; x++) {
          const a = prev.board[y][x];
          const b = curr.board[y][x];
          if (a && a.owner === owner && a.type === 'student' && b && b.owner === owner && b.type === 'master') { to = { y, x }; break; }
        }
      }
      if (from && to) {
        const cFrom = toCanon(from);
        const cTo = toCanon(to);
        setSwapAt({ from: cFrom, to: cTo });
        setTimeout(() => setSwapAt(null), 1200);
      }
    }
      if (currOtherCount === prevOtherCount - 1) {
        // Evita duplicar animação da bomba no cliente remoto:
        // 1) Se o estado atual já traz fx.bombTarget (via WS), não reemitir via diff.
        if (curr?.fx?.bombTarget) { prevStateRef.current = curr; return; }
        // 2) Se houve evento de bomba recentemente, não reaplicar via diff.
        if ((Date.now() - lastBombTsRef.current) < 3000) { prevStateRef.current = curr; return; }
        let pos = null;
        for (let y = 0; y < n && !pos; y++) {
          for (let x = 0; x < n; x++) {
            const a = prev.board[y][x];
            const b = curr.board[y][x];
            if (a && a.owner === other && a.type === 'student' && !b) { pos = { y, x }; break; }
          }
        }
        if (pos) {
          // Usa coordenadas "raw" diretamente para combinar com data-cell do Board
          setBombTarget(pos);
        }
      }
    }
    prevStateRef.current = curr;
  }, [state, orientation, myPlayer]);

  const handleSelect = ({ y, x }) => {
    if (isBlocked) return;
    if (state.currentPlayer !== myPlayer) return; // só interage no próprio turno
    // Se há poder ativo, intercepta clique para aplicar
    if (activePowerIdx != null) {
      const power = myPowers[activePowerIdx];
      // Bomba: requer seleção de peça inimiga estudante
      if (power && power.id === 5) {
        const piece = state.board[y][x];
        if (piece && piece.owner !== myPlayer) {
          if (piece.type === 'master') {
            // erro: míssil não funciona no Mestre
            setShowBombError(true);
            setTimeout(() => setShowBombError(false), 1800);
            return; // mantém poder ativo para nova seleção
          }
          if (piece.type === 'student') {
            try { new Audio('/poderes/bomba/bomba_click.mp3').play().catch(() => {}); } catch (_) {}
            setBombTarget({ y, x });
            if (roomCode) {
              const fx = { bombTarget: { y, x, owner: myPlayer, ts: Date.now() } };
              emitGameState(roomCode, { ...state, fx });
            }
          }
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
          setSwapAt({ from: masterPos, to: { y, x } });
          setTimeout(() => setSwapAt(null), 1200);
          // efetua a troca (swap de objetos)
          const masterPiece = next.board[masterPos.y][masterPos.x];
          const studentPiece = next.board[y][x];
          next.board[masterPos.y][masterPos.x] = studentPiece;
          next.board[y][x] = masterPiece;
          try { new Audio('/sound/fx/carta/carta_1.wav').play().catch(() => {}); } catch (_) {}
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
    try { new Audio('/sound/fx/carta/carta_1.wav').play().catch(() => {}); } catch (_) {}
    // reproduz som de "soco" apenas para captura de peão por movimento normal (exceto bomba)
    if (willCaptureStudent) {
      try {
        if (isCatSkin) {
          new Audio('/sound/fx/dano/miado.ogg').play().catch(() => {});
        } else if (isDogSkin) {
          new Audio('/sound/fx/dano/latido.wav').play().catch(() => {});
        } else {
          new Audio('/sound/fx/soco/soco_4.wav').play().catch(() => {});
        }
      } catch (_) {}
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
    try {
      if (isCatSkin) {
        new Audio('/sound/fx/dano/miado.ogg').play().catch(() => {});
      } else if (isDogSkin) {
        new Audio('/sound/fx/dano/latido.wav').play().catch(() => {});
      }
    } catch (_) {}
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
    setHealAt(pos);
    setTimeout(() => setHealAt(null), 1100);
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
      {showBombError && (
        <div ref={bombErrorRef} style={{
          position: 'fixed',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 2000,
          background: 'linear-gradient(135deg, rgba(255,30,30,0.95), rgba(255,140,0,0.95))',
          color: '#fff',
          fontWeight: 900,
          fontSize: '20px',
          border: '3px solid rgba(255,255,255,0.75)',
          textShadow: '0 1px 10px rgba(0,0,0,0.6)',
          borderRadius: 12,
          padding: '14px 18px',
          boxShadow: '0 8px 28px rgba(0,0,0,0.45)'
        }}>O MÍSSIL DEVE SER UTILIZADO APENAS EM PEÕES</div>
      )}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
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
          healAt={healAt}
          swapAt={swapAt}
        />
        {/* Painel de poderes (lado direito) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '220px' }}>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>Poderes</div>
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
            const tooltip = p ? (
              p.id === 5
                ? 'Bomba: elimina instantaneamente um peão adversário (Não tem efeito no mestre)'
                : isHeal
                ? 'Heal: Revive o último peão eliminado para sua posição de origem ou mais próxima disponível (Não tem efeito no mestre)'
                : isMystic
                ? 'Troca: Possibilita trocar o posicionamento do mestre com algum dos peões'
                : undefined
            ) : undefined;
            return (
              <div key={idx} title={tooltip} onClick={() => {
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
                background: '#222', color: '#fff', borderRadius: '10px', padding: '10px',
                border: isActive ? '2px solid #4a90e2' : '1px solid #555',
                cursor: canUse ? 'pointer' : 'default', opacity: canUse ? 1 : 0.6,
                minHeight: '80px', display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                  {p ? (p.id === 5 ? '💣' : (isHeal ? '💖' : (isMystic ? '🔄' : '✨'))) : '—'}
                </div>
                <div style={{ fontSize: '16px' }}>
                  <div style={{ fontWeight: 'bold' }}>{label}</div>
                  <div style={{ color: '#bbb', fontSize: '13px' }}>{used ? 'Usado' : (canUse ? (isActive ? 'Selecionado' : 'Disponível') : (isHeal && !hasDefeated ? 'Sem peças a restaurar' : (isMystic && !hasMyStudent ? 'Sem peões disponíveis' : 'Indisponível')))}</div>
                </div>
              </div>
            );
          })}
          {activePowerIdx != null && myPowers[activePowerIdx]?.id === 5 && (
            <div style={{ color: '#fff', fontSize: '13px' }}>Selecione uma peça inimiga para usar o poder.</div>
          )}
          {activePowerIdx != null && myPowers[activePowerIdx]?.id === MYSTIC_SWAP_ID && (
            <div style={{ color: '#fff', fontSize: '13px' }}>Selecione um peão próprio para trocar com o Mestre.</div>
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
        scenario={scenario}
      />

      {/* Overlay de fim de jogo: vitória/derrota */}
      {isGameOver && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 5000, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Jersey 10', sans-serif" }}>
          {state.winner !== myPlayer && (
            <div style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 'calc(50% - 120px)',
              width: '100vw', height: 250,
              background: 'rgba(165,0,0,0.35)',
              borderTop: '3px solid rgba(165,0,0,0.7)',
              borderBottom: '3px solid rgba(165,0,0,0.7)',
              borderRadius: 8,
              zIndex: 0,
              pointerEvents: 'none'
            }} />
          )}
          {state.winner && (
            <div style={{
              position: 'absolute', top: 90, left: '50%', transform: 'translateX(-50%)',
              zIndex: 2,
              background: (myPlayer === state.winner) ? 'rgba(165,0,0,0.5)' : 'rgba(165,0,0,0.4)',
              color: '#FFD700',
              border: '2px solid rgba(255,255,255,0.85)',
              borderRadius: 12,
              padding: (myPlayer === state.winner) ? '16px 22px' : '12px 18px',
              textShadow: '0 1px 10px rgba(0,0,0,0.6)',
              fontWeight: 'normal',
              fontSize: (myPlayer === state.winner) ? 30 : 24,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <img src="/icons/coin.png" alt="Moedas" style={{ width: (myPlayer === state.winner) ? 30 : 24, height: (myPlayer === state.winner) ? 30 : 24 }} />
              <span>{myPlayer === state.winner ? 'PARABÉNS PELA VITÓRIA, VOCÊ GANHOU 100 MOEDAS! 🏆🏆' : 'MAIS SORTE NA PRÓXIMA! GANHOU APENAS 20 MOEDAS 😢'}</span>
            </div>
          )}
          {state.winner === myPlayer && (
            <>
              <img src="/animations/fogos.gif" alt="Fogos" style={{ position: 'absolute', left: '6%', top: '12%', width: 360, maxWidth: '40vw', opacity: 0.9, zIndex: 0, pointerEvents: 'none' }} />
              <img src="/animations/fogos.gif" alt="Fogos" style={{ position: 'absolute', right: '6%', top: '12%', width: 360, maxWidth: '40vw', opacity: 0.9, zIndex: 0, pointerEvents: 'none' }} />
              <img src="/animations/fogos.gif" alt="Fogos" style={{ position: 'absolute', left: '6%', bottom: '12%', width: 360, maxWidth: '40vw', opacity: 0.9, zIndex: 0, pointerEvents: 'none' }} />
              <img src="/animations/fogos.gif" alt="Fogos" style={{ position: 'absolute', right: '6%', bottom: '12%', width: 360, maxWidth: '40vw', opacity: 0.9, zIndex: 0, pointerEvents: 'none' }} />
            </>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, position: 'relative', zIndex: 1 }}>
            {state.winner === myPlayer ? (
              <>
                <img src="/assets/trofeu.png" alt="Troféu" style={{ width: 360, maxWidth: '60vw', position: 'relative', zIndex: 1 }} />
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
              <div style={{ fontSize: '9dvh', color: '#ff5a5a', textShadow: '0 0 10px rgba(255,90,90,0.5)', fontFamily: "'Jersey 10', sans-serif", position: 'relative', zIndex: 1 }}>GAME OVER</div>
            )}
            <button onClick={() => { if (onExit) onExit(); }} style={{
              background: '#8b0000', color: '#fff', border: 'none', padding: '12px 18px',
              cursor: 'pointer', fontSize: 18, fontWeight: 800, position: 'relative', zIndex: 1,
              boxShadow: '0 2px 0 #000'
            }}>Sair da sala</button>
          </div>
        </div>
      )}
    </div>
  );
}