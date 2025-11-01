# Ponte de Comunicação React ↔ Godot

Esta solução permite passar dados do React (frontend) para o jogo Godot usando `postMessage` e JavaScript Bridge.

## Arquitetura

```
React (onitama-front)
    ↓ postMessage
HTML do Godot (iframe)
    ↓ JavaScript Bridge
Godot (JavaScriptBridge.gd)
    ↓ Signals
Componentes do Jogo (PlayerInfo.gd)
```

## Como Funciona

### 1. React → Godot

O React envia dados através do componente `GameIframe`:

```javascript
const playerData = {
  player_name: "João Silva",
  player_data: {
    apelido: "João Silva",
    email: "joao@example.com",
    xp: 100,
    pontos: 500,
    moedas: 50
  }
};

<GameIframe playerData={playerData} />
```

### 2. Godot recebe os dados

O Autoload `JavaScriptBridge` recebe os dados e emite um sinal:

```gdscript
# Em qualquer script do jogo:
JavaScriptBridge.player_data_received.connect(_on_player_data_received)

func _on_player_data_received(data: Dictionary):
    var player_name = data.get("player_name", "")
    print("Nome do jogador: ", player_name)
```

### 3. Exibir no jogo

O componente `PlayerInfo` já está integrado e exibe o nome do jogador automaticamente.

## Estrutura de Dados

### Formato esperado do React:

```typescript
{
  player_name: string,           // Nome direto do jogador
  player_data: {
    apelido?: string,            // Apelido do jogador
    email?: string,              // Email
    xp?: number,                 // Experiência
    pontos?: number,             // Pontos
    moedas?: number,             // Moedas
    id_usuario?: number,         // ID do usuário
    hash_id?: string             // Hash do usuário
  }
}
```

## Arquivos Criados/Modificados

### Godot:
- `game/Bridge/JavaScriptBridge.gd` - Autoload que gerencia comunicação JavaScript
- `game/UI/PlayerInfo.gd` - Script para exibir informações do jogador
- `game/UI/PlayerInfo.tscn` - Cena UI do componente PlayerInfo
- `game/Main.tscn` - Adicionado PlayerInfo
- `game/project.godot` - Adicionado autoload JavaScriptBridge

### React:
- `onitama-front/src/components/GameIframe.jsx` - Modificado para enviar dados
- `onitama-front/src/pages/onitama.jsx` - Adicionado exemplo de dados do jogador

## Uso Avançado

### Enviar dados da API para o Godot

No React, você pode buscar dados da API e passar para o Godot:

```javascript
useEffect(() => {
  const fetchPlayerData = async () => {
    const response = await fetch('/api/usuarios/carregar-por-hash/HASH_AQUI');
    const data = await response.json();
    setPlayerData({
      player_name: data.apelido || data.email || "Jogador",
      player_data: data
    });
  };
  fetchPlayerData();
}, []);
```

### Enviar dados do Godot para o React

O Godot pode enviar dados de volta para o React:

```gdscript
# No Godot
JavaScriptBridge.send_to_javascript({
  "game_event": "player_won",
  "score": 1000
})
```

No React, você precisa adicionar um listener:

```javascript
useEffect(() => {
  window.receiveFromGodot = (data) => {
    console.log("Dados do Godot:", data);
  };
}, []);
```

## Troubleshooting

### Dados não estão chegando no Godot

1. Verifique o console do navegador (F12) para erros JavaScript
2. Verifique o output do Godot no editor ou console web
3. Certifique-se de que o `JavaScriptBridge` está configurado como Autoload
4. Aguarde alguns segundos após o jogo carregar antes de enviar dados

### PlayerInfo não atualiza

1. Verifique se o sinal está conectado corretamente
2. Certifique-se de que o PlayerInfo.tscn está na cena Main.tscn
3. Verifique se o nome do Label está correto: `PlayerNameLabel`

## Próximos Passos

- [ ] Integrar com sistema de autenticação real
- [ ] Adicionar mais campos exibidos (XP, Pontos, Moedas)
- [ ] Implementar sincronização de estado do jogo com a API
- [ ] Adicionar feedback visual quando dados são recebidos

