import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface ProgressBarProps {
  progress: number;
  color?: string;
}

const ProgressBar = ({ progress, color = '#4CAF50' }: ProgressBarProps) => {
  return (
    <View style={styles.container}>
      <View style={[styles.bar, { width: `${progress}%`, backgroundColor: color }]} />
      <ThemedText style={styles.progressText}>{`${progress.toFixed(2)}%`}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 20,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 5,
  },
  bar: {
    height: '100%',
    borderRadius: 10,
  },
  progressText: {
    position: 'absolute',
    alignSelf: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProgressBar;