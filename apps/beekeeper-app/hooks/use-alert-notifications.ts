import { isRunningInExpoGo } from 'expo';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import type { Alert } from '@/lib/types';
import { useAlerts } from '@/hooks/use-queries';

// Same guard as lib/notifications.ts: never import 'expo-notifications' in
// Expo Go (module-load side effect triggers a redbox on Android Expo Go).
// Local notification alerts therefore only turn up in a dev/production build
// (`bunx expo run:android` or EAS); in Expo Go this hook is a silent no-op.
let ready = false;

async function prepare(): Promise<boolean> {
  if (Platform.OS === 'web' || isRunningInExpoGo()) return false;
  try {
    const Notifications = await import('expo-notifications');
    if (!ready) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      ready = true;
    }
    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Fires a local notification when a NEW unacknowledged alert shows up.
 * Existing alerts on first load are swallowed so we don't spam on startup.
 */
export function useAlertNotifications(): void {
  const { data: alerts } = useAlerts();
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!alerts || alerts.length === 0) return;
    const prev = seen.current;
    if (prev === null) {
      seen.current = new Set(alerts.filter((a) => !a.acknowledged).map((a) => a.id));
      return;
    }

    const fresh = alerts.filter((a) => !a.acknowledged && !prev.has(a.id));
    if (fresh.length === 0) return;

    seen.current = new Set([...prev, ...fresh.map((a) => a.id)]);

    const latest = fresh[0];
    void notify(latest);
  }, [alerts]);
}

async function notify(alert: Alert): Promise<void> {
  const granted = await prepare();
  if (!granted) return;
  try {
    const Notifications = await import('expo-notifications');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Alert: ${alert.type.replace(/_/g, ' ')}`,
        body: alert.message,
        sound: 'default',
        data: { alertId: alert.id },
      },
      trigger: null,
    });
  } catch {
    // best-effort; in-app alerts still work
  }
}