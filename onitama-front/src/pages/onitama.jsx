import { useEffect, useMemo, useState } from "react";
import { carregarSalaPorCodigo, sairSala } from "../api/salas";
import { joinSala } from "../api/ws";
import { getUsuarioId } from "../api/http";
import { useSearchParams, useNavigate } from "react-router-dom";
import GameOnitama from "../components/onitama/GameOnitama";

function Onitama() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codigoParam = searchParams.get("codigo");
  const [playerData, setPlayerData] = useState(null);
  const [sala, setSala] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const usuarioId = useMemo(() => getUsuarioId(), []);
  const wsUrl = useMemo(() => (import.meta.env.VITE_WS_URL || "ws://127.0.0.1:8081"), []);

  // Carrega uma vez os dados da sala (sem polling) para estado inicial
  useEffect(() => {
    const run = async () => {
      if (!codigoParam) return;
      try {
        setLoading(true);
        setError(null);
        const s = await carregarSalaPorCodigo(codigoParam);
        setSala(s);
        const role = (usuarioId && s?.id_host === usuarioId) ? 'host' : 'client';
        // Inicializa playerData mesmo aguardando outro jogador, o jogo ficará bloqueado
        setPlayerData({ wsUrl, roomCode: s?.codigo || codigoParam, name: `Jogador ${usuarioId ?? ''}`.trim(), role });
      } catch (e) {
        setError("Falha ao carregar sala");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [codigoParam, usuarioId, wsUrl]);

  // Removido: efeito de desmontagem que chamava sairSala.
  // Em ambiente de desenvolvimento com React StrictMode, efeitos montam e desmontam imediatamente,
  // o que disparava "sair" indevidamente logo após entrar na sala.

  // Assina presença da sala para refletir contagem em tempo real
  useEffect(() => {
    if (!codigoParam) return;
    const off = joinSala(
      codigoParam,
      // presence updates
      (p) => {
        // atualiza apenas contagem e refaz carregamento para obter apelidos
        setSala((curr) => ({ ...(curr || {}), presentes: p.presentes, status: curr?.status }));
        carregarSalaPorCodigo(codigoParam).then((s) => {
          setSala(s);
          if (!playerData) {
            const role = (usuarioId && s?.id_host === usuarioId) ? 'host' : 'client';
            setPlayerData({ wsUrl, roomCode: codigoParam, name: `Jogador ${usuarioId ?? ''}`.trim(), role });
          }
        }).catch(() => {});
      },
      // room_update updates
      (u) => {
        setSala((curr) => ({ ...(curr || {}), status: u.status, presentes: u.presentes }));
        carregarSalaPorCodigo(codigoParam).then((s) => {
          setSala(s);
          if (!playerData) {
            const role = (usuarioId && s?.id_host === usuarioId) ? 'host' : 'client';
            setPlayerData({ wsUrl, roomCode: codigoParam, name: `Jogador ${usuarioId ?? ''}`.trim(), role });
          }
        }).catch(() => {});
      },
      // room_deleted updates
      () => {
        navigate('/salas');
      }
    );
    return () => off && off();
  }, [codigoParam, usuarioId, wsUrl, playerData, navigate]);

  const handleSair = async () => {
    if (!codigoParam || leaving) return;
    try {
      setLeaving(true);
      await sairSala({ codigo: codigoParam });
    } catch (e) {
      // silencia erro; navega mesmo assim
    } finally {
      navigate('/salas');
      setLeaving(false);
    }
  };

  // Determina se há dois jogadores conectados
  const connectedCount = Array.isArray(sala?.SalaJogador) ? (sala.SalaJogador.filter((j) => j?.conectado).length) : (sala?.presentes ?? 0);
  const isWaiting = connectedCount < 2;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#0d0d0f', overflow: 'hidden' }}>
      {/* Botão sair no canto superior esquerdo */}
      <button
        onClick={handleSair}
        disabled={leaving}
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 3000,
          background: leaving ? '#555' : '#8b0000', color: '#fff', border: 'none',
          padding: '10px 14px', borderRadius: 8, cursor: leaving ? 'not-allowed' : 'pointer', fontWeight: 700
        }}
      >
        {leaving ? 'Saindo...' : 'Sair da sala'}
      </button>

      {/* Nomes dos jogadores no canto superior direito */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000, color: '#fff', fontWeight: 800 }}>
        {(() => {
          const hostPlayer = sala?.SalaJogador?.find?.(j => j.id_usuario === sala?.id_host);
          const clientPlayer = sala?.SalaJogador?.find?.(j => j.id_usuario !== sala?.id_host);
          const hostName = hostPlayer?.Usuario?.apelido || sala?.Usuario?.apelido || 'Jogador A';
          const clientName = clientPlayer?.Usuario?.apelido || 'Jogador B';
          return `${hostName} vs ${clientName}`;
        })()}
      </div>

      {/* Jogo centralizado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 20 }}>
        {playerData ? (
          (() => {
            const hostPlayer = sala?.SalaJogador?.find?.(j => j.id_usuario === sala?.id_host);
            const clientPlayer = sala?.SalaJogador?.find?.(j => j.id_usuario !== sala?.id_host);
            const hostName = hostPlayer?.Usuario?.apelido || sala?.Usuario?.apelido || 'Host';
            const clientName = clientPlayer?.Usuario?.apelido || 'Client';
            const names = { A: hostName, B: clientName };

            const hostSkinProduto = hostPlayer?.Usuario?.Produto_Usuario_skin_ativaToProduto || sala?.Usuario?.Produto_Usuario_skin_ativaToProduto;
            const clientSkinProduto = clientPlayer?.Usuario?.Produto_Usuario_skin_ativaToProduto;
            const hostSkinBase = hostSkinProduto?.imagem || 'default';
            const clientSkinBase = clientSkinProduto?.imagem || 'default';
            const hostSkinExt = hostSkinProduto?.extensao || 'png';
            const clientSkinExt = clientSkinProduto?.extensao || 'png';
            const skins = {
              A: hostSkinBase ? { folder: hostSkinBase, base: hostSkinBase, ext: hostSkinExt } : null,
              B: clientSkinBase ? { folder: clientSkinBase, base: clientSkinBase, ext: clientSkinExt } : null,
            };

            const hostPowers = [
              hostPlayer?.Usuario?.Produto_Usuario_poder_ativo1ToProduto,
              hostPlayer?.Usuario?.Produto_Usuario_poder_ativo2ToProduto,
              hostPlayer?.Usuario?.Produto_Usuario_poder_ativo3ToProduto,
            ].map((p) => (p ? { id: p.id_produto, nome: p.nome, imagem: p.imagem, extensao: p.extensao } : null));
            const clientPowers = [
              clientPlayer?.Usuario?.Produto_Usuario_poder_ativo1ToProduto,
              clientPlayer?.Usuario?.Produto_Usuario_poder_ativo2ToProduto,
              clientPlayer?.Usuario?.Produto_Usuario_poder_ativo3ToProduto,
            ].map((p) => (p ? { id: p.id_produto, nome: p.nome, imagem: p.imagem, extensao: p.extensao } : null));
            const powers = { A: hostPowers, B: clientPowers };

            return (
              <GameOnitama seed={undefined} roomCode={playerData.roomCode} role={playerData.role} names={names} skins={skins} powers={powers} blocked={isWaiting} />
            );
          })()
        ) : null}
      </div>

      {/* Overlay de espera centralizado e bloqueando a interação */}
      {isWaiting && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>Esperando o outro jogador</div>
        </div>
      )}
    </div>
  );
}

export default Onitama;
