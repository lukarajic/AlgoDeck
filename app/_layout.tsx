import { FavoritesProvider } from '@/context/FavoritesContext';
import { PerformanceProvider } from '@/context/PerformanceContext';
import { TopicProvider } from '@/context/TopicContext';
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import SplashScreen from '@/components/SplashScreen';
import { useFirstTime } from '@/hooks/useFirstTime';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

function RootLayoutNav() {
  const { colorScheme, theme } = useTheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { isFirstTime } = useFirstTime();
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
    <NavThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <FavoritesProvider>
      <PerformanceProvider>
        <TopicProvider>
          <ThemeProvider>
            <RootLayoutNav />
          </ThemeProvider>
        </TopicProvider>
      </PerformanceProvider>
    </FavoritesProvider>
  );
}
