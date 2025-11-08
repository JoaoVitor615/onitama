import { httpFetch } from './http';

export async function carregarUsuarioPorHash(hash) {
  return httpFetch(`/api/usuarios/carregar-por-hash/${encodeURIComponent(hash)}`);
}

export async function loginUsuario(email, senha) {
  return httpFetch('/api/usuarios/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
}