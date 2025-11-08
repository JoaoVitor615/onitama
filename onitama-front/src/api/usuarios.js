export async function carregarUsuarioPorHash(hash) {
  const res = await fetch(`/api/usuarios/carregar-por-hash/${encodeURIComponent(hash)}`);
  if (!res.ok) throw new Error('Usuário não encontrado');
  return await res.json();
}