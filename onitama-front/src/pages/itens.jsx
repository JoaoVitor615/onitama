import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../App.module.css';
import { listarProdutos } from '../api/produtos';
import { getUsuarioId, getUsuarioHash, setUsuarioId } from '../api/http';
import { carregarUsuarioPorHash, atualizarMoedas } from '../api/usuarios';
import { gravarUsuarioProduto, listarUsuarioProdutosPorUsuario } from '../api/usuarioProduto';
import PurchaseNotification from '../components/ui/PurchaseNotification';
import { notifyPurchase } from '../utils/notifyPurchase';
import './skins.css';

const TIPO = {
  SKIN: 2,
  MAPA: 3,
  PODER: 4,
};

function Itens() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [aba, setAba] = useState(TIPO.SKIN);
  const [compradosIds, setCompradosIds] = useState(new Set());
  const [quantidadesPorProduto, setQuantidadesPorProduto] = useState(new Map());
  const [loadingId, setLoadingId] = useState(null);
  const [moedas, setMoedas] = useState(0);

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

  // Carrega quantidade de moedas do usuário para exibir no topo, estilo .moedas-header
  useEffect(() => {
    const hash = getUsuarioHash();
    if (!hash) return;
    carregarUsuarioPorHash(hash)
      .then((usuario) => {
        const valor = typeof usuario?.moedas === 'number' ? usuario.moedas : Number(usuario?.moedas || 0);
        setMoedas(valor);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function carregarComprados() {
      const usuarioId = getUsuarioId();
      if (!usuarioId) return;
      try {
        const list = await listarUsuarioProdutosPorUsuario(usuarioId);
        const ids = new Set((list || []).map((up) => up.id_produto));
        const qtdMap = new Map();
        (list || []).forEach((up) => {
          if (up?.id_produto != null) {
            qtdMap.set(up.id_produto, up?.quantidade ?? null);
          }
        });
        setCompradosIds(ids);
        setQuantidadesPorProduto(qtdMap);
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
      // Poderes: imagens em public/assets/<imagem>.<extensao>
      return `/assets/${prod.imagem}.${ext}`;
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
    const tipo = Number(produto?.id_tipo_produto);
    if (tipo !== TIPO.PODER && compradosIds.has(produto.id_produto)) {
      notifyPurchase({ type: 'already_owned', name: produto.nome });
      return;
    }
    // Verifica saldo de moedas suficiente
    const preco = Number(produto?.preco || 0);
    const saldoAtual = Number(moedas || 0);
    if (preco > 0 && saldoAtual < preco) {
      notifyPurchase({ type: 'insufficient_coins' });
      return;
    }
    setLoadingId(produto.id_produto);
    let descontou = false;
    try {
      // Desconta moedas antes de gravar o item
      if (preco > 0) {
        const novoTotal = (saldoAtual - preco);
        await atualizarMoedas(usuarioId, novoTotal);
        setMoedas(novoTotal);
        descontou = true;
      }
      await gravarUsuarioProduto(usuarioId, produto.id_produto);
      const novo = new Set(compradosIds);
      novo.add(produto.id_produto);
      setCompradosIds(novo);
      // Atualiza quantidade local para poderes
      if (tipo === TIPO.PODER) {
        const atual = quantidadesPorProduto.get(produto.id_produto) ?? 0;
        const novoQtd = (Number(atual) || 0) + 1;
        const novoMap = new Map(quantidadesPorProduto);
        novoMap.set(produto.id_produto, novoQtd);
        setQuantidadesPorProduto(novoMap);
        notifyPurchase({ type: 'power', name: produto.nome, amount: 1 });
      } else if (tipo === TIPO.SKIN) {
        notifyPurchase({ type: 'skin', name: produto.nome });
      } else if (tipo === TIPO.MAPA) {
        notifyPurchase({ type: 'scenario', name: produto.nome });
      } else {
        notifyPurchase({ type: 'generic', name: produto?.nome || 'Item' });
      }
    } catch (err) {
      // Se falhou em gravar o item após descontar, reverte moedas
      if (descontou) {
        try {
          await atualizarMoedas(usuarioId, saldoAtual);
          setMoedas(saldoAtual);
        } catch (_) {}
      }
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
    <div className="loja-fundo">
      <PurchaseNotification />

      {/* Botão de voltar no topo esquerdo */}
      <button
        onClick={() => navigate('/menu')}
        aria-label="Voltar"
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 3001,
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          outline: 'none', boxShadow: 'none', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
          backgroundColor: 'transparent'
        }}
      >
        <img src={'/icons/seta.png'} alt="Voltar" style={{ width: 80, height: 80, border: 'none', display: 'block' }} />
      </button>

      {/* Moedas do usuário no topo direito, mesmo estilo da /loja */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
        <div className="moedas-header">
          <img className="icone-moeda" src="/icons/coin.png" alt="Moedas" />
          <span style={{ fontWeight: 800 }}>{moedas}</span>
        </div>
      </div>

      {/* Abas */}
      <div className="abas-container">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setAba(t.id)}
            className={`aba ${Number(aba) === Number(t.id) ? 'ativa' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Painel + Grid */}
      <div className="painel-loja">
        {filtrados.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center' }}>Nenhum item encontrado nesta aba.</div>
        ) : (
          <div className="grid-skins">
            {filtrados.map(prod => (
              <div
                key={prod.id_produto}
                className={`card-skin ${Number(prod.id_tipo_produto) === TIPO.PODER ? 'card-power' : ''}`}
                title={Number(prod.id_tipo_produto) === TIPO.PODER ? (Number(prod.id_produto) === 5 ? 'Bomba: elimina instantaneamente um peão adversário (Não tem efeito no mestre)' : (Number(prod.id_produto) === 11 ? 'Heal: Revive o último peão eliminado para sua posição de origem ou mais próxima disponível (Não tem efeito no mestre)' : (Number(prod.id_produto) === 12 ? 'Troca: Possibilita trocar o posicionamento do mestre com algum dos peões' : undefined))) : undefined}
              >
                <div style={{ fontWeight: 800 }}>{prod.nome}</div>
                {prod.imagem ? (
                  <img src={getProdutoImagemSrc(prod)} alt={prod.nome} className="imagem-skin" title={Number(prod.id_tipo_produto) === TIPO.PODER ? (Number(prod.id_produto) === 5 ? 'Bomba: elimina instantaneamente um peão adversário (Não tem efeito no mestre)' : (Number(prod.id_produto) === 11 ? 'Heal: Revive o último peão eliminado para sua posição de origem ou mais próxima disponível (Não tem efeito no mestre)' : (Number(prod.id_produto) === 12 ? 'Troca: Possibilita trocar o posicionamento do mestre com algum dos peões' : undefined))) : undefined} />
                ) : (
                  <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
                    <span>Sem imagem</span>
                  </div>
                )}

                <div className="preco-container">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <img src="/icons/coin.png" alt="Preço" style={{ width: 20, height: 20 }} />
                    <b>{prod.preco ?? 0}</b>
                  </span>
                  {(() => {
                    const owned = Number(prod.id_tipo_produto) !== TIPO.PODER && compradosIds.has(prod.id_produto);
                    return (
                      <button
                        onClick={() => comprar(prod)}
                        disabled={loadingId === prod.id_produto || owned}
                        className={`botao-comprar ${owned ? 'purchased' : ''}`}
                      >
                        {loadingId === prod.id_produto
                          ? '...'
                          : (Number(prod.id_tipo_produto) === TIPO.PODER
                              ? 'COMPRAR +1'
                              : (owned ? 'COMPRADO' : 'COMPRAR'))}
                      </button>
                    );
                  })()}
                </div>

                {Number(prod.id_tipo_produto) === TIPO.PODER ? (
                  <div style={{ marginTop: 12, fontSize: 16, opacity: 0.95 }}>
                    Você possui: <b>{quantidadesPorProduto.get(prod.id_produto) ?? 0}</b>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Itens;