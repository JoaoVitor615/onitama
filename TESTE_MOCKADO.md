# Como Testar os Dados Mockados

## ✅ Status: Pronto para Testar!

A solução está completa e pronta para ser testada. Existe uma **interface visual** no jogo que exibe os dados.

## Onde Ver os Dados no Jogo

### Interface Visual
Na parte **inferior esquerda** do jogo, há uma barra preta semi-transparente com o texto:
- **"Jogador: Aguardando..."** (estado inicial)
- **"Jogador: Jogador Teste"** (quando os dados mockados chegarem)

## Como Testar

### 1. Exportar o Jogo do Godot

1. Abra o projeto no Godot Editor
2. Vá em **Project → Export**
3. Certifique-se de que o **Template Web** está instalado
4. Configure a exportação:
   - **Export Path**: `onitama-front/public/godot-onitama/Onitama.html`
   - Marque **Export With Debug**
5. Clique em **Export Project**

> ⚠️ **Importante**: Após exportar, o Autoload `JavaScriptBridge` será incluído automaticamente.

### 2. Rodar o Frontend React

```bash
cd onitama-front
npm install  # se ainda não instalou
npm run dev
```

### 3. Acessar a Página

1. Abra `http://localhost:5173/onitama` (ou a porta que o Vite usar)
2. Aguarde o jogo carregar
3. Observe a parte inferior esquerda do jogo

### 4. O Que Esperar Ver

**Antes dos dados chegarem:**
```
┌─────────────────────────────────────┐
│                                     │
│        [Tabuleiro do Jogo]         │
│                                     │
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│    Jogador: Aguardando...          │ ← Barra preta
└─────────────────────────────────────┘
```

**Depois dos dados chegarem (após 1-2 segundos):**
```
┌─────────────────────────────────────┐
│                                     │
│        [Tabuleiro do Jogo]         │
│                                     │
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│    Jogador: Jogador Teste          │ ← Barra preta
└─────────────────────────────────────┘
```

## Debug

### Console do Navegador (F12)

Verifique os logs:
- `Godot bridge ready` - Bridge JavaScript configurado
- `PostMessage listener configurado` - Listener de mensagens configurado
- `[JavaScriptBridge] Dados recebidos do JavaScript:` - Dados chegando
- `[PlayerInfo] Nome do jogador atualizado:` - UI atualizada

### Se Não Funcionar

1. **Dados não aparecem:**
   - Verifique o console do navegador para erros
   - Aguarde 3-5 segundos após o jogo carregar
   - Verifique se o `playerData` está sendo passado no React

2. **Label não está visível:**
   - A barra está no canto inferior esquerdo
   - Fundo preto semi-transparente
   - Texto branco, tamanho 20

3. **Bridge não funciona:**
   - Verifique se exportou com o template Web correto
   - Certifique-se de que o Autoload está no project.godot

## Dados Mockados Atuais

Os dados mockados estão definidos em `onitama-front/src/pages/onitama.jsx`:

```javascript
{
  player_name: "Jogador Teste",
  player_data: {
    apelido: "Jogador Teste",
    email: "teste@example.com",
    xp: 0,
    pontos: 0,
    moedas: 0,
  }
}
```

Você pode modificar esses valores diretamente no código para testar diferentes nomes.

## Próximos Passos

Após confirmar que funciona:
1. Integrar com dados reais da API
2. Adicionar mais campos visíveis (XP, Pontos, Moedas)
3. Melhorar o estilo visual da barra de informações

