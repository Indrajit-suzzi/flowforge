import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

let navigationHandler = null;

export function setNavigationHandler(handler) {
  navigationHandler = handler;
}

async function getAuthToken() {
  return localStorage.getItem('auth_token');
}

api.interceptors.request.use(async (config) => {
  try {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Token retrieval is best-effort
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      if (navigationHandler) {
        navigationHandler('/sign-in');
      } else if (!window.location.pathname.includes('/sign-in')) {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
