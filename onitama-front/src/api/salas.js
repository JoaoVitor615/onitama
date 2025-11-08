import { httpFetch } from './http';

export async function criarSala() {
  // Informações (id usuário, código, nome, servidor) são definidas no backend;
  // o id segue nos headers e o restante é gerado automaticamente.
  return httpFetch('/api/salas/criar', {
    method: 'POST',
    body: JSON.stringify({}),
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

export async function listarSalas() {
  return httpFetch('/api/salas/listar');
}