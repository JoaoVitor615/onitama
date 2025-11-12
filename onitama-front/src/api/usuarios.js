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

export async function atualizarMoedas(id_usuario, moedas) {
  return httpFetch('/api/usuarios/gravar', {
    method: 'POST',
    body: JSON.stringify({ id_usuario, moedas }),
  });
}

export async function atualizarSkinAtiva(id_usuario, skin_ativa) {
  return httpFetch('/api/usuarios/gravar', {
    method: 'POST',
    body: JSON.stringify({ id_usuario, skin_ativa }),
  });
}

export async function atualizarCenarioAtivo(id_usuario, cenario_ativo) {
  return httpFetch('/api/usuarios/gravar', {
    method: 'POST',
    body: JSON.stringify({ id_usuario, cenario_ativo }),
  });
}