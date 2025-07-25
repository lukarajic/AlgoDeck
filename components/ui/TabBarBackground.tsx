import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';

export default function TabBarBackground() {
  return (
    <ThemedView
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}