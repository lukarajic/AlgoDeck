import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import problems from '../../data/problems.json';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Flashcard from '../../components/Flashcard';
import { useTopic } from '../../context/TopicContext';

const PracticeScreen = () => {
  const { selectedTopic } = useTopic();
  const [filteredProblems, setFilteredProblems] = useState(problems);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);

  useEffect(() => {
    const newProblems = selectedTopic === 'All'
      ? problems
      : problems.filter((p) => p.category === selectedTopic);
    setFilteredProblems(newProblems);
    setCurrentProblemIndex(0);
  }, [selectedTopic]);

  const currentProblem = filteredProblems[currentProblemIndex];

  const handleNextProblem = () => {
    setCurrentProblemIndex((prevIndex) => (prevIndex + 1) % filteredProblems.length);
  };

  if (!currentProblem) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No problems found for this topic.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Flashcard
        key={currentProblem.id}
        title={currentProblem.title}
        description={currentProblem.description}
        solution={currentProblem.solution}
      />
      <View style={styles.buttonContainer}>
        <Button title="Next Problem" onPress={handleNextProblem} />
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
  buttonContainer: {
    marginTop: 20,
  }
});

export default PracticeScreen;