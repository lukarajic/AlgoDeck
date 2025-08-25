import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { EmptyState } from '@/components/ui/EmptyState';
import { useFavorites } from '@/context/FavoritesContext';
import { useTopic } from '@/context/TopicContext';
import leetcodeProblemsData from '@/data/leetcode_problems.json';
import { useRouter } from 'expo-router';
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

const mappedProblems: Problem[] = (leetcodeProblemsData as LeetcodeProblem[]).map((p: LeetcodeProblem) => ({
  id: p.id,
  title: p.title,
  description: p.content,
  solution: p.solution,
  category: p.topicTags && p.topicTags.length > 0 ? p.topicTags[0] : 'Unknown',
  difficulty: p.difficulty,
}));

export default function FavoritesScreen() {
  const { favorites } = useFavorites();
  const { setSelectedTopic } = useTopic();
  const router = useRouter();

  const favoriteProblems = mappedProblems.filter((p) => favorites.includes(p.id));

  const handleProblemPress = (problem: Problem) => {
    setSelectedTopic('Favorites');
    router.push({ pathname: '/(tabs)', params: { problemId: problem.id, favoritesOnly: 'true' } });
  };

  const goToTopics = () => {
    router.push('/(tabs)/topics');
  };

  if (favoriteProblems.length === 0) {
    return (
      <EmptyState
        icon="star"
        title="No Favorites Yet"
        message="You can favorite a problem by tapping the star icon on the flashcard. Your favorite problems will appear here."
        action={{ title: 'Explore Topics', onPress: goToTopics }}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={favoriteProblems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.problemItem} onPress={() => handleProblemPress(item)}>
            <ThemedText style={styles.problemTitle}>{item.title}</ThemedText>
            <ThemedText style={styles.problemCategory}>{item.category}</ThemedText>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  problemItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  problemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  problemCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});
