const BASE_URL = import.meta.env.VITE_MS_AUTH_URL || 'http://localhost:8080';

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    try {
      window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'unauthorized' } }));
    } catch (_) { /* noop */ }
  }
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = typeof data === 'string' ? data : (data?.message || JSON.stringify(data));
    throw new Error(message || `HTTP ${res.status}`);
  }
  return data;
}

export const authApi = {
  async login(email, senha) {
    return apiFetch('/api/auth/login', { method: 'POST', body: { Email: email, Senha: senha } });
  },
  async register({ nome, sobrenome, email, senha }) {
    return apiFetch('/api/auth/register', { method: 'POST', body: { Nome: nome, Sobrenome: sobrenome, Email: email, Senha: senha } });
  }
};

export const usuariosApi = {
  async list(token) {
    return apiFetch('/api/usuarios', { method: 'GET', token });
  },
  async getById(id, token) {
    return apiFetch(`/api/usuarios/${id}`, { method: 'GET', token });
  },
  async update(id, body, token) {
    return apiFetch(`/api/usuarios/${id}`, { method: 'PUT', body, token });
  }
};