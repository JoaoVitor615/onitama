# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Rodando na rede local (multiplayer entre máquinas)

Para permitir que outro computador na mesma rede acesse o front e a API durante o desenvolvimento:

- O dev server do Vite já está configurado para expor na LAN (`server.host: true`) na porta `5173`.
- A API (NestJS) está configurada para ouvir em `0.0.0.0` na porta `3000` e com CORS liberado no desenvolvimento.

Passos:

1. Descubra o IP da máquina que está rodando tudo (`ipconfig` no Windows). Ex.: `192.168.0.10`.
2. Crie o arquivo `.env.local` na pasta do front com:

   ```
   VITE_API_BASE=http://<IP-DA-MAQUINA>:3000
   ```

   Substitua `<IP-DA-MAQUINA>` pelo IP obtido. Isso faz o front chamar a API diretamente, inclusive para Socket.IO.

3. Inicie o front com `npm run dev` e a API com `npm run start:dev` (ou o script que você usa).
4. No outro computador, acesse `http://<IP-DA-MAQUINA>:5173` no navegador.

Firewall no Windows:
- Garanta que as portas `5173` (front) e `3000` (API) tenham regra de entrada liberada no Firewall do Windows.
- Se necessário, crie regras específicas por porta ou permita `node.exe` nas regras de entrada.
