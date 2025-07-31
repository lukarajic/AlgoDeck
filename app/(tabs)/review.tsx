import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { usePerformance } from '@/context/PerformanceContext';
import problems from '@/data/problems.json';
import { Link } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const ReviewScreen = () => {
  const { getReviewProblems } = usePerformance();
  const reviewProblemIds = getReviewProblems();
  const reviewProblems = problems.filter(p => reviewProblemIds.includes(p.id.toString()));

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Due for Review</ThemedText>
      {reviewProblems.length === 0 ? (
        <ThemedText style={styles.noProblemsText}>No problems due for review today!</ThemedText>
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
  noProblemsText: {
    fontSize: 18,
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
