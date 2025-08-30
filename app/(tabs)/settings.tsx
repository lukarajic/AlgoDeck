import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';

export default function SettingsScreen() {
  const { theme, setTheme, colorScheme } = useTheme();

  const themes: { name: string; value: 'light' | 'dark' | 'system' }[] = [
    { name: 'Light', value: 'light' },
    { name: 'Dark', value: 'dark' },
    { name: 'System', value: 'system' },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Appearance</ThemedText>
      <ThemedText style={styles.subtitle}>
        Select your preferred theme.
      </ThemedText>
      <View style={styles.optionsContainer}>
        {themes.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={[
              styles.option,
              {
                backgroundColor: colorScheme === 'light' ? Colors.light.background : Colors.dark.background,
                borderColor: theme === t.value ? Colors.light.tint : (colorScheme === 'light' ? '#E5E7EB' : '#374151'),
              },
            ]}
            onPress={() => setTheme(t.value)}
          >
            <ThemedText
              style={[
                styles.optionText,
                { color: theme === t.value ? Colors.light.tint : Colors[colorScheme].text },
              ]}
            >
              {t.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  optionsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  option: {
    padding: 16,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
