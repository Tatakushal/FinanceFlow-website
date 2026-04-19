/**
 * API service — centralised fetch wrapper
 * Reads VITE_API_BASE from .env (defaults to /api for production)
 */

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export function callFlowAI({ message, profile, history }) {
  return request('/flowai', {
    method: 'POST',
    body: JSON.stringify({ message, profile, history }),
  });
}
