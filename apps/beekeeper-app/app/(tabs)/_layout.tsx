import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { themeTabBar } from '@/constants/tab-theme';
import { useAlertNotifications } from '@/hooks/use-alert-notifications';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function tabIcon(name: IconName) {
  return function TabIcon({ color }: { color: string }) {
    return <MaterialCommunityIcons name={name} size={26} color={color} style={{ marginBottom: -3 }} />;
  };
}

export default function TabLayout() {
  const scheme = useColorScheme() ?? 'light';
  const t = themeTabBar[scheme];
  useAlertNotifications();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: t.active,
        tabBarInactiveTintColor: t.inactive,
        tabBarStyle: { backgroundColor: t.background, borderTopColor: t.border },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home-variant-outline') }} />
      <Tabs.Screen name="hives" options={{ title: 'Hives', tabBarIcon: tabIcon('hexagon-multiple-outline') }} />
      <Tabs.Screen name="harvest/index" options={{ title: 'Batches', tabBarIcon: tabIcon('package-variant-closed') }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alerts', tabBarIcon: tabIcon('bell-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('account-outline') }} />
    </Tabs>
  );
}
