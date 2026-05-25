import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

let authTokenGetter = null;

export function setAuthTokenGetter(getter) {
  authTokenGetter = getter;
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
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isSignedInWithClerk = Boolean(authTokenGetter || window.Clerk?.session);

    if (err.response?.status === 401 && !isSignedInWithClerk && window.location.pathname !== '/sign-in') {
      window.location.href = '/sign-in';
    }
    return Promise.reject(err);
  }
);

export default api;
