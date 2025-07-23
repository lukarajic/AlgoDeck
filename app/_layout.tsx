import { FavoritesProvider } from '@/context/FavoritesContext';
import { PerformanceProvider } from '@/context/PerformanceContext';
import { TopicProvider } from '@/context/TopicContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import SplashScreen from '@/components/SplashScreen';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFirstTime } from '@/hooks/useFirstTime';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { isFirstTime, setOnboardingComplete } = useFirstTime();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!loaded || isFirstTime === null) {
      return;
    }

    const inTabsGroup = segments[0] === '(tabs)';

    if (isFirstTime && !inTabsGroup) {
      router.replace('/(onboarding)');
    } else if (!isFirstTime && !inTabsGroup) {
      router.replace('/(tabs)');
    }
  }, [loaded, isFirstTime, segments, router]);

  if (!loaded || isFirstTime === null) {
    return <SplashScreen />;
  }

  return (
    <FavoritesProvider>
      <PerformanceProvider>
        <TopicProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </TopicProvider>
      </PerformanceProvider>
    </FavoritesProvider>
  );
}
