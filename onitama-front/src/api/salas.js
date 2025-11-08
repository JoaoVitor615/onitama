export async function criarSala({ codigo, id_host }) {
  const res = await fetch('/api/salas/criar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo, id_host }),
  });
  if (!res.ok) throw new Error('Falha ao criar sala');
  return await res.json();
}

export async function entrarSala({ codigo, id_usuario, papel }) {
  const res = await fetch('/api/salas/entrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo, id_usuario, papel }),
  });
  if (!res.ok) throw new Error('Falha ao entrar na sala');
  return await res.json();
}

export async function carregarSalaPorCodigo(codigo) {
  const res = await fetch(`/api/salas/carregar-por-codigo/${encodeURIComponent(codigo)}`);
  if (!res.ok) throw new Error('Sala não encontrada');
  return await res.json();
}