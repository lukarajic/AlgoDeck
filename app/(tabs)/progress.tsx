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



interface TopicStatsEntry {
  correct: number;
  incorrect: number;
  total: number;
}

interface TopicStats {
  [topic: string]: TopicStatsEntry;
}

interface TopicStatsItem {
  topic: string;
  correct: number;
  incorrect: number;
  total: number;
  accuracy: number;
}

export default function ProgressScreen() {
  const { performanceData, currentStreak, resetPerformance } = usePerformance();

  const getTopicStats = () => {
    const topicStats: TopicStats = {};
    const problems = leetcodeProblemsData as LeetcodeProblem[];

    // Initialize stats for all topics to ensure they appear in the list
    const allTopics = new Set(problems.flatMap(p => p.topicTags || []));
    allTopics.forEach(topic => {
      topicStats[topic] = { correct: 0, incorrect: 0, total: 0 };
    });

    for (const problem of problems) {
      const problemId = problem.id;
      const performance = performanceData[problemId];
      const problemTopics = problem.topicTags || [];

      for (const topic of problemTopics) {
        if (performance) {
          topicStats[topic].correct += performance.correct;
          topicStats[topic].incorrect += performance.incorrect;
        }
        topicStats[topic].total++;
      }
    }

    return Object.entries(topicStats)
      .map(([topic, stats]) => ({
        topic,
        ...stats,
        accuracy: stats.correct + stats.incorrect > 0
            ? (stats.correct / (stats.correct + stats.incorrect)) * 100
            : 0,
      }))
      .filter(stats => stats.total > 0) // Only show topics that have problems
      .sort((a, b) => a.topic.localeCompare(b.topic));
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
          onPress: () => resetPerformance(),
          style: 'destructive',
        },
      ]
    );
  };

  const topicStats = getTopicStats();

  const renderItem = ({ item }: { item: TopicStatsItem }) => (
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