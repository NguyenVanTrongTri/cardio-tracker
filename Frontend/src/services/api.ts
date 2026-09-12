// API client using native fetch
const BASE_URL = '/api';

export const api = {
  async get<T = unknown>(endpoint: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    if (!res.ok) {
      throw new Error(`API GET request failed with status ${res.status}`);
    }
    return res.json() as Promise<T>;
  },

  async post<T = unknown>(endpoint: string, data: unknown): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`API POST request failed with status ${res.status}`);
    }
    return res.json() as Promise<T>;
  },
};

export default api;
