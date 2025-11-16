import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../App.module.css";
import { carregarUsuarioPorHash, atualizarMoedas } from "../api/usuarios";
import PurchaseNotification from "../components/ui/PurchaseNotification";
import { notifyPurchase } from "../utils/notifyPurchase";
import "./skins.css";

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
      notifyPurchase({ type: 'coins', amount: produto.quantidade });
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
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 900
  });

  return (
    <div className="loja-fundo">
      <PurchaseNotification />

      {/* Botão de voltar no topo esquerdo (seta invertida), idêntico ao /itens */}
      <button
        onClick={() => navigate(-1)}
        aria-label="Voltar"
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 3001,
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          outline: 'none', boxShadow: 'none', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
          backgroundColor: 'transparent'
        }}
      >
        <img
          src={'/assets/arrow-right.png'}
          alt="Voltar"
          style={{ width: 40, height: 40, transform: 'scaleX(-1)', border: 'none', display: 'block' }}
        />
      </button>

      <div className="header-prin">
        <h1 className="titulo-loja">LOJA COINS</h1>
        <div className="moedas-header">
          <img className="icone-moeda" src="/icons/coin.png" alt="Moedas" style={{ width: 24, height: 24 }} />
          <span style={{ fontWeight: 800 }}>{moedas}</span>
        </div>
      </div>

      <div className="painel-loja">
        <div className="grid-skins">
          {produtos.map((p) => (
            <div key={p.id} className="card-skin">
              <img src={p.imagem} alt={`Produto ${p.id}`} className="imagem-skin" />
              <div className="preco-container">
                <div>{p.preco}</div>
                <div>{p.quantidade} MOEDAS</div>
                <button className="botao-comprar" disabled={loadingId === p.id} onClick={() => comprar(p)}>
                  {loadingId === p.id ? 'PROCESSANDO...' : 'COMPRAR'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Loja;