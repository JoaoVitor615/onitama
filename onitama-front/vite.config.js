import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    // Plugin customizado para servir arquivos do Godot como estáticos
    // Deve executar ANTES de qualquer outro middleware do Vite
    {
      name: "godot-static-files",
      configureServer(server) {
        // Adicionar middleware ANTES do Vite processar
        server.middlewares.use((req, res, next) => {
          // Se for um arquivo do Godot, servir diretamente sem processamento
          if (req.url && req.url.startsWith("/godot-onitama/")) {
            const filePath = path.join(__dirname, "public", req.url);
            
            // Verificar se o arquivo existe
            if (fs.existsSync(filePath)) {
              const ext = path.extname(filePath);
              let contentType = "application/octet-stream";
              
              // Definir Content-Type apropriado
              if (ext === ".html") contentType = "text/html; charset=utf-8";
              else if (ext === ".js") contentType = "application/javascript; charset=utf-8";
              else if (ext === ".wasm") contentType = "application/wasm";
              else if (ext === ".pck") contentType = "application/octet-stream";
              else if (ext === ".png") contentType = "image/png";
              
              res.setHeader("Content-Type", contentType);
              res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
              res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
              
              // Ler e servir o arquivo diretamente
              const fileContent = fs.readFileSync(filePath);
              res.end(fileContent);
              return;
            }
          }
          next();
        });
      },
      // Garantir que este plugin execute primeiro
      enforce: "pre",
    },
  ],
  server: {
    port: 3000,
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
    fs: {
      strict: false,
    },
  },
  build: {
    assetsDir: "assets",
    rollupOptions: {
      // Não processar arquivos do Godot no build
      external: (id) => {
        return id.includes("/godot-onitama/");
      },
    },
  },
  publicDir: "public",
  assetsInclude: ["**/*.wasm", "**/*.pck"],
});
