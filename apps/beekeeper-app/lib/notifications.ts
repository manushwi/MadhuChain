import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

// IMPORTANT: never import 'expo-notifications' in Expo Go. Importing the module
// triggers a module-load side effect that registers a global push-token
// listener, and on Android Expo Go (SDK 53+) that calls console.error
// ("Push notifications were removed from Expo Go …") which Metro turns into a
// redbox. So we guard Expo Go here and only load the module lazily in real
// (dev/production) builds where remote push actually works.
let handlerRegistered = false;

/**
 * Request push permission and register. Safe to call on login.
 * No-op on web and in Expo Go; in-app alerts still work either way.
 */
export async function setupPushNotifications(): Promise<void> {
  if (Platform.OS === 'web' || isRunningInExpoGo()) return;

  try {
    const Notifications = await import('expo-notifications');

    // Set the handler that lets the app treat foreground notifications as alerts.
    if (!handlerRegistered) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      handlerRegistered = true;
    }

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