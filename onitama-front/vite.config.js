import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    // Plugin customizado para garantir que arquivos HTML do Godot sejam servidos corretamente
    {
      name: "godot-html-fix",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Garantir que arquivos HTML na pasta godot-onitama sejam servidos corretamente
          if (req.url && req.url.startsWith("/godot-onitama/") && req.url.endsWith(".html")) {
            res.setHeader("Content-Type", "text/html");
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 3000,
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
    // Garantir que arquivos estáticos sejam servidos corretamente
    fs: {
      strict: false,
    },
  },
  build: {
    assetsDir: "assets",
  },
  publicDir: "public",
  // Garantir que os arquivos do Godot sejam servidos corretamente
  assetsInclude: ["**/*.js", "**/*.wasm", "**/*.pck", "**/*.html"],
});
