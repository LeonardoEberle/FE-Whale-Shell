// Base URL do MS-Wallet: usa VITE_MS_WALLET_URL ou fallback localhost:8090
const WALLET_BASE_URL =
  import.meta.env.VITE_MS_WALLET_URL ||
  'http://localhost:8090';

async function walletFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${WALLET_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    try { window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'unauthorized' } })); } catch (_) {}
  }
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = typeof data === 'string' ? data : (data?.message || JSON.stringify(data));
    throw new Error(message || `HTTP ${res.status}`);
  }
  return data;
}

export const walletApi = {
  async getMyWallet(token) {
    return walletFetch('/api/wallets/me', { method: 'GET', token });
  },
  async createWallet(portfolio, token) {
    return walletFetch('/api/wallets', { method: 'POST', body: { portfolio }, token });
  },
  async updateMyWallet(portfolio, token) {
    return walletFetch('/api/wallets/me', { method: 'PUT', body: { portfolio }, token });
  },
};