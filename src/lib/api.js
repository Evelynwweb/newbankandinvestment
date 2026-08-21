/* ============================================================
   Thin fetch wrapper for the Betament API.

   Base URL comes from VITE_API_URL. When that variable is absent the
   app falls back to the in-browser demo backend (lib/mockApi.js) so the
   frontend runs standalone — same request shapes, same responses, so
   pointing VITE_API_URL at a real server is the only switch needed.
   ============================================================ */
import { mockRequest } from './mockApi.js';

const RAW_URL = import.meta.env.VITE_API_URL || '';
const API_URL = RAW_URL.replace(/\/$/, '');
export const USING_MOCK = !API_URL;

const TOKEN_KEY = 'betament-token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  if (USING_MOCK) return mockRequest(path, method, body, getToken());

  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server — check your connection.', 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.message || `Request failed (${res.status})`, res.status, data.code);
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body = {}) => request(path, { method: 'POST', body }),
  put: (path, body = {}) => request(path, { method: 'PUT', body }),
  patch: (path, body = {}) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};
