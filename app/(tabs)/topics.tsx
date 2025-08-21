import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import leetcodeProblemsData from '../../data/leetcode_problems.json';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTopic } from '../../context/TopicContext';
import { usePerformance } from '../../context/PerformanceContext';

const TopicsScreen = () => {
  const { setSelectedTopic } = useTopic();
  const { performanceData } = usePerformance();
  const router = useRouter();

  const allTags = leetcodeProblemsData.flatMap(p => p.topicTags || []);
  const topics = ['All', ...new Set(allTags)];

  const getTopicStats = (topic) => {
    const topicProblems = leetcodeProblemsData.filter(p => p.topicTags && p.topicTags.includes(topic));
    const stats = { correct: 0, incorrect: 0 };

    for (const problem of topicProblems) {
      const problemPerformance = performanceData[problem.id];
      if (problemPerformance) {
        stats.correct += problemPerformance.correct;
        stats.incorrect += problemPerformance.incorrect;
      }
    }
    return stats;
  };

  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    router.push('/');
  };

  const renderTopicItem = ({ item }) => {
    if (item === 'All') {
      return (
        <TouchableOpacity onPress={() => handleSelectTopic(item)}>
          <View style={styles.topicItem}>
            <ThemedText>{item}</ThemedText>
          </View>
        </TouchableOpacity>
      );
    }

    const stats = getTopicStats(item);
    const total = stats.correct + stats.incorrect;
    const accuracy = total > 0 ? (stats.correct / total) * 100 : -1; // -1 for no data

    const needsPractice = accuracy !== -1 && accuracy < 60;

    return (
      <TouchableOpacity onPress={() => handleSelectTopic(item)}>
        <View style={[styles.topicItem, needsPractice && styles.needsPractice]}>
          <ThemedText>{item}</ThemedText>
          {accuracy !== -1 && (
            <ThemedText style={styles.accuracyText}>
              {accuracy.toFixed(0)}% Accuracy
            </ThemedText>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Topics</ThemedText>
      <FlatList
        data={topics}
        keyExtractor={(item) => item}
        renderItem={renderTopicItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
  },
  topicItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  needsPractice: {
    backgroundColor: '#FFEBEE', // A light red background to highlight
    borderColor: '#E57373',
    borderWidth: 1,
    borderRadius: 5,
  },
  accuracyText: {
    fontStyle: 'italic',
    color: '#555',
  },
});

export default TopicsScreen;
