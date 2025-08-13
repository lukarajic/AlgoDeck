import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { usePerformance } from '../../context/PerformanceContext';
import leetcodeProblemsData from '../../data/leetcode_problems.json';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ProgressBar from '../../components/ui/ProgressBar';

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

export default function ProgressScreen() {
  const { performanceData, updatePerformance, currentStreak } = usePerformance();

  const getTopicStats = () => {
    const topicStats = {};

    for (const problem of mappedProblems) {
      const problemId = problem.id;
      const category = problem.category;
      const performance = performanceData[problemId];

      if (!topicStats[category]) {
        topicStats[category] = { correct: 0, incorrect: 0, total: 0 };
      }

      if (performance) {
        topicStats[category].correct += performance.correct;
        topicStats[category].incorrect += performance.incorrect;
      }
      topicStats[category].total++;
    }

    return Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      ...stats,
      accuracy: stats.correct > 0 ? (stats.correct / (stats.correct + stats.incorrect)) * 100 : 0,
    }));
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to delete all your progress? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: () => updatePerformance(null, null, true), // Special call to reset all data
          style: 'destructive',
        },
      ]
    );
  };

  const topicStats = getTopicStats();

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <ThemedText style={styles.topicName}>{item.topic}</ThemedText>
      <ThemedText>Correct: {item.correct}</ThemedText>
      <ThemedText>Incorrect: {item.incorrect}</ThemedText>
      <ProgressBar progress={item.accuracy} />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Your Progress</ThemedText>
      <ThemedText style={styles.streakText}>Current Streak: {currentStreak} days</ThemedText>
      <FlatList
        data={topicStats}
        renderItem={renderItem}
        keyExtractor={(item) => item.topic}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <TouchableOpacity style={styles.resetButton} onPress={handleResetProgress}>
            <ThemedText style={styles.resetButtonText}>Reset Progress</ThemedText>
          </TouchableOpacity>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50, // Keep padding for the title
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  streakText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 120, // Ensure there is space for the button and tab bar
  },
  itemContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  topicName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resetButton: {
    backgroundColor: '#F44336',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
