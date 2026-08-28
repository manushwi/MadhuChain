import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set the handler that lets the app treat foreground notifications as alerts.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request push permission and register. Safe to call on login.
 * In Expo Go, a remote push token requires a physical device; on simulators
 * this resolves but returns no token — the app still works via in-app alerts.
 */
export async function setupPushNotifications(): Promise<void> {
  try {
    if (Platform.OS === 'web') return;

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }

    if (status === 'granted') {
      await Notifications.getExpoPushTokenAsync();
    }
  } catch {
    // Notifications are best-effort; in-app alerts still work without a token.
  }
}
