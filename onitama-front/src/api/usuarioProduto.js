import { httpFetch } from './http';

export async function gravarUsuarioProduto(id_usuario, id_produto) {
  return httpFetch('/api/usuario-produto/gravar', {
    method: 'POST',
    body: JSON.stringify({ id_usuario, id_produto }),
  });
}

export async function listarUsuarioProdutosPorUsuario(id_usuario) {
  return httpFetch(`/api/usuario-produto/carregar-por-usuario/${encodeURIComponent(id_usuario)}`);
}