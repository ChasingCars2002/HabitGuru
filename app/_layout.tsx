import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '@/constants';
import { useFirebaseSync } from '@/hooks/useFirebaseSync';
import { initializeAds } from '@/lib/ads';
import { initializePurchases, identifyUser } from '@/lib/purchases';
import { useAuthStore } from '@/store/authStore';

SplashScreen.preventAutoHideAsync();

// Boots all async services without blocking the render tree
function ServicesBoot() {
  useFirebaseSync();

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    initializeAds();
    initializePurchases();
  }, []);

  // Identify the RevenueCat user whenever Firebase auth resolves
  useEffect(() => {
    if (user?.uid) {
      identifyUser(user.uid);
    }
  }, [user?.uid]);

  return null;
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <ServicesBoot />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(modals)/add-habit"
          options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }}
        />
        <Stack.Screen
          name="(modals)/habit-detail"
          options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }}
        />
        <Stack.Screen
          name="(modals)/auth"
          options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }}
        />
        <Stack.Screen
          name="(modals)/paywall"
          options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
