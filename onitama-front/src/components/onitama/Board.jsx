import React, { useEffect, useRef, useState } from 'react';
import { BOARD_SIZE } from '../../game/onitama/logic';

/**
 * orientation: 'south' (padrão, sem rotação) ou 'north' (rotaciona 180°)
 */
export function Board({ board, currentPlayer, selected, validMoves, onSelect, onMove, orientation = 'south', skins = {}, bombTarget = null, onBombDone = null }) {
  const bombRef = useRef(null);
  const [bombVisible, setBombVisible] = useState(false);
  const toCanonical = (y, x) => {
    if (orientation === 'north') return { y: BOARD_SIZE - 1 - y, x: BOARD_SIZE - 1 - x };
    return { y, x };
  };

  useEffect(() => {
    if (!bombTarget) { setBombVisible(false); return; }
    setBombVisible(true);
    // animação da bomba com animejs via import dinâmico (fallback para WAAPI)
    const el = bombRef.current;
    (async () => {
      try {
        const anime = await import('https://esm.sh/animejs@3.2.1');
        if (el) {
          anime.default({
            targets: el,
            translateY: [-80, 0],
            rotate: [0, 360],
            scale: [0.8, 1],
            easing: 'easeOutBounce',
            duration: 800,
            complete: () => {
              setBombVisible(false);
              onBombDone && onBombDone();
            },
          });
        }
      } catch (_) {
        if (el) {
          el.animate([
            { transform: 'translateY(-80px) rotate(0deg) scale(0.8)' },
            { transform: 'translateY(0px) rotate(360deg) scale(1.0)' }
          ], { duration: 800, easing: 'ease-out' }).onfinish = () => {
            setBombVisible(false);
            onBombDone && onBombDone();
          };
        }
      }
    })();
  }, [bombTarget, onBombDone]);

  const isTempleCanonical = (y, x) => (y === 0 && x === 2) || (y === BOARD_SIZE - 1 && x === 2);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, gap: '4px', width: 'min(600px, 90vw)' }}>
      {Array.from({ length: BOARD_SIZE }).map((_, y) => (
        Array.from({ length: BOARD_SIZE }).map((_, x) => {
          const { y: cy, x: cx } = toCanonical(y, x);
          const piece = board[cy][cx];
          const isSelected = selected && selected.y === cy && selected.x === cx;
          const canMove = validMoves?.find((m) => m.y === cy && m.x === cx);
          const bgBase = (y + x) % 2 === 0 ? '#d2b48c' : '#a67c52';
          const bg = isSelected ? '#4a90e2' : canMove ? '#3c763d' : bgBase;
          const temple = isTempleCanonical(cy, cx);
          const border = temple ? '3px solid #e0e' : '2px solid rgba(255,255,255,0.2)';
          const ownerSkin = skins?.[piece?.owner];
          const imgBase = ownerSkin?.base;
          const imgFolder = ownerSkin?.folder;
          const imgName = piece ? `${imgBase}_${piece.type === 'master' ? 'mestre' : 'peao'}.png` : null;
          const imgSrc = (imgFolder && imgName) ? `/skins/${imgFolder}/${imgName}` : null;
          const isBombHere = bombTarget && bombVisible && bombTarget.y === cy && bombTarget.x === cx;
          return (
            <div key={`${y}-${x}`} style={{
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
              {isBombHere && (
                <div ref={bombRef} style={{
                  position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
                  fontSize: '28px'
                }}>💣</div>
              )}
            </div>
          );
        })
      ))}
    </div>
  );
}