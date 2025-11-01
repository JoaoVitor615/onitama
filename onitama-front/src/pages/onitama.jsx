import GameIframe from "../components/GameIframe";

function Onitama() {
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

        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
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
        <GameIframe />
      </div>
    </div>
  );
}

export default Onitama;
