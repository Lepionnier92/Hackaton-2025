import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)' as any;
    const inAdminGroup = segments[0] === '(admin)' as any;

    if (!isAuthenticated && !inAuthGroup) {
      // Rediriger vers login si non authentifié
      router.replace('/(auth)/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      // Rediriger selon le rôle après connexion
      if (user?.role === 'admin') {
        router.replace('/(admin)/admin' as any);
      } else {
        router.replace('/(tabs)' as any);
      }
    }
  }, [isAuthenticated, isLoading, segments, user]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="mission/[id]" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
