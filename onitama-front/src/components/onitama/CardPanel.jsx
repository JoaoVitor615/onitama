import React from 'react';

export function CardPanel({ myCards, centerCard, selectedCardIndex, onSelectCard }) {
  const renderCard = (card, idx, clickable = true) => (
    <div key={card?.name || idx} style={{
      background: '#222', color: '#fff', borderRadius: '8px', padding: '8px',
      border: selectedCardIndex === idx ? '2px solid #4a90e2' : '1px solid #555',
      cursor: clickable ? 'pointer' : 'default', minWidth: '150px'
    }} onClick={() => clickable && onSelectCard(idx)}>
      <div style={{ fontWeight: 'bold' }}>{card?.name}</div>
      <div style={{ fontSize: '12px', color: '#bbb' }}>cor: {card?.color}</div>
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