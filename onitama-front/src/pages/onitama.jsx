import GameIframe from "../components/GameIframe";
import { useState, useEffect } from "react";

function Onitama() {
  // Exemplo: dados do jogador (você pode buscar da API ou contexto de autenticação)
  const [playerData, setPlayerData] = useState({
    player_name: "Jogador Teste",
    player_data: {
      apelido: "Jogador Teste",
      email: "teste@example.com",
      xp: 0,
      pontos: 0,
      moedas: 0,
      // Dados de rede (LAN)
      wsUrl: "ws://127.0.0.1:8081",
      roomCode: "sala-local",
      role: "client", // host | client
    },
  });

  // Estado do lobby LAN
  const [wsUrl, setWsUrl] = useState("ws://127.0.0.1:8081");
  const [roomCode, setRoomCode] = useState("sala-local");
  const [role, setRole] = useState("client");

  // Exemplo: buscar dados do jogador (pode ser substituído por uma chamada à API)
  useEffect(() => {
    // TODO: Substituir por chamada real à API ou contexto de autenticação
    // Exemplo:
    // const fetchPlayerData = async () => {
    //   const response = await fetch('/api/usuarios/carregar-por-hash/HASH_AQUI');
    //   const data = await response.json();
    //   setPlayerData({
    //     player_name: data.apelido || data.email || "Jogador",
    //     player_data: data
    //   });
    // };
    // fetchPlayerData();
  }, []);

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
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "0.9rem" }}>
              Servidor WS
              <input
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                placeholder="ws://192.168.0.10:8081"
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #333", background: "#111", color: "#fff", minWidth: "260px" }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "0.9rem" }}>
              Código da Sala
              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="sala-local"
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #333", background: "#111", color: "#fff", minWidth: "180px" }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "0.9rem" }}>
              Papel
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #333", background: "#111", color: "#fff" }}
              >
                <option value="host">Host</option>
                <option value="client">Cliente</option>
              </select>
            </label>
            <button
              onClick={() => {
                setPlayerData((prev) => ({
                  ...prev,
                  player_data: {
                    ...prev.player_data,
                    wsUrl,
                    roomCode,
                    role,
                  },
                }));
              }}
              style={{ padding: "10px 14px", borderRadius: "8px", background: "#2b6cb0", color: "#fff", border: "none", fontWeight: 600 }}
            >
              Conectar à Sala
            </button>
          </div>
        </div>
      </div>

      {/* Container do jogo - QUASE TELA CHEIA */}
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
        <GameIframe playerData={playerData} />
      </div>
    </div>
  );
}

export default Onitama;
