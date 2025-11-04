# Solução para o Problema do Jogo Godot

## Problema
Ao acessar `/onitama`, o arquivo JavaScript do Godot está sendo exibido como texto ao invés do jogo executar.

## Possíveis Causas

1. **Tipo MIME incorreto**: O servidor pode estar servindo o `.js` com tipo MIME errado
2. **Caminho dos arquivos**: Os arquivos podem não estar sendo encontrados
3. **Configuração do Vite**: Pode precisar de configuração adicional

## Soluções

### 1. Verificar se o HTML está sendo servido corretamente

Abra no navegador: `http://localhost:3000/godot-onitama/Onitama.html`

Se funcionar diretamente, o problema é no iframe. Se não funcionar, o problema é no servidor.

### 2. Limpar cache e reiniciar

```bash
cd onitama-front
rm -rf node_modules/.vite  # ou no Windows: rmdir /s node_modules\.vite
npm run dev
```

### 3. Verificar se todos os arquivos existem

Certifique-se de que todos estes arquivos existem em `public/godot-onitama/`:
- Onitama.html
- Onitama.js
- Onitama.wasm
- Onitama.pck
- Onitama.png (opcional)
- Onitama.icon.png (opcional)

### 4. Testar diretamente o HTML

Abra o arquivo HTML diretamente no navegador para verificar se há erros no console:
- F12 para abrir DevTools
- Console tab para ver erros
- Network tab para verificar se os arquivos estão carregando

### 5. Verificar Headers CORS

O Vite já está configurado com os headers corretos para Cross-Origin, mas verifique se não há conflitos.

