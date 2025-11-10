// Base URL do BFF: primeiro VITE_BFF_BASE_URL, depois VITE_API_BASE_URL/MS_AUTH, por fim localhost
const BFF_BASE_URL =
  import.meta.env.VITE_BFF_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_MS_AUTH_URL ||
  'http://localhost:5299';

export async function getQuotes(symbols = []) {
  const list = Array.isArray(symbols) ? symbols : String(symbols).split(',');
  // Evita enviar "symbols=" vazio, que alguns gateways tratam como requisição inválida (400)
  const params = new URLSearchParams();
  const joined = list.filter(Boolean).join(',');
  if (joined) params.set('symbols', joined);
  const url = `${BFF_BASE_URL}/api/market/quotes${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = typeof data === 'string' ? data : (data?.message || JSON.stringify(data));
    throw new Error(message || `HTTP ${res.status}`);
  }
  return data; // { quotes, partial, source, ttlSeconds }
}