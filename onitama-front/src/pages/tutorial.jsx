import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function Tutorial() {
  const navigate = useNavigate();
  const { step } = useParams();
  const idx = Number(step) || 1;
  const imgRef = useRef(null);
  const [box, setBox] = useState(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const imgSrc = useMemo(() => {
    if (idx === 1) return '/assets/tutorial1.png';
    if (idx === 2) return '/assets/tutorial2.png';
    return '/assets/tutorial3.png';
  }, [idx]);

  useEffect(() => {
    function measure() {
      const vw = window.innerWidth || document.documentElement.clientWidth;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const el = imgRef.current;
      const iw = imgSize.w || (el ? el.naturalWidth : 0);
      const ih = imgSize.h || (el ? el.naturalHeight : 0);
      if (!vw || !vh || !iw || !ih) return;
      const ar = iw / ih;
      const varr = vw / vh;
      let width, height, left, top;
      if (varr > ar) {
        height = vh;
        width = vh * ar;
        left = (vw - width) / 2;
        top = 0;
      } else {
        width = vw;
        height = vw / ar;
        left = 0;
        top = (vh - height) / 2;
      }
      setBox({ left, top, right: left + width, bottom: top + height, width, height });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [imgSrc, imgSize.w, imgSize.h]);

  function handleLoad() {
    const el = imgRef.current;
    if (!el) return;
    const w = el.naturalWidth || 0;
    const h = el.naturalHeight || 0;
    if (w && h) setImgSize({ w, h });
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      <img ref={imgRef} src={imgSrc} alt="Tutorial" onLoad={handleLoad} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
      {idx === 1 && (
        <button
          onClick={() => navigate('/menu')}
          aria-label="Voltar"
          style={{ position: 'fixed', top: (box ? (box.top + 16) : 16), left: (box ? (box.left + 16) : 16), zIndex: 3001, background: 'none', border: 'none', padding: 0, cursor: 'pointer', outline: 'none', boxShadow: 'none', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', backgroundColor: 'transparent' }}
        >
          <img src={'/icons/seta.png'} alt="Voltar" style={{ width: 80, height: 80, border: 'none', display: 'block' }} />
        </button>
      )}

      {idx !== 1 && (
        <button
          onClick={() => navigate(`/tutorial/${idx - 1}`)}
          aria-label="Anterior"
          style={{ position: 'fixed', left: (box ? (box.left + 16) : 16), top: (box ? (box.top + (box.height / 2) - 40) : '50%'), zIndex: 3001, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <img src={'/icons/seta.png'} alt="Anterior" style={{ width: 80, height: 80, border: 'none', display: 'block' }} />
        </button>
      )}

      {idx !== 3 && (
        <button
          onClick={() => navigate(`/tutorial/${idx + 1}`)}
          aria-label="Próximo"
          style={{ position: 'fixed', left: (box ? (box.right - 16 - 80) : undefined), right: (box ? undefined : 16), top: (box ? (box.top + (box.height / 2) - 40) : '50%'), zIndex: 3001, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <img src={'/icons/seta.png'} alt="Próximo" style={{ width: 80, height: 80, border: 'none', display: 'block', transform: 'rotate(180deg)' }} />
        </button>
      )}
    </div>
  );
}

export default Tutorial;