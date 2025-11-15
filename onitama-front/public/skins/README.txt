Coloque aqui as pastas de skins.

Estrutura:
- /skins/{nome-da-skin}/
  - {imagem}_mestre.png
  - {imagem}_peao.png

Onde {imagem} é o valor do campo `imagem` da tabela Produto.

Exemplo de pasta de teste:
- /skins/default/
  - default_mestre.png
  - default_peao.png

Observações:
- As imagens são carregadas por jogador, apenas nas peças do jogador que estiver usando a skin.
- Coloque as imagens em PNG com fundo transparente para melhor visualização.