import { useEffect, useMemo, useState } from 'react';
import styles from '../App.module.css';
import { listarProdutos } from '../api/produtos';
import { getUsuarioId, getUsuarioHash, setUsuarioId } from '../api/http';
import { carregarUsuarioPorHash } from '../api/usuarios';
import { gravarUsuarioProduto, listarUsuarioProdutosPorUsuario } from '../api/usuarioProduto';

const TIPO = {
  SKIN: 2,
  MAPA: 3,
  PODER: 4,
};

function Itens() {
  const [produtos, setProdutos] = useState([]);
  const [aba, setAba] = useState(TIPO.SKIN);
  const [compradosIds, setCompradosIds] = useState(new Set());
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const all = await listarProdutos();
        setProdutos(Array.isArray(all) ? all : []);
      } catch (e) {
        console.error(e);
      }
    }
    carregar();
    // Garantir id do usuário baseado no hash, caso não esteja salvo
    (async () => {
      const id = getUsuarioId();
      const hash = getUsuarioHash();
      if (!id && hash) {
        try {
          const u = await carregarUsuarioPorHash(hash);
          if (u?.id_usuario) setUsuarioId(u.id_usuario);
        } catch (_) {}
      }
    })();
  }, []);

  useEffect(() => {
    async function carregarComprados() {
      const usuarioId = getUsuarioId();
      if (!usuarioId) return;
      try {
        const list = await listarUsuarioProdutosPorUsuario(usuarioId);
        const ids = new Set((list || []).map((up) => up.id_produto));
        setCompradosIds(ids);
      } catch (_) {}
    }
    carregarComprados();
  }, []);

  const filtrados = useMemo(() => {
    // Exibe todos os produtos da aba, independente de 'compravel' (alguns bancos podem ter null)
    return produtos.filter((p) => Number(p?.id_tipo_produto) === Number(aba));
  }, [produtos, aba]);

  function getProdutoImagemSrc(prod) {
    if (!prod?.imagem) return null;
    const ext = prod?.extensao || 'png';
    const tipo = Number(prod?.id_tipo_produto);
    if (tipo === TIPO.SKIN) {
      return `/skins/${prod.imagem}/${prod.imagem}_mestre.${ext}`;
    }
    if (tipo === TIPO.PODER) {
      return `/skins/${prod.imagem}/${prod.imagem}_poder.${ext}`;
    }
    if (tipo === TIPO.MAPA) {
      return `/cenarios/${prod.imagem}/${prod.imagem}_tabuleiro.${ext}`;
    }
    // fallback geral: ícone genérico com possível extensão
    if (String(prod.imagem).startsWith('/')) return prod.imagem;
    return `/icons/${prod.imagem}.${ext}`;
  }

  async function comprar(produto) {
    const usuarioId = getUsuarioId();
    if (!usuarioId) return alert('Usuário não identificado');
    if (!produto?.id_produto) return;
    if (compradosIds.has(produto.id_produto)) {
      return alert('Você já possui este item.');
    }
    setLoadingId(produto.id_produto);
    try {
      await gravarUsuarioProduto(usuarioId, produto.id_produto);
      const novo = new Set(compradosIds);
      novo.add(produto.id_produto);
      setCompradosIds(novo);
      alert('Item comprado com sucesso!');
    } catch (err) {
      alert(err?.message || 'Falha ao processar compra');
    } finally {
      setLoadingId(null);
    }
  }

  const tabs = [
    { id: TIPO.SKIN, label: 'SKINS' },
    { id: TIPO.MAPA, label: 'MAPAS' },
    { id: TIPO.PODER, label: 'PODERES' },
  ];

  return (
    <div className={styles.container}>
      <img src="/background-img.png" className={styles.bgImg} alt="Background" />

      <div style={{
        position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
        width: '90%', maxWidth: 1000, minHeight: 540,
        background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.35)', borderRadius: 12,
        padding: 16, color: '#fff', zIndex: 1000
      }}>
        {/* Abas */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setAba(t.id)}
              style={{
                padding: '10px 14px', borderRadius: 10,
                border: Number(aba) === Number(t.id) ? '3px solid #fff' : '2px solid rgba(255,255,255,0.4)',
                background: Number(aba) === Number(t.id) ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)',
                color: '#fff', fontWeight: 800, cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Grid de produtos */}
        {filtrados.length === 0 ? (
          <div style={{
            padding: 20, textAlign: 'center', color: '#fff', opacity: 0.85
          }}>
            Nenhum item encontrado nesta aba.
          </div>
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {filtrados.map(prod => (
            <div key={prod.id_produto} style={{
              background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 12,
              padding: 12, display: 'flex', flexDirection: 'column', gap: 10
            }}>
              <div style={{ fontWeight: 800 }}>{prod.nome}</div>
              {prod.imagem ? (
                <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={getProdutoImagemSrc(prod)}
                    alt={prod.nome}
                    style={{
                      width: 'auto',
                      height: 'auto',
                      maxWidth: '100%',
                      maxHeight: 110,
                      objectFit: 'contain'
                    }}
                  />
                </div>
              ) : (
                <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
                  <span>Sem imagem</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img src="/icons/coin.png" alt="Preço" style={{ width: 20, height: 20 }} />
                  <b>{prod.preco ?? 0}</b>
                </span>
                <button
                  onClick={() => comprar(prod)}
                  disabled={loadingId === prod.id_produto || compradosIds.has(prod.id_produto)}
                  style={{
                    padding: '8px 12px', borderRadius: 8, border: 'none',
                    background: compradosIds.has(prod.id_produto) ? '#777' : '#5dbb63', color: '#fff', fontWeight: 800,
                    cursor: compradosIds.has(prod.id_produto) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {compradosIds.has(prod.id_produto) ? 'COMPRADO' : (loadingId === prod.id_produto ? '...' : 'COMPRAR')}
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}

export default Itens;