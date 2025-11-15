import { Link, useNavigate } from "react-router-dom";
import styles from "../SaladeJogos.module.css";
import { useEffect, useState, useCallback, useMemo } from "react";
import { criarSala, listarSalas, entrarSala } from "../api/salas";
import { subscribeLista } from "../api/ws";
import { carregarUsuarioPorHash, atualizarSkinAtiva, atualizarCenarioAtivo, atualizarPoderAtivo1, atualizarPoderAtivo2, atualizarPoderAtivo3 } from "../api/usuarios";
import { getUsuarioHash, setUsuarioHash, setUsuarioId } from "../api/http";
import { listarUsuarioProdutosPorUsuario } from "../api/usuarioProduto";
import { listarProdutos } from "../api/produtos";

function Salas() {
  const navigate = useNavigate();
  const [salas, setSalas] = useState([]);
  const [presencas, setPresencas] = useState({}); // { codigo: presentes }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState('skins'); // 'mapas' | 'poderes'
  const [usuarioId, setUsuarioIdState] = useState(null);
  const [usuarioSkinAtiva, setUsuarioSkinAtiva] = useState(null);
  const [skins, setSkins] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [usuarioCenarioAtivo, setUsuarioCenarioAtivo] = useState(null);
  const [mapas, setMapas] = useState([]);
  const [activeMapIndex, setActiveMapIndex] = useState(0);
  const [poderes, setPoderes] = useState([]);
  const [selectedPoderIds, setSelectedPoderIds] = useState([null, null, null]);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'create' | 'enter', codigo?: string }

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listarSalas();
      // Espera que a API retorne { success, data: [] }
      const lista = res?.data || res || [];
      setSalas(Array.isArray(lista) ? lista : []);

      // garante hash do usuário
      const hash = getUsuarioHash() || (window.location.hash?.replace('#', '') || null);
      if (hash) setUsuarioHash(hash);

      // carrega usuário e skins disponíveis
      if (hash) {
        try {
          const usuarioRes = await carregarUsuarioPorHash(hash);
          const usuario = usuarioRes?.usuario || usuarioRes?.data || usuarioRes;
          if (usuario?.id_usuario) {
            setUsuarioId(usuario.id_usuario);
            setUsuarioIdState(usuario.id_usuario);
            setUsuarioSkinAtiva(usuario.skin_ativa ?? null);
            setUsuarioCenarioAtivo(usuario.cenario_ativo ?? null);
            const [prodRes, usuProdRes] = await Promise.all([
              listarProdutos(),
              listarUsuarioProdutosPorUsuario(usuario.id_usuario),
            ]);
            const produtos = Array.isArray(prodRes) ? prodRes : (prodRes?.data || []);
            const map = new Map(produtos.map((p) => [p.id_produto, p]));
            const usuProds = Array.isArray(usuProdRes) ? usuProdRes : (usuProdRes?.data || []);
            const skinsDoUsuario = usuProds
              .map((up) => map.get(up.id_produto))
              .filter((p) => p && Number(p.id_tipo_produto) === 2);
            setSkins(skinsDoUsuario);
            if (usuario.skin_ativa != null) {
              const idx = skinsDoUsuario.findIndex((p) => p.id_produto === usuario.skin_ativa);
              setActiveIndex(idx >= 0 ? idx : 0);
            }
            const mapasDoUsuario = usuProds
              .map((up) => map.get(up.id_produto))
              .filter((p) => p && Number(p.id_tipo_produto) === 3);
            setMapas(mapasDoUsuario);
            if (usuario.cenario_ativo != null) {
              const midx = mapasDoUsuario.findIndex((p) => p.id_produto === usuario.cenario_ativo);
              setActiveMapIndex(midx >= 0 ? midx : 0);
            }
            const poderesDoUsuario = usuProds
              .map((up) => map.get(up.id_produto))
              .filter((p) => p && Number(p.id_tipo_produto) === 4);
            setPoderes(poderesDoUsuario);
            setSelectedPoderIds([
              usuario.poder_ativo1 ?? null,
              usuario.poder_ativo2 ?? null,
              usuario.poder_ativo3 ?? null,
            ]);
          }
        } catch (_) {
          // silencioso: se não carregar usuário, segue fluxo de salas
        }
      }
    } catch (e) {
      setError("Falha ao carregar salas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // carrega uma vez a lista atual
    carregar();
    // assina atualizações de presença e sala via socket
    const unsubscribe = subscribeLista(
      (p) => {
        if (p?.codigo) {
          setPresencas((prev) => {
            const next = { ...prev, [p.codigo]: p.presentes ?? 0 };
            setSalas((curr) => curr.map((s) => (s.codigo === p.codigo ? { ...s, presentes: next[p.codigo] } : s)));
            return next;
          });
        }
      },
      (u) => {
        if (u?.codigo) {
          setSalas((curr) => {
            const idx = curr.findIndex((s) => s.codigo === u.codigo);
            if (idx >= 0) {
              const next = [...curr];
              next[idx] = { ...next[idx], status: u.status, presentes: u.presentes ?? next[idx].presentes };
              return next;
            }
            // adiciona nova sala desconhecida à listagem
            return [
              { codigo: u.codigo, status: u.status, presentes: u.presentes ?? 0, capacidade: 2, SalaJogador: [] },
              ...curr,
            ];
          });
        }
      },
      // handler para remoção de sala
      (d) => {
        if (d?.codigo) {
          setSalas((curr) => curr.filter((s) => s.codigo !== d.codigo));
          setPresencas((prev) => {
            const { [d.codigo]: _, ...rest } = prev;
            return rest;
          });
        }
      }
    );
    return () => unsubscribe && unsubscribe();
  }, [carregar]);

  const handleCriarSala = async () => {
    setPendingAction({ type: 'create' });
    setShowModal(true);
    setModalTab('skins');
  };

  const handleEntrarSala = async (codigo) => {
    setPendingAction({ type: 'enter', codigo });
    setShowModal(true);
    setModalTab('skins');
  };

  const skinImageSrc = useMemo(() => {
    const current = skins[activeIndex];
    const base = current?.imagem || 'default';
    const ext = current?.extensao || 'png';
    return `/skins/${base}/${base}_mestre.${ext}`;
  }, [skins, activeIndex]);

  const changeSkinIndex = async (nextIndex) => {
    if (!skins.length) return;
    const bounded = (nextIndex + skins.length) % skins.length;
    setActiveIndex(bounded);
    const current = skins[bounded];
    setUsuarioSkinAtiva(current.id_produto);
    try {
      if (usuarioId) await atualizarSkinAtiva(usuarioId, current.id_produto);
    } catch (err) {
      console.error('Falha ao atualizar skin_ativa', err);
    }
  };

  const mapImageSrc = useMemo(() => {
    const current = mapas[activeMapIndex];
    const base = current?.imagem || 'default';
    const ext = current?.extensao || 'png';
    return `/cenarios/${base}/${base}_tabuleiro.${ext}`;
  }, [mapas, activeMapIndex]);

  const changeMapIndex = async (nextIndex) => {
    if (!mapas.length) return;
    const bounded = (nextIndex + mapas.length) % mapas.length;
    setActiveMapIndex(bounded);
    const current = mapas[bounded];
    setUsuarioCenarioAtivo(current.id_produto);
    try {
      if (usuarioId) await atualizarCenarioAtivo(usuarioId, current.id_produto);
    } catch (err) {
      console.error('Falha ao atualizar cenario_ativo', err);
    }
  };

  const handleJogar = async () => {
    try {
      if (pendingAction?.type === 'create') {
        const s = await criarSala();
        await carregar();
        const codigo = s?.codigo || s?.data?.codigo;
        if (codigo) {
          try { new Audio('/sound/fx/ui/positivo_6.wav').play().catch(() => {}); } catch (_) {}
          navigate(`/onitama?codigo=${encodeURIComponent(codigo)}`);
        }
      } else if (pendingAction?.type === 'enter' && pendingAction.codigo) {
        await entrarSala({ codigo: pendingAction.codigo });
        await carregar();
        try { new Audio('/sound/fx/ui/positivo_6.wav').play().catch(() => {}); } catch (_) {}
        navigate(`/onitama?codigo=${encodeURIComponent(pendingAction.codigo)}`);
      }
    } catch (e) {
      alert('Não foi possível iniciar a partida.');
    } finally {
      setShowModal(false);
      setPendingAction(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.titulo}>Salas de Jogo</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleCriarSala}>Criar</button>
          <button onClick={() => navigate('/menu')}>Menu</button>
        </div>
      </div>
      <p className={styles.subtitulo}>Escolha uma sala para jogar</p>

      <div className={styles.gridSalas}>
        {salas.length === 0 && !loading && (
          <div className={styles.cardSala}>
            <div className={styles.cardHeader}>
              <h3 className={styles.nomeSala}>Nenhuma sala disponível</h3>
              <span className={`${styles.dificuldade} ${styles.facil}`}>Fácil</span>
            </div>
            <div className={styles.cardContent}>
              <span className={styles.lotacao}>0/2 jogadores</span>
              <button className={styles.botaoEntrar} onClick={handleCriarSala}>Criar</button>
            </div>
          </div>
        )}

        {salas.map((sala, idx) => {
          const nome = sala?.nome || sala?.host?.apelido || `Sala ${sala?.codigo || idx + 1}`;
          const jogadores = presencas[sala?.codigo] ?? sala?.presentes ?? 0;
          const capacidade = sala?.capacidade ?? 2;
          const codigo = sala?.codigo;
          return (
            <div className={styles.cardSala} key={codigo || idx}>
              <div className={styles.cardHeader}>
                <h3 className={styles.nomeSala}>{nome}</h3>
                <span className={`${styles.dificuldade} ${styles.facil}`}>Fácil</span>
              </div>
              <div className={styles.cardContent}>
                <span className={styles.lotacao}>{jogadores}/{capacidade} jogadores</span>
                <button className={styles.botaoEntrar} onClick={() => handleEntrarSala(codigo)}>Entrar</button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ width: 720, maxWidth: '90vw', borderRadius: 12, background: 'rgba(20,20,20,0.85)', border: '1px solid #666', color: '#fff', padding: 24 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <button onClick={() => setModalTab('skins')} style={{ padding: '8px 12px', border: '1px solid #777', background: modalTab === 'skins' ? '#444' : '#222', color: '#fff' }}>Skins</button>
              <button onClick={() => setModalTab('mapas')} style={{ padding: '8px 12px', border: '1px solid #777', background: modalTab === 'mapas' ? '#444' : '#222', color: '#fff' }}>Cenários</button>
              <button onClick={() => setModalTab('poderes')} style={{ padding: '8px 12px', border: '1px solid #777', background: modalTab === 'poderes' ? '#444' : '#222', color: '#fff' }}>Poderes</button>
            </div>

            {modalTab === 'skins' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <button onClick={() => changeSkinIndex(activeIndex - 1)} style={{ padding: 8, border: '1px solid #777', background: '#222', color: '#fff' }}>{'<'}</button>
                <div style={{ width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: 12 }}>
                  <img src={skinImageSrc} alt="Skin ativa" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                </div>
                <button onClick={() => changeSkinIndex(activeIndex + 1)} style={{ padding: 8, border: '1px solid #777', background: '#222', color: '#fff' }}>{'>'}</button>
              </div>
            )}

            {modalTab === 'mapas' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <button onClick={() => changeMapIndex(activeMapIndex - 1)} style={{ padding: 8, border: '1px solid #777', background: '#222', color: '#fff' }}>{'<'}</button>
                <div style={{ width: 360, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: 12 }}>
                  {mapas.length ? (
                    <img src={mapImageSrc} alt="Cenário ativo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ color: '#bbb' }}>Nenhum cenário disponível</span>
                  )}
                </div>
                <button onClick={() => changeMapIndex(activeMapIndex + 1)} style={{ padding: 8, border: '1px solid #777', background: '#222', color: '#fff' }}>{'>'}</button>
              </div>
            )}

            {modalTab === 'poderes' && (
              <div style={{ padding: 16 }}>
                <div style={{ marginBottom: 12, color: '#fff', fontWeight: 'bold' }}>Selecione até 3 poderes ativos</div>
                {[0,1,2].map((slot) => {
                  const currentId = selectedPoderIds[slot];
                  const current = poderes.find((p) => p.id_produto === currentId) || null;
                  const label = current ? (current.nome || `Poder ${current.id_produto}`) : 'Nenhum';
                  return (
                    <div key={slot} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 28, textAlign: 'right', color: '#bbb' }}>Slot {slot+1}:</div>
                      <select
                        value={currentId ?? ''}
                        onChange={async (e) => {
                          const val = e.target.value ? Number(e.target.value) : null;
                          const nextIds = [...selectedPoderIds];
                          nextIds[slot] = val;
                          setSelectedPoderIds(nextIds);
                          try {
                            if (!usuarioId) return;
                            if (slot === 0) await atualizarPoderAtivo1(usuarioId, val);
                            else if (slot === 1) await atualizarPoderAtivo2(usuarioId, val);
                            else await atualizarPoderAtivo3(usuarioId, val);
                          } catch (err) {
                            console.error('Falha ao atualizar poder ativo', err);
                            alert('Não foi possível atualizar o poder ativo.');
                          }
                        }}
                        style={{ padding: '8px 10px', borderRadius: 8, background: '#222', color: '#fff', border: '1px solid #777', minWidth: 220 }}
                      >
                        <option value="">Nenhum</option>
                        {poderes.map((p) => (
                          <option key={p.id_produto} value={p.id_produto}>{p.nome || `Poder ${p.id_produto}`}</option>
                        ))}
                      </select>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {current ? ((current.id_produto === 5) ? '💣' : (current.id_produto === 11 ? '💖' : (current.id_produto === 12 ? '🔄' : '✨'))) : '—'}
                      </div>
                      <div style={{ color: '#bbb', fontSize: 12 }}>{label}</div>
                    </div>
                  );
                })}
                {poderes.length === 0 && (
                  <div style={{ color: '#bbb' }}>Você ainda não possui poderes. Visite a aba Itens para comprar.</div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button onClick={() => { setShowModal(false); setPendingAction(null); }} style={{ padding: '10px 16px', border: '1px solid #777', background: '#222', color: '#fff' }}>Cancelar</button>
              <button onClick={handleJogar} style={{ padding: '10px 16px', border: '1px solid #0a8', background: '#0a8', color: '#fff' }}>Jogar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Salas;
