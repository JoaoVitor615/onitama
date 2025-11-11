import React from 'react';
import { BOARD_SIZE } from '../../game/onitama/logic';

/**
 * orientation: 'south' (padrão, sem rotação) ou 'north' (rotaciona 180°)
 */
export function Board({ board, currentPlayer, selected, validMoves, onSelect, onMove, orientation = 'south' }) {
  const toCanonical = (y, x) => {
    if (orientation === 'north') return { y: BOARD_SIZE - 1 - y, x: BOARD_SIZE - 1 - x };
    return { y, x };
  };

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
          return (
            <div key={`${y}-${x}`} style={{
              aspectRatio: '1',
              background: bg,
              border,
              borderRadius: '6px',
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
              )}
            </div>
          );
        })
      ))}
    </div>
  );
}