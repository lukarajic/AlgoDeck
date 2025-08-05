import { ThemedText } from '@/components/ThemedText';
import { useFavorites } from '@/context/FavoritesContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

interface FlashcardProps {
  problemId: number;
  title: string;
  description: string;
  solution: string;
  difficulty: string;
  hint?: string;
}

const Flashcard = ({ problemId, title, description, solution, difficulty, hint }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colorScheme } = useTheme();
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const handleToggleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(problemId);
  };

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

  const getDifficultyStyle = (level: string) => {
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

  const cardBackgroundColor = colorScheme === 'light' ? ['#ffffff', '#f0f0f0'] : ['#2c2c2c', '#1a1a1a'];

  return (
    <View style={styles.cardContainer}>
      <Pressable onPress={flipCard}>
        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
          <LinearGradient colors={cardBackgroundColor} style={styles.gradient}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <ThemedText style={styles.description}>{description}</ThemedText>
            <View style={[styles.badge, getDifficultyStyle(difficulty)]}>
              <ThemedText style={styles.badgeText}>{difficulty}</ThemedText>
            </View>
          </LinearGradient>
        </Animated.View>
        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <LinearGradient colors={cardBackgroundColor} style={styles.gradient}>
            <ThemedText style={styles.solution}>{solution}</ThemedText>
            <Pressable onPress={flipCard} style={styles.flipButton}>
              <ThemedText style={styles.flipButtonText}>View Problem</ThemedText>
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </Pressable>
      <Pressable onPress={handleToggleFavorite} style={styles.favoriteButton}>
        <Ionicons
          name={isFavorite(problemId) ? 'star' : 'star-outline'}
          size={28}
          color={isFavorite(problemId) ? '#FFD700' : '#ccc'}
        />
      </Pressable>
      {hint && !isFlipped && (
        <View style={styles.hintContainer}>
          {showHint ? (
            <ThemedText style={styles.hintText}>{hint}</ThemedText>
          ) : (
            <Pressable onPress={() => setShowHint(true)} style={styles.hintButton}>
              <ThemedText style={styles.hintButtonText}>Show Hint</ThemedText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 320,
    height: 420,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  card: {
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardFront: {},
  cardBack: {
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
  hintContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 200,
  },
  hintButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
  },
  hintButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hintText: {
    marginTop: 10,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
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
  favoriteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 100, // Ensure it's on top
    padding: 10, // Increase touchable area
  },
});

export default Flashcard;
