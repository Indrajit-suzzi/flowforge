import { useUser } from '@clerk/clerk-react';

export function useRole() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role || 'member';
  const isAdmin = role === 'admin';

  return { role, isAdmin };
}
