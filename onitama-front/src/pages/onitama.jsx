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
        const count = Array.isArray(s?.SalaJogador) ? s.SalaJogador.length : (s?.presentes ?? 0);
        const isReady = s?.status === 'in_progress' || count >= 2;
        const role = (usuarioId && s?.id_host === usuarioId) ? 'host' : 'client';
        if (isReady) {
          setPlayerData({ wsUrl, roomCode: s?.codigo || codigoParam, name: `Jogador ${usuarioId ?? ''}`.trim(), role });
        }
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
          const count = Array.isArray(s?.SalaJogador) ? s.SalaJogador.length : (s?.presentes ?? 0);
          const isReady = s?.status === 'in_progress' || count >= 2;
          if (isReady && !playerData) {
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
          const count = Array.isArray(s?.SalaJogador) ? s.SalaJogador.length : (s?.presentes ?? 0);
          const isReady = s?.status === 'in_progress' || count >= 2;
          if (isReady && !playerData) {
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

  return (
    <div
      style={{
        backgroundColor: "#1a1a2e",
        minHeight: "100vh",
        padding: "15px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Cabeçalho compacto */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "15px",
          width: "100%",
        }}
      >
        <h1
          style={{
            color: "#ffffff",
            margin: "0 0 8px 0",
            fontSize: "2.2rem",
          }}
        >
          🎮 Onitama
        </h1>
        <div style={{ maxWidth: "900px", margin: "10px auto", color: "#ddd" }}>
          {(!codigoParam || error) && (
            <div style={{ padding: "10px", background: "#222", borderRadius: "8px" }}>
              {error || "Abra pelo botão Entrar na página de Salas."}
            </div>
          )}
          {codigoParam && !playerData && (
            <div style={{ padding: "10px", background: "#222", borderRadius: "8px" }}>
              Aguardando outro jogador entrar na sala "{codigoParam}"...
            </div>
          )}
          {playerData && (
            <div style={{ padding: "10px", background: "#1f4f1f", borderRadius: "8px" }}>
              Sala pronta! Iniciando partida em "{playerData.roomCode}".
            </div>
          )}
          {/* Apelidos dos jogadores quando disponíveis */}
          {sala && Array.isArray(sala.SalaJogador) && sala.SalaJogador.length > 0 && (
            <div style={{
              marginTop: "12px",
              padding: "10px",
              background: "#222",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ color: "#fff" }}>
                {(() => {
                  const hostPlayer = sala.SalaJogador.find(j => j.id_usuario === sala.id_host);
                  const clientPlayer = sala.SalaJogador.find(j => j.id_usuario !== sala.id_host);
                  const hostName = hostPlayer?.Usuario?.apelido || sala.Usuario?.apelido || "Host";
                  const clientName = clientPlayer?.Usuario?.apelido || "Client";
                  return `👤 ${hostName} vs ${clientName}`;
                })()}
              </div>
            </div>
          )}

          <div style={{ marginTop: "12px" }}>
            <button
              onClick={handleSair}
              disabled={leaving}
              style={{
                background: leaving ? "#555" : "#8b0000",
                color: "#fff",
                border: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: leaving ? "not-allowed" : "pointer",
              }}
            >
              {leaving ? "Saindo..." : "Sair da sala"}
            </button>
          </div>
        </div>
      </div>

      {/* Container do jogo Onitama (novo) */}
      <div
        style={{
          width: "98%", // 👈 QUASE 100% DA LARGURA
          height: "85vh", // 👈 QUASE 100% DA ALTURA
          minHeight: "650px",
          maxWidth: "1400px", // 👈 LARGURA MÁXIMA BEM GRANDE
          backgroundColor: "#000000",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 10px 35px rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "2px solid rgba(255,255,255,0.1)", // 👈 BORDA SUTIL
        }}
      >
        {playerData ? (
          (() => {
            const hostPlayer = sala?.SalaJogador?.find?.(j => j.id_usuario === sala?.id_host);
            const clientPlayer = sala?.SalaJogador?.find?.(j => j.id_usuario !== sala?.id_host);
            const hostName = hostPlayer?.Usuario?.apelido || sala?.Usuario?.apelido || "Host";
            const clientName = clientPlayer?.Usuario?.apelido || "Client";
            const names = { A: hostName, B: clientName };
            return (
              <GameOnitama seed={undefined} roomCode={playerData.roomCode} role={playerData.role} names={names} />
            );
          })()
        ) : (
          <div style={{ color: "#fff", textAlign: "center", padding: "20px" }}>
            Aguardando sala ficar pronta para iniciar a partida.
          </div>
        )}
      </div>
    </div>
  );
}

export default Onitama;
