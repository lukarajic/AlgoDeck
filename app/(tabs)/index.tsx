
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import problems from '../../data/problems.json';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTopic } from '../../context/TopicContext';

const PracticeScreen = () => {
  const { selectedTopic } = useTopic();
  const [filteredProblems, setFilteredProblems] = useState(problems);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    if (selectedTopic === 'All') {
      setFilteredProblems(problems);
    } else {
      setFilteredProblems(problems.filter((p) => p.category === selectedTopic));
    }
    setCurrentProblemIndex(0);
  }, [selectedTopic]);

  const currentProblem = filteredProblems[currentProblemIndex];

  const handleNextProblem = () => {
    setShowSolution(false);
    setCurrentProblemIndex((prevIndex) => (prevIndex + 1) % filteredProblems.length);
  };

  const toggleSolution = () => {
    setShowSolution((prevShow) => !prevShow);
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
      <ThemedText style={styles.title}>{currentProblem.title}</ThemedText>
      <ThemedText style={styles.description}>{currentProblem.description}</ThemedText>
      <Button title={showSolution ? 'Hide Solution' : 'Show Solution'} onPress={toggleSolution} />
      {showSolution && <ThemedText style={styles.solution}>{currentProblem.solution}</ThemedText>}
      <Button title="Next Problem" onPress={handleNextProblem} />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  solution: {
    fontSize: 16,
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default PracticeScreen;
