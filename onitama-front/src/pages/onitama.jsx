import GameIframe from "../components/GameIframe";
import { useState } from "react";
import { criarSala, entrarSala, carregarSalaPorCodigo } from "../api/salas";

function Onitama() {
  // Parâmetros necessários para o jogo (consumidos pelo Godot)
  const [playerData, setPlayerData] = useState(null);

  // Estado do lobby / salas
  const [wsUrl, setWsUrl] = useState("ws://127.0.0.1:8081");
  const [roomCode, setRoomCode] = useState("");
  const [usuarioId, setUsuarioId] = useState("");
  const [nomeJogador, setNomeJogador] = useState("");
  const [role, setRole] = useState("client"); // host | client

  const handleCriarSala = async () => {
    if (!roomCode || !usuarioId) {
      alert("Informe o código da sala e seu ID de usuário.");
      return;
    }
    try {
      await criarSala({ codigo: roomCode, id_host: Number(usuarioId) });
      await entrarSala({ codigo: roomCode, id_usuario: Number(usuarioId), papel: "HOST" });
      setPlayerData({
        wsUrl,
        roomCode,
        name: nomeJogador || `Host ${usuarioId}`,
        role: "host",
      });
    } catch (err) {
      console.error(err);
      alert("Falha ao criar/entrar na sala");
    }
  };

  const handleEntrarSala = async () => {
    if (!roomCode || !usuarioId) {
      alert("Informe o código da sala e seu ID de usuário.");
      return;
    }
    try {
      const sala = await carregarSalaPorCodigo(roomCode);
      if (!sala) throw new Error("Sala inexistente");
      await entrarSala({ codigo: roomCode, id_usuario: Number(usuarioId), papel: "CLIENTE" });
      setPlayerData({
        wsUrl,
        roomCode,
        name: nomeJogador || `Cliente ${usuarioId}`,
        role: "client",
      });
    } catch (err) {
      console.error(err);
      alert("Falha ao entrar na sala");
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
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "0.9rem" }}>
              Servidor WS
              <input
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                placeholder="ws://localhost:8081"
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
              Seu ID de Usuário
              <input
                value={usuarioId}
                onChange={(e) => setUsuarioId(e.target.value)}
                placeholder="ex: 42"
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #333", background: "#111", color: "#fff", minWidth: "120px" }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "0.9rem" }}>
              Seu Nome
              <input
                value={nomeJogador}
                onChange={(e) => setNomeJogador(e.target.value)}
                placeholder="apelido"
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #333", background: "#111", color: "#fff", minWidth: "160px" }}
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
              onClick={role === "host" ? handleCriarSala : handleEntrarSala}
              style={{ padding: "10px 14px", borderRadius: "8px", background: "#2b6cb0", color: "#fff", border: "none", fontWeight: 600 }}
            >
              {role === "host" ? "Criar e Entrar" : "Entrar na Sala"}
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
