import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import problems from '../../data/problems.json';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Flashcard from '../../components/Flashcard';
import { useTopic } from '../../context/TopicContext';
import { usePerformance } from '../../context/PerformanceContext';

const PracticeScreen = () => {
  const { selectedTopic, setSelectedTopic } = useTopic();
  const { performanceData } = usePerformance();
  const { updatePerformance } = usePerformance();
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [deckFinished, setDeckFinished] = useState(false);
  const swiperRef = useRef(null);

  useEffect(() => {
    const newProblems =
      selectedTopic === 'All'
        ? problems
        : problems.filter((p) => p.category === selectedTopic);
    setFilteredProblems(newProblems);
    setCardIndex(0);
    setDeckFinished(false);
    if (swiperRef.current) {
      swiperRef.current.jumpToCardIndex(0);
    }
  }, [selectedTopic]);

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
    }
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

  if (filteredProblems.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No problems found for this topic.</ThemedText>
        <TouchableOpacity style={styles.weakestButton} onPress={handlePracticeWeakest}>
          <ThemedText style={styles.buttonText}>Practice Weakest Topic</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
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
          key={selectedTopic}
        />
      </View>
      <ThemedText style={styles.counter}>
        Card {Math.min(cardIndex + 1, filteredProblems.length)} of {filteredProblems.length}
      </ThemedText>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.incorrectButton]}
          onPress={() => handleAnswer(false)}
        >
          <ThemedText style={styles.buttonText}>Incorrect</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.correctButton]}
          onPress={() => handleAnswer(true)}
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
    marginTop: 50,
    alignItems: 'center',
  },
  counter: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    position: 'absolute',
    top: 40,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    position: 'absolute',
    bottom: 100,
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
    bottom: 160,
    backgroundColor: '#FF9500',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
});

export default PracticeScreen;