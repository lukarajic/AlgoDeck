import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useFavorites } from '@/context/FavoritesContext';
import { useTheme } from '@/context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Alert, Animated, Pressable, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import Flashcard from '../../components/Flashcard';
import { usePerformance } from '../../context/PerformanceContext';
import { useTopic } from '../../context/TopicContext';
import { useProblemOfTheDay } from '../../context/ProblemOfTheDayContext';
import leetcodeProblemsData from '../../data/leetcode_problems.json';

interface LeetcodeProblem {
  id: number;
  slug: string;
  title: string;
  difficulty: string;
  content: string;
  topicTags: string[];
  solution: string;
}

interface Problem {
  id: number;
  title: string;
  description: string;
  solution: string;
  category: string;
  difficulty: string;
}

const mappedProblems: Problem[] = leetcodeProblemsData.map((p: LeetcodeProblem) => ({
  id: p.id,
  title: p.title,
  description: p.content,
  solution: p.solution,
  category: p.topicTags && p.topicTags.length > 0 ? p.topicTags[0] : 'Unknown',
  difficulty: p.difficulty,
}));

const PracticeScreen = () => {
  const { selectedTopic, setSelectedTopic } = useTopic();
  const { performanceData, updatePerformance, getReviewProblems } = usePerformance();
  const { favorites } = useFavorites();
  const { problemOfTheDay, markAsCompleted } = useProblemOfTheDay();
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [deckFinished, setDeckFinished] = useState(false);
  const swiperRef = useRef(null);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const params = useLocalSearchParams();
  const router = useRouter();
  const favoritesOnly = params.favoritesOnly === 'true';
  const reviewMode = params.reviewMode === 'true';
  const isProblemOfTheDayMode = params.potdMode === 'true';
  const { colorScheme } = useTheme();
  const scaleAnimIncorrect = useRef(new Animated.Value(1)).current;
  const scaleAnimCorrect = useRef(new Animated.Value(1)).current;
  const difficultyAnims = {
    Easy: useRef(new Animated.Value(1)).current,
    Medium: useRef(new Animated.Value(1)).current,
    Hard: useRef(new Animated.Value(1)).current,
  };

  useEffect(() => {
    let newProblems = mappedProblems;

    if (isProblemOfTheDayMode) {
        newProblems = problemOfTheDay ? [problemOfTheDay] : [];
    } else if (reviewMode) {
      const reviewProblemIds = getReviewProblems();
      newProblems = newProblems.filter(p => reviewProblemIds.includes(p.id.toString()));
    } else if (favoritesOnly) {
      newProblems = newProblems.filter((p) => favorites.includes(p.id));
    } else {
      if (selectedTopic !== 'All') {
        newProblems = newProblems.filter((p) => p.category === selectedTopic);
      }

      if (selectedDifficulties.length > 0) {
        newProblems = newProblems.filter((p) => selectedDifficulties.includes(p.difficulty));
      }
    }

    if (searchQuery) {
      newProblems = newProblems.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProblems(newProblems);
    setCardIndex(0);
    setDeckFinished(false);
    if (swiperRef.current) {
      swiperRef.current.jumpToCardIndex(0);
    }
  }, [selectedTopic, selectedDifficulties, searchQuery, favoritesOnly, reviewMode, isProblemOfTheDayMode, problemOfTheDay, favorites, getReviewProblems]);

  useEffect(() => {
    if (params.problemId) {
      const newIndex = filteredProblems.findIndex((p) => p.id === parseInt(params.problemId as string, 10));
      if (newIndex !== -1) {
        setCardIndex(newIndex);
        if (swiperRef.current) {
          swiperRef.current.jumpToCardIndex(newIndex);
        }
      }
    }
  }, [params.problemId, filteredProblems]);

  useEffect(() => {
    if (filteredProblems.length > 0 && cardIndex >= filteredProblems.length) {
      setDeckFinished(true);
    }
  }, [cardIndex, filteredProblems.length]);

  const handleAnswer = (isCorrect: boolean) => {
    if (cardIndex >= filteredProblems.length) {
      return;
    }
    if (isProblemOfTheDayMode) {
        markAsCompleted();
    }
    const problemId = filteredProblems[cardIndex].id;
    updatePerformance(problemId, isCorrect);
    setCardIndex((prevIndex) => prevIndex + 1);
  };

  const handleRestart = () => {
    if (isProblemOfTheDayMode) {
        router.replace('/(tabs)/');
    }
    setCardIndex(0);
    setDeckFinished(false);
    if (swiperRef.current) {
      swiperRef.current.jumpToCardIndex(0);
    }
  };

  const findWeakestTopic = () => {
    const topicStats: { [key: string]: { correct: number; incorrect: number; total: number } } = {};
    for (const problem of mappedProblems) {
      const category = problem.category;
      if (!topicStats[category]) {
        topicStats[category] = { correct: 0, incorrect: 0, total: 0 };
      }
      const problemPerformance = performanceData[problem.id];
      if (problemPerformance) {
        topicStats[category].correct += problemPerformance.correct;
        topicStats[category].incorrect += problemPerformance.incorrect;
      }
      topicStats[category].total++;
    }

    let weakestTopic = null;
    let lowestAccuracy = 101;

    for (const topic in topicStats) {
      const stats = topicStats[topic];
      const totalAnswered = stats.correct + stats.incorrect;
      if (totalAnswered > 0) {
        const accuracy = (stats.correct / totalAnswered) * 100;
        if (accuracy < lowestAccuracy) {
          lowestAccuracy = accuracy;
          weakestTopic = topic;
        }
      }
    }
    return weakestTopic;
  };

  const handlePracticeWeakest = () => {
    const weakestTopic = findWeakestTopic();
    if (weakestTopic) {
      setSelectedTopic(weakestTopic);
      Alert.alert('Topic Switched', `Now practicing: ${weakestTopic}`);
    } else {
      Alert.alert('No Weakest Topic Found', 'Keep practicing to identify areas for improvement!');
    }
  };

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty) ? prev.filter((d) => d !== difficulty) : [...prev, difficulty]
    );
  };

  const handleClearFilters = () => {
    setSelectedTopic('All');
    setSelectedDifficulties([]);
    setSearchQuery('');
  };

  const handlePressIn = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  if (deckFinished) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.deckCompleteText}>Deck Complete!</ThemedText>
        <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
          <ThemedText style={styles.buttonText}>Practice Again</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <TextInput
        style={[
          styles.searchInput,
          { 
            backgroundColor: Colors[colorScheme].background,
            borderColor: Colors[colorScheme].icon,
            color: Colors[colorScheme].text, // Set text color based on theme
          },
        ]}
        placeholder="Search problems..."
        placeholderTextColor={Colors[colorScheme].icon}
        value={searchQuery}
        onChangeText={setSearchQuery}
        editable={!favoritesOnly && !reviewMode}
      />
      <View style={styles.difficultyContainer}>
        {['Easy', 'Medium', 'Hard'].map((difficulty) => (
          <Pressable
            key={difficulty}
            onPressIn={() => handlePressIn(difficultyAnims[difficulty])}
            onPressOut={() => handlePressOut(difficultyAnims[difficulty])}
            onPress={() => toggleDifficulty(difficulty)}
            disabled={favoritesOnly || reviewMode}
          >
            <Animated.View
              style={[
                styles.difficultyButton,
                selectedDifficulties.includes(difficulty) && styles.difficultyButtonSelected,
                (favoritesOnly || reviewMode) && styles.disabledButton,
                { transform: [{ scale: difficultyAnims[difficulty] }] },
              ]}
            >
              <ThemedText
                style={[
                  styles.difficultyButtonText,
                  selectedDifficulties.includes(difficulty) && styles.difficultyButtonTextSelected,
                  (favoritesOnly || reviewMode) && styles.disabledButtonText,
                ]}
              >
                {difficulty}
              </ThemedText>
            </Animated.View>
          </Pressable>
        ))}
      </View>
      <ThemedText style={styles.topicText}>
        {isProblemOfTheDayMode ? 'Problem of the Day' : reviewMode ? 'Reviewing Due Cards' : favoritesOnly ? 'Favorites' : `Topic: ${selectedTopic}`}
      </ThemedText>
      {filteredProblems.length === 0 ? (
        <ThemedView style={styles.noProblemsContainer}>
          <ThemedText style={styles.noProblemsText}>
            {reviewMode ? 'No problems due for review today!' : 'No problems found for this topic and difficulty.'}
          </ThemedText>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
            <ThemedText style={styles.clearButtonText}>Clear Filters</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <View style={styles.swiperContainer}>
          <Swiper
            ref={swiperRef}
            cards={filteredProblems}
            renderCard={(card) =>
              card ? (
                <Flashcard
                  key={card.id}
                  problemId={card.id}
                  title={card.title}
                  description={card.description}
                  solution={card.solution}
                  difficulty={card.difficulty}
                />
              ) : null
            }
            onSwipedLeft={() => handleAnswer(false)}
            onSwipedRight={() => handleAnswer(true)}
            onSwipedAll={() => setDeckFinished(true)}
            cardIndex={cardIndex}
            backgroundColor={'transparent'}
            stackSize={3}
            stackSeparation={15}
            animateCardOpacity
            verticalSwipe={false}
            key={`${selectedTopic}-${selectedDifficulties.join('-')}-${favoritesOnly}-${favorites.length}-${reviewMode}-${isProblemOfTheDayMode}`}
          />
        </View>
      )}
      <ThemedText style={styles.counter}>
        Card {Math.min(cardIndex + 1, filteredProblems.length)} of {filteredProblems.length}
      </ThemedText>
      <View style={styles.buttonsContainer}>
        <Pressable
          onPressIn={() => handlePressIn(scaleAnimIncorrect)}
          onPressOut={() => handlePressOut(scaleAnimIncorrect)}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            swiperRef.current?.swipeLeft();
          }}
        >
          <Animated.View style={[styles.button, styles.incorrectButton, { transform: [{ scale: scaleAnimIncorrect }] }]}>
            <ThemedText style={styles.buttonText}>Incorrect</ThemedText>
          </Animated.View>
        </Pressable>
        <Pressable
          onPressIn={() => handlePressIn(scaleAnimCorrect)}
          onPressOut={() => handlePressOut(scaleAnimCorrect)}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            swiperRef.current?.swipeRight();
          }}
        >
          <Animated.View style={[styles.button, styles.correctButton, { transform: [{ scale: scaleAnimCorrect }] }]}>
            <ThemedText style={styles.buttonText}>Correct</ThemedText>
          </Animated.View>
        </Pressable>
      </View>
      <TouchableOpacity
        style={[styles.weakestButton, (favoritesOnly || reviewMode) && styles.disabledButton]}
        onPress={handlePracticeWeakest}
        disabled={favoritesOnly || reviewMode}
      >
        <ThemedText style={[styles.buttonText, (favoritesOnly || reviewMode) && styles.disabledButtonText]}>
          Practice Weakest Topic
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  swiperContainer: {
    flex: 1,
    width: '100%',
    marginTop: 100,
    alignItems: 'center',
  },
  topicText: {
    fontSize: 22,
    fontWeight: 'bold',
    position: 'absolute',
    top: 140,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    position: 'absolute',
    bottom: 150,
    zIndex: 100,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctButton: {
    backgroundColor: '#4CAF50',
  },
  incorrectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deckCompleteText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  restartButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  weakestButton: {
    position: 'absolute',
    bottom: 90,
    backgroundColor: '#FF9500',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    zIndex: 100,
  },
  searchInput: {
    position: 'absolute',
    top: 40,
    width: '90%',
    height: 40,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    zIndex: 200,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    top: 90,
  },
  difficultyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  difficultyButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#0056b3',
  },
  difficultyButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  difficultyButtonTextSelected: {
    color: '#fff',
  },
  noProblemsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noProblemsText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  clearButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  counter: {
    position: 'absolute',
    bottom: 220,
    fontSize: 16,
    color: '#666',
  },
  disabledButton: {
    backgroundColor: '#a9a9a9',
    borderColor: '#999',
  },
  disabledButtonText: {
    color: '#d3d3d3',
  },
});

export default PracticeScreen;