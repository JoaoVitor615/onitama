import { httpFetch } from './http';

export async function criarSala({ codigo, id_host }) {
  return httpFetch('/api/salas/criar', {
    method: 'POST',
    body: JSON.stringify({ codigo, id_host }),
  });
}

export async function entrarSala({ codigo, id_usuario, papel }) {
  return httpFetch('/api/salas/entrar', {
    method: 'POST',
    body: JSON.stringify({ codigo, id_usuario, papel }),
  });
}

export async function carregarSalaPorCodigo(codigo) {
  return httpFetch(`/api/salas/carregar-por-codigo/${encodeURIComponent(codigo)}`);
}