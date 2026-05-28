import { useLocalAuth } from '../contexts/useLocalAuth';

export function useRole() {
  const { user } = useLocalAuth();
  const role = user?.role || 'member';
  const isAdmin = role === 'admin';

  return { role, isAdmin };
}
