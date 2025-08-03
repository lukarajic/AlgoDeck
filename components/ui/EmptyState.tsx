
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { IconSymbol } from './IconSymbol';

type EmptyStateProps = {
  icon: string;
  title: string;
  message: string;
  action?: {
    title: string;
    onPress: () => void;
  };
};

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <IconSymbol name={icon} size={60} />
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.message}>{message}</ThemedText>
        {action && <Button title={action.title} onPress={action.onPress} />}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
});
