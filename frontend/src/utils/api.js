import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

let authTokenGetter = null;
let navigationHandler = null;

export function setAuthTokenGetter(getter) {
  authTokenGetter = getter;
}

export function setNavigationHandler(handler) {
  navigationHandler = handler;
}

async function getAuthToken() {
  if (authTokenGetter) {
    return authTokenGetter();
  }

  const clerk = window.Clerk;
  if (!clerk) return null;

  if (!clerk.loaded && typeof clerk.load === 'function') {
    await clerk.load();
  }

  return clerk.session?.getToken() || null;
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
