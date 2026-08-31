'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AutoRefresh({ interval = 5000 }: { interval?: number }) {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const refresh = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };
    const syncTimer = () => {
      if (timer) clearInterval(timer);
      timer = document.visibilityState === 'visible' ? setInterval(refresh, interval) : undefined;
    };
    const onFocus = () => {
      refresh();
      syncTimer();
    };
    syncTimer();
    document.addEventListener('visibilitychange', syncTimer);
    window.addEventListener('focus', onFocus);
    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', syncTimer);
      window.removeEventListener('focus', onFocus);
    };
  }, [interval, router]);

  return null;
}
