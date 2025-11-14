import React, { useEffect, useRef, useState } from 'react';

export default function PurchaseNotification() {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState(null);
  const boxRef = useRef(null);

  useEffect(() => {
    const handler = (ev) => {
      const detail = ev.detail || {};
      setData(detail);
      setVisible(true);
      // Duração variável conforme tipo
      try {
        const rawType = detail?.type;
        const normalized = rawType === 'coins' ? 'moedas'
          : rawType === 'power' ? 'poder'
          : rawType === 'scenario' ? 'cenario'
          : rawType;
        const waitMs = (normalized === 'login_invalido' || normalized === 'login_error') ? 4000 : 2000;
        setTimeout(() => setVisible(false), waitMs);
      } catch (_) {
        setTimeout(() => setVisible(false), 2000);
      }
    };
    window.addEventListener('purchase', handler);
    return () => window.removeEventListener('purchase', handler);
  }, []);

  useEffect(() => {
    if (!visible || !boxRef.current) return;
    try {
      const el = boxRef.current;
      el.animate([
        { opacity: 0, transform: 'translate(-50%, -55%) scale(0.96)' },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }
      ], { duration: 220, easing: 'ease-out', fill: 'forwards' });
    } catch (_) {}

    // Efeito sonoro para eventos específicos (ex.: login inválido)
    try {
      const rawType = data?.type;
      const normalized = rawType === 'coins' ? 'moedas'
        : rawType === 'power' ? 'poder'
        : rawType === 'scenario' ? 'cenario'
        : rawType;
      if (normalized === 'login_invalido' || normalized === 'login_error') {
        const audio = new Audio('/sound/fx/ui/negativo_2.wav');
        audio.volume = 0.75;
        audio.play().catch(() => {});
      }
    } catch (_) {}
  }, [visible, data]);

  if (!visible) return null;

  // Normaliza tipos vindos de chamadas antigas (ingles → pt-br)
  const normalizedType = (() => {
    const t = data?.type;
    if (t === 'coins') return 'moedas';
    if (t === 'power') return 'poder';
    if (t === 'scenario') return 'cenario';
    return t;
  })();

  const title = (() => {
    switch (normalizedType) {
      case 'skin': return 'Skin adquirida!';
      case 'cenario':
      case 'scenario': return 'Cenário desbloqueado!';
      case 'poder':
      case 'power': return 'Poder conquistado!';
      case 'moedas':
      case 'coins': return 'Moedas adicionadas!';
      case 'error':
      case 'login_error': return 'Falha no login';
      case 'already_owned': return 'Item já adquirido';
      default: return 'Compra realizada!';
    }
  })();

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 6000, pointerEvents: 'none' }}>
      <div ref={boxRef} style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        background: visuals.bg,
        color: '#fff', border: '2px solid rgba(255,255,255,0.8)',
        textShadow: '0 0 8px rgba(0,0,0,0.35)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        borderRadius: 14, padding: '14px 18px', minWidth: 260,
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <div style={{ fontSize: 28 }}>{visuals.icon}</div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>
          {desc ? (<div style={{ fontSize: 13, opacity: 0.95 }}>{desc}</div>) : null}
        </div>
      </div>
    </div>
  );
}