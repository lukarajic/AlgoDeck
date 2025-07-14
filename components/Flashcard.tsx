
import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import * as Haptics from 'expo-haptics';

interface FlashcardProps {
  title: string;
  description: string;
  solution: string;
  difficulty: string;
}

const Flashcard = ({ title, description, solution, difficulty }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const toValue = isFlipped ? 0 : 180;
    Animated.timing(flipAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const getDifficultyStyle = (level) => {
    switch (level) {
      case 'Easy':
        return styles.easyBadge;
      case 'Medium':
        return styles.mediumBadge;
      case 'Hard':
        return styles.hardBadge;
      default:
        return {};
    }
  };

  return (
    <TouchableOpacity onPress={flipCard} activeOpacity={1}>
      <View style={styles.cardContainer}>
        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.description}>{description}</ThemedText>
          <View style={[styles.badge, getDifficultyStyle(difficulty)]}>
            <ThemedText style={styles.badgeText}>{difficulty}</ThemedText>
          </View>
        </Animated.View>
        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <ThemedText style={styles.solution}>{solution}</ThemedText>
          <TouchableOpacity onPress={flipCard} style={styles.flipButton}>
            <ThemedText style={styles.flipButtonText}>View Problem</ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 320,
    height: 420,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  card: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardFront: {
    backgroundColor: '#fff',
  },
  cardBack: {
    backgroundColor: '#f8f8f8',
    position: 'absolute',
    top: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
  },
  badge: {
    marginTop: 15,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  easyBadge: {
    backgroundColor: '#4CAF50', // Green
  },
  mediumBadge: {
    backgroundColor: '#FFC107', // Amber
  },
  hardBadge: {
    backgroundColor: '#F44336', // Red
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  solution: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  flipButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 25,
  },
  flipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Flashcard;
