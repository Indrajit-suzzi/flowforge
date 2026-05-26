import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';

export function useEntryLock(slug, entryId, userId, userName) {
  const [lock, setLock] = useState(null);
  const [acquiring, setAcquiring] = useState(false);
  const heartbeatRef = useRef(null);

  const checkLock = useCallback(async () => {
    if (!slug || !entryId) return;
    try {
      const { data } = await api.get(`/api/v1/locks/${slug}/${entryId}`);
      setLock(data);
      return data;
    } catch {
      setLock({ locked: false });
    }
  }, [slug, entryId]);

  const startHeartbeat = () => {
    stopHeartbeat();
    heartbeatRef.current = setInterval(async () => {
      try {
        await api.post(`/api/v1/locks/${slug}/${entryId}/heartbeat`, { userId });
      } catch {
        stopHeartbeat();
      }
    }, 4 * 60 * 1000);
  };

  const stopHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  const acquireLock = useCallback(async () => {
    if (!slug || !entryId || !userId) return null;
    setAcquiring(true);
    try {
      const { data } = await api.post(`/api/v1/locks/${slug}/${entryId}/acquire`, { userId, userName });
      setLock(data);
      if (data.acquired) startHeartbeat();
      return data;
    } catch (err) {
      if (err.response?.data) setLock(err.response.data);
      return null;
    } finally {
      setAcquiring(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, entryId, userId, userName]);

  const releaseLock = useCallback(async () => {
    if (!slug || !entryId || !userId) return;
    stopHeartbeat();
    try {
      await api.delete(`/api/v1/locks/${slug}/${entryId}/release`, { data: { userId } });
    } catch { /* ignore */ }
    setLock({ locked: false });
  }, [slug, entryId, userId]);

  useEffect(() => {
    return () => {
      stopHeartbeat();
      if (slug && entryId && userId) {
        const baseUrl = import.meta.env.VITE_API_URL || '';
        navigator.sendBeacon(`${baseUrl}/api/v1/locks/${slug}/${entryId}/release?userId=${encodeURIComponent(userId)}`, '');
      }
    };
  }, [slug, entryId, userId]);

  return { lock, acquiring, checkLock, acquireLock, releaseLock };
}
