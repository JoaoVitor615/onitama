import { useRef, useEffect, useState } from "react";

function GameIframe({ playerData = null }) {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGame = async () => {
      try {
        const response = await fetch("/godot-onitama/Onitama.html");
        if (!response.ok) {
          throw new Error("Arquivo HTML não encontrado");
        }

        if (iframeRef.current) {
          iframeRef.current.src = "/godot-onitama/Onitama.html";
        }
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadGame();
  }, []);

  // Envia dados para o Godot quando disponível
  useEffect(() => {
    if (!iframeRef.current || isLoading || !playerData) return;

    const sendDataToGodot = () => {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return;

      try {
        // Método 1: postMessage (funciona com iframe)
        iframe.contentWindow.postMessage(
          {
            type: "GODOT_DATA",
            payload: playerData,
          },
          "*" // Em produção, use a origem específica do iframe
        );

        // Método 2: Tentar chamar diretamente via função global
        // (funciona se o iframe estiver no mesmo domínio ou com permissões)
        if (iframe.contentWindow.sendToGodot) {
          iframe.contentWindow.sendToGodot(playerData);
        }
      } catch (err) {
        console.warn("Erro ao enviar dados para o Godot:", err);
      }
    };

    // Aguarda um pouco para garantir que o Godot está pronto
    const timeout = setTimeout(sendDataToGodot, 2000);

    return () => clearTimeout(timeout);
  }, [isLoading, playerData]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);

    // Envia dados novamente quando o iframe carrega
    if (playerData && iframeRef.current?.contentWindow) {
      setTimeout(() => {
        try {
          iframeRef.current.contentWindow.postMessage(
            {
              type: "GODOT_DATA",
              payload: playerData,
            },
            "*"
          );
        } catch (err) {
          console.warn("Erro ao enviar dados após carregar:", err);
        }
      }, 1000);
    }
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Erro ao carregar o jogo Godot");
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "80vh", // 👈 AUMENTEI A ALTURA
        minHeight: "700px", // 👈 ALTURA MÍNIMA
      }}
    >
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            padding: "20px",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            borderRadius: "8px",
          }}
        >
          Carregando Onitama...
        </div>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            padding: "20px",
            background: "rgba(255,0,0,0.8)",
            color: "white",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          ❌ {error}
          <br />
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: "10px", padding: "5px 10px" }}
          >
            Tentar Novamente
          </button>
        </div>
      )}

      <iframe
        ref={iframeRef}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "8px",
          opacity: isLoading || error ? 0 : 1,
        }}
        title="Onitama Game"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
      />
    </div>
  );
}

export default GameIframe;
