import React from 'react';

const SIZE = 5;
const CENTER = { y: 2, x: 2 };

function gridStyle() {
  return {
    display: 'grid', gridTemplateColumns: `repeat(${SIZE}, 14px)`, gap: '3px',
    marginTop: '8px', justifyContent: 'center'
  };
}

function cellStyle(active, isCenter) {
  return {
    width: '14px', height: '14px', borderRadius: '3px',
    background: active ? '#3c763d' : '#333',
    border: isCenter ? '1px solid #777' : '1px solid #222',
  };
}

function transformMovesForOwner(card, owner) {
  if (!card?.moves) return [];
  if (owner === 'A') return card.moves;
  return card.moves.map(([dy, dx]) => [-dy, dx]);
}

function orientForView(moves, orientation) {
  if (orientation === 'north') return moves.map(([dy, dx]) => [-dy, -dx]);
  return moves;
}

function MovesGrid({ card, orientation, owner }) {
  const base = transformMovesForOwner(card, owner);
  const display = orientForView(base, orientation);
  const set = new Set(display.map(([dy, dx]) => `${CENTER.y + dy}-${CENTER.x + dx}`));
  return (
    <div style={gridStyle()}>
      {Array.from({ length: SIZE }).map((_, y) => (
        Array.from({ length: SIZE }).map((_, x) => {
          const key = `${y}-${x}`;
          const active = set.has(key);
          const isCenter = y === CENTER.y && x === CENTER.x;
          return <div key={key} style={cellStyle(active, isCenter)} />;
        })
      ))}
    </div>
  );
}

export function CardPanel({ myCards, centerCard, selectedCardIndex, onSelectCard, orientation = 'south', owner = 'A' }) {
  const renderCard = (card, idx, clickable = true) => (
    <div key={card?.name || idx} style={{
      background: '#222', color: '#fff', borderRadius: '8px', padding: '8px',
      border: selectedCardIndex === idx ? '2px solid #4a90e2' : '1px solid #555',
      cursor: clickable ? 'pointer' : 'default', minWidth: '150px'
    }} onClick={() => clickable && onSelectCard(idx)}>
      <div style={{ fontWeight: 'bold' }}>{card?.name}</div>
      <div style={{ fontSize: '12px', color: '#bbb' }}>cor: {card?.color}</div>
      <MovesGrid card={card} orientation={orientation} owner={owner} />
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch', justifyContent: 'center', width: '100%' }}>
      {renderCard(myCards?.[0], 0)}
      {renderCard(myCards?.[1], 1)}
      <div style={{ display: 'flex', alignItems: 'center', color: '#fff' }}>→</div>
      {renderCard(centerCard, 'center', false)}
    </div>
  );
}