import { useLocalAuth } from '../contexts/useLocalAuth';

export function useCurrentUser() {
  const local = useLocalAuth();

  return {
    user: local.user,
    isLoaded: !local.loading,
    initials: local.user?.username?.charAt(0)?.toUpperCase() || 'U',
    displayName: local.user?.username || 'User',
    email: local.user?.email || '',
    userId: local.user?._id,
  };
}
