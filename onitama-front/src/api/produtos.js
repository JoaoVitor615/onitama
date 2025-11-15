import { httpFetch } from './http';

export async function listarProdutos() {
  return httpFetch('/api/produto/listar-todos');
}