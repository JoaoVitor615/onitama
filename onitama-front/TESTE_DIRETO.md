# Teste Direto do Godot

## Para diagnosticar o problema:

1. **Teste direto no navegador:**
   - Acesse: `http://localhost:3000/godot-onitama/Onitama.html`
   - Se funcionar aqui, o problema é no iframe
   - Se não funcionar, o problema é no servidor

2. **Verifique o console do navegador (F12):**
   - Network tab: Veja qual arquivo está sendo carregado
   - Console tab: Veja se há erros

3. **Verifique os headers:**
   - No Network tab, clique no arquivo `Onitama.html`
   - Veja o Response Headers
   - `Content-Type` deve ser `text/html`

4. **Se ainda mostrar código JS:**
   - O middleware pode não estar funcionando
   - Tente acessar `http://localhost:3000/godot-onitama/Onitama.js` diretamente
   - Veja se retorna o arquivo JS ou algo processado

## Solução Alternativa:

Se o middleware não funcionar, podemos tentar:
1. Servir os arquivos do Godot em uma porta/domínio diferente
2. Usar um servidor estático separado apenas para o Godot
3. Copiar os arquivos para outra estrutura

