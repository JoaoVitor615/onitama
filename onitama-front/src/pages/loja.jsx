import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../App.module.css";
import { carregarUsuarioPorHash, atualizarMoedas } from "../api/usuarios";

const produtos = [
  { id: 1, imagem: "/icons/coin.png", preco: "4,99", quantidade: 150 },
  { id: 2, imagem: "/icons/coin2.png", preco: "14,99", quantidade: 500 },
  { id: 3, imagem: "/icons/coin3.png", preco: "25,99", quantidade: 1000 },
  { id: 4, imagem: "/icons/coin4.png", preco: "49,99", quantidade: 2000 },
];

function Loja() {
  const navigate = useNavigate();
  const [moedas, setMoedas] = useState(0);
  const [loadingId, setLoadingId] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    const hash = localStorage.getItem('usuario_hash');
    const id = localStorage.getItem('usuario_id');
    if (id) setUsuarioId(Number(id));
    if (!hash) return;
    carregarUsuarioPorHash(hash)
      .then((usuario) => {
        const valor = typeof usuario?.moedas === 'number' ? usuario.moedas : Number(usuario?.moedas || 0);
        setMoedas(valor);
      })
      .catch(() => {});
  }, []);

  async function comprar(produto) {
    if (!usuarioId) return alert('Usuário não identificado');
    setLoadingId(produto.id);
    try {
      const novoTotal = (Number(moedas) || 0) + produto.quantidade;
      await atualizarMoedas(usuarioId, novoTotal);
      setMoedas(novoTotal);
      alert(`Compra concluída! +${produto.quantidade} moedas adicionadas.`);
    } catch (err) {
      alert(err?.message || 'Falha ao processar compra');
    } finally {
      setLoadingId(null);
    }
  }

  const headerStyle = {
    fontSize: "54px",
    fontWeight: 900,
    color: '#fff',
    textShadow: '2px 2px 4px rgba(0,0,0,0.6)'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '22px',
    width: '100%',
    maxWidth: '1200px'
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(6px)',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.25)',
    padding: '16px',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  };

  const priceStyle = { fontSize: '28px', fontWeight: 900 };
  const amountStyle = { fontSize: '16px', color: '#ffd54f', fontWeight: 800 };

  const buyBtn = (disabled) => ({
    background: disabled ? '#6c757d' : '#c19a6b',
    color: '#000',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 900
  });

  return (
    <div className={styles.container}>
      <img src="/background-img.png" className={styles.bgImg} alt="Background" />
      {/* Top bar */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.4)', color: '#fff', padding: '8px 10px', borderRadius: 10 }}>
        <img src="/icons/coin.png" alt="Moedas" style={{ width: 28, height: 28 }} />
        <span style={{ fontWeight: 800, fontSize: 18 }}>{moedas}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, zIndex: 999 }}>
        <h1 style={headerStyle}>LOJA COINS</h1>
        <div style={gridStyle}>
          {produtos.map((p) => (
            <div key={p.id} style={cardStyle}>
              <img src={p.imagem} alt={`Produto ${p.id}`} style={{ width: '60%', maxWidth: 190, objectFit: 'contain' }} />
              <div style={priceStyle}>{p.preco}</div>
              <div style={amountStyle}>{p.quantidade} MOEDAS</div>
              <button style={buyBtn(loadingId === p.id)} disabled={loadingId === p.id} onClick={() => comprar(p)}>
                {loadingId === p.id ? 'PROCESSANDO...' : 'COMPRAR'}
              </button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={() => navigate('/menu')} style={{ background: '#8b0000', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 900 }}>Voltar ao Menu</button>
        </div>
      </div>
    </div>
  );
}

export default Loja;