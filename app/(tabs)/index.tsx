import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import problems from '../../data/problems.json';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Flashcard from '../../components/Flashcard';
import { useTopic } from '../../context/TopicContext';

const PracticeScreen = () => {
  const { selectedTopic } = useTopic();
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [deckFinished, setDeckFinished] = useState(false);
  const swiperRef = useRef(null);

  useEffect(() => {
    const newProblems = selectedTopic === 'All'
      ? problems
      : problems.filter((p) => p.category === selectedTopic);
    setFilteredProblems(newProblems);
    setCardIndex(0);
    setDeckFinished(false);
    if (swiperRef.current) {
      swiperRef.current.jumpToCardIndex(0);
    }
  }, [selectedTopic]);

  const handleSwipedAll = () => {
    setDeckFinished(true);
  };

  const handleRestart = () => {
    setCardIndex(0);
    setDeckFinished(false);
    if (swiperRef.current) {
      swiperRef.current.jumpToCardIndex(0);
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
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={filteredProblems}
          renderCard={(card) => (
            <Flashcard
              key={card.id}
              title={card.title}
              description={card.description}
              solution={card.solution}
            />
          )}
          onSwiped={() => setCardIndex(cardIndex + 1)}
          onSwipedAll={handleSwipedAll}
          cardIndex={cardIndex}
          backgroundColor={'transparent'}
          stackSize={3}
          stackSeparation={15}
          animateCardOpacity
          verticalSwipe={false}
        />
      </View>
      <ThemedText style={styles.counter}>
        Card {cardIndex + 1} of {filteredProblems.length}
      </ThemedText>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, styles.incorrectButton]} onPress={() => swiperRef.current.swipeLeft()}>
          <ThemedText style={styles.buttonText}>Incorrect</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.correctButton]} onPress={() => swiperRef.current.swipeRight()}>
          <ThemedText style={styles.buttonText}>Correct</ThemedText>
        </TouchableOpacity>
      </View>
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
    marginTop: 50, // Add top margin to lower the cards
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
});

export default PracticeScreen;
