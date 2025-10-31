import { useState, useEffect } from "react";

function DebugGodot() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const filesToCheck = [
      "/godot-onitama/Onitama.html",
      "/godot-onitama/Onitama.js",
      "/godot-onitama/Onitama.wasm",
      "/godot-onitama/Onitama.pck",
    ];

    const checkFiles = async () => {
      const results = await Promise.all(
        filesToCheck.map(async (file) => {
          try {
            const response = await fetch(file);
            return {
              file,
              exists: response.ok,
              status: response.status,
              size: response.headers.get("content-length"),
            };
          } catch (error) {
            return {
              file,
              exists: false,
              status: "Error",
              error: error.message,
            };
          }
        })
      );
      setFiles(results);
    };

    checkFiles();
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        background: "#f5f5f5",
        margin: "20px 0",
        borderRadius: "8px",
      }}
    >
      <h3>🔍 Debug - Arquivos Godot:</h3>
      {files.map((item, index) => (
        <div
          key={index}
          style={{
            color: item.exists ? "green" : "red",
            margin: "8px 0",
            fontFamily: "monospace",
          }}
        >
          {item.exists ? "✅" : "❌"} {item.file}
          <br />
          <span style={{ fontSize: "12px", color: "#666" }}>
            Status: {item.status} | Tamanho: {item.size || "N/A"}
          </span>
          {item.error && (
            <div style={{ color: "red", fontSize: "12px" }}>
              Erro: {item.error}
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: "20px" }}>
        <h4>Teste Direto:</h4>
        <a
          href="/godot-onitama/Onitama.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          Abrir Onitama.html diretamente
        </a>
      </div>
    </div>
  );
}

export default DebugGodot;
