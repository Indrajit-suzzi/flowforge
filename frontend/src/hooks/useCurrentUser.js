import { useUser } from '@clerk/clerk-react';
import { useLocalAuth } from '../contexts/useLocalAuth';

export function useCurrentUser() {
  const clerk = useUser();
  const local = useLocalAuth();

  const isClerk = !!(clerk.isLoaded && clerk.user);

  if (isClerk) {
    return {
      user: clerk.user,
      isLoaded: clerk.isLoaded,
      isClerk: true,
      initials: clerk.user.firstName?.charAt(0)?.toUpperCase() || clerk.user.username?.charAt(0)?.toUpperCase() || 'U',
      displayName: clerk.user.firstName || clerk.user.username || 'User',
      email: clerk.user.primaryEmailAddress?.emailAddress || '',
      userId: clerk.user.id,
    };
  }

  return {
    user: local.user,
    isLoaded: !local.loading,
    isClerk: false,
    initials: local.user?.username?.charAt(0)?.toUpperCase() || 'U',
    displayName: local.user?.username || 'User',
    email: local.user?.email || '',
    userId: local.user?._id,
  };
}
