import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import Flashcard from '../../components/Flashcard';
import { usePerformance } from '../../context/PerformanceContext';
import { useTopic } from '../../context/TopicContext';
import problems from '../../data/problems.json';

const PracticeScreen = () => {
  const { selectedTopic, setSelectedTopic } = useTopic();
  const { performanceData } = usePerformance();
  const { updatePerformance } = usePerformance();
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [deckFinished, setDeckFinished] = useState(false);
  const swiperRef = useRef(null);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let newProblems = problems;

    if (selectedTopic !== 'All') {
      newProblems = newProblems.filter((p) => p.category === selectedTopic);
    }

    if (selectedDifficulties.length > 0) {
      newProblems = newProblems.filter((p) => selectedDifficulties.includes(p.difficulty));
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
  }, [selectedTopic, selectedDifficulties, searchQuery]);

  useEffect(() => {
    if (filteredProblems.length > 0 && cardIndex >= filteredProblems.length) {
      setDeckFinished(true);
    }
  }, [cardIndex, filteredProblems.length]);

  const handleAnswer = (isCorrect) => {
    if (cardIndex >= filteredProblems.length) {
      return;
    }
    const problemId = filteredProblems[cardIndex].id;
    updatePerformance(problemId, isCorrect);
    setCardIndex((prevIndex) => prevIndex + 1);
  };

  const handleRestart = () => {
    setCardIndex(0);
    setDeckFinished(false);
    if (swiperRef.current) {
      swiperRef.current.jumpToCardIndex(0);
    }
  };

  const findWeakestTopic = () => {
    const topicStats = {};
    for (const problem of problems) {
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
    let lowestAccuracy = 101; // Start with a value higher than 100

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

  const toggleDifficulty = (difficulty) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty) ? prev.filter((d) => d !== difficulty) : [...prev, difficulty]
    );
  };

  const handleClearFilters = () => {
    setSelectedTopic('All');
    setSelectedDifficulties([]);
    setSearchQuery('');
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
        style={styles.searchInput}
        placeholder="Search problems..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.difficultyContainer}>
        {['Easy', 'Medium', 'Hard'].map((difficulty) => (
          <TouchableOpacity
            key={difficulty}
            style={[
              styles.difficultyButton,
              selectedDifficulties.includes(difficulty) && styles.difficultyButtonSelected,
            ]}
            onPress={() => toggleDifficulty(difficulty)}
          >
            <ThemedText
              style={[
                styles.difficultyButtonText,
                selectedDifficulties.includes(difficulty) && styles.difficultyButtonTextSelected,
              ]}
            >
              {difficulty}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
      <ThemedText style={styles.topicText}>Topic: {selectedTopic}</ThemedText>
      {filteredProblems.length === 0 ? (
        <ThemedView style={styles.noProblemsContainer}>
          <ThemedText style={styles.noProblemsText}>
            No problems found for this topic and difficulty.
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
            key={`${selectedTopic}-${selectedDifficulties.join('-')}`}
          />
        </View>
      )}
      <ThemedText style={styles.counter}>
        Card {Math.min(cardIndex + 1, filteredProblems.length)} of {filteredProblems.length}
      </ThemedText>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.incorrectButton]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            swiperRef.current.swipeLeft();
          }}
        >
          <ThemedText style={styles.buttonText}>Incorrect</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.correctButton]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            swiperRef.current.swipeRight();
          }}
        >
          <ThemedText style={styles.buttonText}>Correct</ThemedText>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.weakestButton} onPress={handlePracticeWeakest}>
        <ThemedText style={styles.buttonText}>Practice Weakest Topic</ThemedText>
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
    marginTop: 130, // Adjusted for search bar and difficulty filters
    alignItems: 'center',
  },
  topicText: {
    fontSize: 22,
    fontWeight: 'bold',
    position: 'absolute',
    top: 140, // Adjusted to be below difficulty filters
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
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    zIndex: 200, // Ensure it's above other elements
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    top: 90, // Adjusted to be below the search bar
  },
  difficultyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginHorizontal: 5,
  },
  difficultyButtonSelected: {
    backgroundColor: '#007AFF',
  },
  difficultyButtonText: {
    color: '#007AFF',
    fontSize: 14,
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
});

export default PracticeScreen;
