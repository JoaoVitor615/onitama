import React, { useEffect, useRef, useState } from 'react';
import { BOARD_SIZE } from '../../game/onitama/logic';

/**
 * orientation: 'south' (padrão, sem rotação) ou 'north' (rotaciona 180°)
 */
export function Board({ board, currentPlayer, selected, validMoves, onSelect, onMove, orientation = 'south', skins = {}, scenario = null, bombTarget = null, onBombDone = null, myPlayer = null, healAt = null, swapAt = null }) {
  const containerRef = useRef(null);
  const missileRef = useRef(null);
  const animatingRef = useRef(false);
  const [bombVisible, setBombVisible] = useState(false);
  const [missileStart, setMissileStart] = useState({ x: 0, y: -24 });
  const [missileEnd, setMissileEnd] = useState({ x: 0, y: 0 });
  const [explosionVisible, setExplosionVisible] = useState(false);
  const [explosionPos, setExplosionPos] = useState({ x: 0, y: 0 });
  const [healVisible, setHealVisible] = useState(false);
  const [healPos, setHealPos] = useState({ x: 0, y: 0 });
  const [swapVisible, setSwapVisible] = useState(false);
  const [swapPos, setSwapPos] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const healRef = useRef(null);
  const swapRef1 = useRef(null);
  const swapRef2 = useRef(null);
  const toCanonical = (y, x) => {
    if (orientation === 'north') return { y: BOARD_SIZE - 1 - y, x: BOARD_SIZE - 1 - x };
    return { y, x };
  };

  // Preparar coordenadas quando o alvo muda e tornar o míssil visível
  useEffect(() => {
    if (!bombTarget) { setBombVisible(false); return; }
    const container = containerRef.current;
    if (!container) { console.warn('[Bomba] container do tabuleiro não encontrado'); return; }
    const cellEl = container.querySelector(`[data-cell="${bombTarget.y}-${bombTarget.x}"]`);
    if (!cellEl) { console.warn('[Bomba] célula alvo não encontrada', bombTarget); return; }
    const rr = cellEl.getBoundingClientRect();
    const endX = rr.left + rr.width / 2; // coordenada de tela (viewport)
    const endY = rr.top + rr.height / 2;  // coordenada de tela (viewport)
    console.log('[Bomba] alvo (centro da peça em viewport):', { cell: `${bombTarget.y}-${bombTarget.x}`, endX, endY });
    console.log('[Bomba] origem (topo da tela):', { x: endX, y: 0 });
    setMissileStart({ x: endX, y: 0 });
    setMissileEnd({ x: endX, y: endY });
    setBombVisible(true);
  }, [bombTarget]);

  // Iniciar animação somente após o míssil estar montado no DOM
  useEffect(() => {
    if (!(bombVisible && missileRef.current)) return;
    if (animatingRef.current) return; // evita múltiplos disparos
    const duration = 2000;
    const endY = missileEnd.y;
    const endX = missileStart.x;
    console.log('[Bomba] iniciar animação', { from: missileStart, to: missileEnd, duration });
    animatingRef.current = true;
    (async () => {
      try {
        const anime = await import('https://esm.sh/animejs@3.2.1');
        // posição inicial
        missileRef.current.style.left = `${endX}px`;
        missileRef.current.style.top = `0px`;
        anime.default({
          targets: missileRef.current,
          translateY: [0, endY],
          easing: 'easeInCubic',
          duration,
          complete: () => {
            console.log('[Bomba] animação concluída em', { x: endX, y: endY });
            setBombVisible(false);
            animatingRef.current = false;
            setExplosionPos({ x: endX, y: endY });
            setExplosionVisible(true);
            setTimeout(() => {
              setExplosionVisible(false);
              onBombDone && onBombDone();
            }, 900);
          }
        });
      } catch (_) {
        console.warn('[Bomba] anime.js indisponível, usando WAAPI fallback');
        // Fallback WAAPI
        requestAnimationFrame(() => {
          if (!missileRef.current) return;
          missileRef.current.style.left = `${endX}px`;
          missileRef.current.style.top = `0px`;
          const anim = missileRef.current.animate([
            { transform: 'translateX(-50%) translateY(0px)' },
            { transform: `translateX(-50%) translateY(${endY}px)` },
          ], { duration, easing: 'ease-in', fill: 'forwards' });
          anim.onfinish = () => {
            console.log('[Bomba] animação (WAAPI) concluída em', { x: endX, y: endY });
            setBombVisible(false);
            animatingRef.current = false;
            setExplosionPos({ x: endX, y: endY });
            setExplosionVisible(true);
            setTimeout(() => {
              setExplosionVisible(false);
              onBombDone && onBombDone();
            }, 900);
          };
        });
      }
    })();
  }, [bombVisible, missileStart, missileEnd, onBombDone]);

  useEffect(() => {
    if (!healAt) { setHealVisible(false); return; }
    const container = containerRef.current;
    if (!container) return;
    const cellEl = container.querySelector(`[data-cell="${healAt.y}-${healAt.x}"]`);
    if (!cellEl) return;
    const rr = cellEl.getBoundingClientRect();
    setHealPos({ x: rr.left + rr.width / 2, y: rr.top + rr.height / 2 });
    setHealVisible(true);
  }, [healAt]);

  useEffect(() => {
    if (!healVisible || !healRef.current) return;
    try {
      const el = healRef.current;
      el.animate([
        { opacity: 0, transform: 'translate(-50%, -50%) scale(0.6)' },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1.05)' },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }
      ], { duration: 600, easing: 'ease-out', fill: 'forwards' });
      const hide = setTimeout(() => {
        el.animate([
          { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
          { opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' }
        ], { duration: 350, easing: 'ease-in', fill: 'forwards' });
        setTimeout(() => setHealVisible(false), 360);
      }, 650);
      return () => clearTimeout(hide);
    } catch (_) {}
  }, [healVisible]);

  useEffect(() => {
    if (!swapAt || !swapAt.from || !swapAt.to) { setSwapVisible(false); return; }
    const container = containerRef.current;
    if (!container) return;
    const cellFrom = container.querySelector(`[data-cell="${swapAt.from.y}-${swapAt.from.x}"]`);
    const cellTo = container.querySelector(`[data-cell="${swapAt.to.y}-${swapAt.to.x}"]`);
    if (!cellFrom || !cellTo) return;
    const rf = cellFrom.getBoundingClientRect();
    const rt = cellTo.getBoundingClientRect();
    setSwapPos({ x1: rf.left + rf.width / 2, y1: rf.top + rf.height / 2, x2: rt.left + rt.width / 2, y2: rt.top + rt.height / 2 });
    setSwapVisible(true);
  }, [swapAt]);

  useEffect(() => {
    if (!swapVisible) return;
    try {
      const run = (el) => el && el.animate([
        { opacity: 0, transform: 'translate(-50%, -50%) rotate(-20deg) scale(0.7)' },
        { opacity: 1, transform: 'translate(-50%, -50%) rotate(0deg) scale(1)' },
        { opacity: 1, transform: 'translate(-50%, -50%) rotate(20deg) scale(1)' },
      ], { duration: 700, easing: 'ease-out', direction: 'alternate', iterations: 2, fill: 'forwards' });
      run(swapRef1.current);
      run(swapRef2.current);
      const hide = setTimeout(() => setSwapVisible(false), 1400);
      return () => clearTimeout(hide);
    } catch (_) {}
  }, [swapVisible]);

  const isTempleCanonical = (y, x) => (y === 0 && x === 2) || (y === BOARD_SIZE - 1 && x === 2);

  const scenarioSrc = scenario && scenario.folder && scenario.base ? `/cenarios/${scenario.folder}/${scenario.base}_tabuleiro.${scenario.ext || 'png'}` : null;
  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
    gap: '4px',
    width: 'min(600px, 90vw)',
    backgroundImage: scenarioSrc ? `url(${scenarioSrc})` : undefined,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    aspectRatio: '1',
    position: 'relative',
  };
  return (
    <div ref={containerRef} style={containerStyle}>
      {Array.from({ length: BOARD_SIZE }).map((_, y) => (
        Array.from({ length: BOARD_SIZE }).map((_, x) => {
          const { y: cy, x: cx } = toCanonical(y, x);
          const piece = board[cy][cx];
          const isSelected = selected && selected.y === cy && selected.x === cx;
          const canMove = validMoves?.find((m) => m.y === cy && m.x === cx);
          const hasScenario = !!scenarioSrc;
          const bgBase = hasScenario ? 'transparent' : ((y + x) % 2 === 0 ? '#d2b48c' : '#a67c52');
          const baseBg = isSelected ? 'rgba(74,144,226,0.55)' : canMove ? 'rgba(60,118,61,0.55)' : bgBase;
          const isOpponentPiece = !!(piece && myPlayer && piece.owner !== myPlayer);
          const bg = isOpponentPiece ? `linear-gradient(rgba(255,60,60,0.18), rgba(255,60,60,0.18)), ${baseBg}` : baseBg;
          const temple = isTempleCanonical(cy, cx);
          const border = temple ? '3px solid #e0e' : '2px solid rgba(255,255,255,0.2)';
          const ownerSkin = skins?.[piece?.owner];
          const imgBase = ownerSkin?.base;
          const imgFolder = ownerSkin?.folder;
          const imgExt = ownerSkin?.ext || 'png';
          const imgName = piece && imgBase ? `${imgBase}_${piece.type === 'master' ? 'mestre' : 'peao'}.${imgExt}` : null;
          const imgSrc = (imgFolder && imgName) ? `/skins/${imgFolder}/${imgName}` : null;
          const isBombHere = bombTarget && bombVisible && bombTarget.y === cy && bombTarget.x === cx;
          return (
            <div key={`${y}-${x}`} data-cell={`${cy}-${cx}`} style={{
              aspectRatio: '1',
              background: bg,
              border,
              borderRadius: '6px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: piece && piece.owner === currentPlayer ? 'pointer' : canMove ? 'pointer' : 'default'
            }}
            onClick={() => {
              if (canMove) return onMove({ y: cy, x: cx });
              onSelect({ y: cy, x: cx });
            }}
            >
              {piece && (
                imgSrc ? (
                  <img src={imgSrc} alt={piece.type}
                    style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{
                    width: '70%', height: '70%',
                    borderRadius: '50%',
                    background: piece.owner === 'A' ? '#222' : '#eee',
                    color: piece.owner === 'A' ? '#fff' : '#000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold',
                  }}>
                    {piece.type === 'master' ? 'M' : 'S'}
                  </div>
                )
              )}
              {/* Removido míssil por célula — agora usamos overlay global */}
            </div>
          );
        })
      ))}
      {bombVisible && (
        <div ref={missileRef} style={{
          position: 'fixed',
          left: `${missileStart.x}px`,
          top: 0,
          transform: 'translateX(-50%) translateY(0px)',
          pointerEvents: 'none',
          zIndex: 9999
        }}>
          <img src="/assets/missil.png" alt="míssil" style={{
            width: 48,
            height: 48,
            pointerEvents: 'none',
            transform: 'rotate(180deg)'
          }} />
        </div>
      )}
      {explosionVisible && (
        <img
          src="/animations/explosion.gif"
          alt="explosão"
          style={{
            position: 'fixed',
            left: `${explosionPos.x}px`,
            top: `${explosionPos.y}px`,
            transform: 'translate(-50%, -50%)',
            width: 80,
            height: 80,
            pointerEvents: 'none',
            zIndex: 9999
          }}
        />
      )}
      {healVisible && (
        <div ref={healRef} style={{
          position: 'fixed',
          left: `${healPos.x}px`,
          top: `${healPos.y}px`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 9999,
          fontSize: 36
        }}>💖</div>
      )}
      {swapVisible && (
        <>
          <div ref={swapRef1} style={{
            position: 'fixed',
            left: `${swapPos.x1}px`,
            top: `${swapPos.y1}px`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9999,
            fontSize: 34
          }}>🔄</div>
          <div ref={swapRef2} style={{
            position: 'fixed',
            left: `${swapPos.x2}px`,
            top: `${swapPos.y2}px`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9999,
            fontSize: 34
          }}>🔄</div>
        </>
      )}
    </div>
  );
}