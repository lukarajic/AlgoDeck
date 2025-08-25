import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFirstTime } from '@/hooks/useFirstTime';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Button, FlatList, StyleSheet, View, useWindowDimensions, ViewToken } from 'react-native';

const onboardingSteps = [
  {
    key: '1',
    title: 'Welcome to AlgoDeck!',
    description: 'Your personal LeetCode flashcard trainer.',
  },
  {
    key: '2',
    title: 'Practice with Flashcards',
    description: 'Swipe right if you know the answer, left if you don\'t.',
  },
  {
    key: '3',
    title: 'Filter by Topic & Difficulty',
    description: 'Focus your practice on specific areas.',
  },
  {
    key: '4',
    title: 'Track Your Progress',
    description: 'Identify your strengths and weaknesses.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboardingComplete } = useFirstTime();
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleComplete = () => {
    setOnboardingComplete();
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (currentIndex < onboardingSteps.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      if (viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  }).current;

  return (
    <ThemedView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={onboardingSteps}
        renderItem={({ item }) => (
          <View style={[styles.stepContainer, { width }]}>
            <ThemedText style={styles.title}>{item.title}</ThemedText>
            <ThemedText style={styles.description}>{item.description}</ThemedText>
          </View>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
      />
      <View style={styles.paginationContainer}>
        {onboardingSteps.map((_, index) => (
          <View
            key={index}
            style={[styles.paginationDot, currentIndex === index && styles.paginationDotActive]}
          />
        ))}
      </View>
      <View style={styles.footer}>
        {currentIndex === onboardingSteps.length - 1 ? (
          <Button title="Get Started" onPress={handleComplete} />
        ) : (
          <Button title="Next" onPress={handleNext} />
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 100,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#007AFF',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
});
