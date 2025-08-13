import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePerformance } from '@/context/PerformanceContext';
import leetcodeProblemsData from '@/data/leetcode_problems.json';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

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

const ReviewScreen = () => {
  const { getReviewProblems } = usePerformance();
  const router = useRouter();
  const reviewProblemIds = getReviewProblems();
  const reviewProblems = mappedProblems.filter((p) => reviewProblemIds.includes(p.id.toString()));

  const goToPractice = () => {
    router.push('/(tabs)');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Due for Review</ThemedText>
      {reviewProblems.length === 0 ? (
        <EmptyState
          icon="checkmark.circle"
          title="All Caught Up!"
          message="You have no problems due for review today. Keep up the great work!"
          action={{ title: 'Practice More', onPress: goToPractice }}
        />
      ) : (
        <FlatList
          data={reviewProblems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Link href={{ pathname: '/(tabs)', params: { problemId: item.id, reviewMode: true } }} asChild>
              <TouchableOpacity style={styles.problemItem}>
                <ThemedText style={styles.problemTitle}>{item.title}</ThemedText>
              </TouchableOpacity>
            </Link>
          )}
        />
      )}
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
    textAlign: 'center',
    marginTop: 50,
  },
  problemItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  problemTitle: {
    fontSize: 18,
  },
});

export default ReviewScreen;
