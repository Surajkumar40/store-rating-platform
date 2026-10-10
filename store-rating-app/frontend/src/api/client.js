import axios from 'axios';

const TOKEN_KEY = 'sr_token';
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const t = tokenStore.get();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// Expired/invalid token on a protected call: clear it and return to login.
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const isAuthCall = err.config?.url?.startsWith('/auth/login') || err.config?.url?.startsWith('/auth/signup');
    if (err.response?.status === 401 && !isAuthCall && tokenStore.get()) {
      tokenStore.clear();
      window.location.assign('/login');
    }
    return Promise.reject(err);
  }
);

// Turns an axios error into { message, fields } for forms.
export function parseError(err) {
  if (!err.response) return { message: 'Cannot reach the server. Check your connection and try again.', fields: {} };
  const { message, details } = err.response.data || {};
  return { message: message || 'Something went wrong', fields: details || {} };
}

export default api;
