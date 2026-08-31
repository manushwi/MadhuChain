import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Minimal data-fetch hook: in-flight state, error surface, focus/pull-to-refresh
// friendly refetch, and an optional AsyncStorage cache so the dashboard opens
// instantly even when the LAN backend is briefly unreachable (F13/F14 style).
export function useRemote<T>(fetcher: () => Promise<T>, cacheKey?: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const refetch = useCallback(() => setTick((v) => v + 1), []);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      if (cacheKey) {
        try {
          const cached = await AsyncStorage.getItem(cacheKey);
          if (cached && alive) setData(JSON.parse(cached));
        } catch {
          // ignore corrupt cache
        }
      }
      try {
        const d = await fetcherRef.current();
        if (!alive) return;
        setData(d);
        if (cacheKey) {
          await AsyncStorage.setItem(cacheKey, JSON.stringify(d)).catch(() => undefined);
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [tick, cacheKey]);

  return { data, error, loading, refetch, setData };
}