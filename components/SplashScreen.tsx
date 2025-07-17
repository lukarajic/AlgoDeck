import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

export default function SplashScreen() {
  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
