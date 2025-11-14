const KEY_ID = 'usuario_id';
const KEY_HASH = 'usuario_hash';

export function setUsuarioId(id) {
  try { localStorage.setItem(KEY_ID, String(id)); } catch (_) {}
}

export function getUsuarioId() {
  try {
    const v = localStorage.getItem(KEY_ID);
    return v ? Number(v) : null;
  } catch (_) { return null; }
}

export function setUsuarioHash(hash) {
  try { if (hash) localStorage.setItem(KEY_HASH, String(hash)); } catch (_) {}
}

export function getUsuarioHash() {
  try { return localStorage.getItem(KEY_HASH); } catch (_) { return null; }
}

export async function httpFetch(path, { headers = {}, ...rest } = {}) {
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || '';
  const id = getUsuarioId();
  const hash = getUsuarioHash();
  const mergedHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (id != null) mergedHeaders['X-Usuario-Id'] = String(id);
  if (hash) mergedHeaders['X-Usuario-Hash'] = String(hash);

  let url = path;
  if (API_BASE) {
    if (/^https?:\/\//.test(API_BASE)) {
      url = API_BASE + String(path || '').replace(/^\/api/, '');
    } else {
      url = API_BASE + path;
    }
  }

  const res = await fetch(url, { headers: mergedHeaders, ...rest });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}