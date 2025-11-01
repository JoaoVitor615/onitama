import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    // Plugin customizado para servir arquivos do Godot como estáticos
    // Deve executar ANTES do plugin React
    {
      name: "godot-static-files",
      configureServer(server) {
        // Middleware que intercepta ANTES de qualquer processamento do Vite
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
              else if (ext === ".json") contentType = "application/json";
              
              try {
                res.setHeader("Content-Type", contentType);
                res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
                res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                
                // Ler e servir o arquivo diretamente
                const fileContent = fs.readFileSync(filePath);
                res.writeHead(200);
                res.end(fileContent);
                return;
              } catch (error) {
                console.error("Erro ao servir arquivo do Godot:", error);
                res.writeHead(500);
                res.end("Erro ao servir arquivo");
                return;
              }
            } else {
              console.warn("Arquivo não encontrado:", filePath);
            }
          }
          next();
        });
      },
      // Garantir que este plugin execute PRIMEIRO
      enforce: "pre",
    },
    react(),
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
    // Ignorar arquivos do Godot do processamento do Vite
    watch: {
      ignored: ['**/godot-onitama/**'],
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
