import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFavorites } from '@/context/FavoritesContext';
import { useTopic } from '@/context/TopicContext';
import problems from '@/data/problems.json';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

export default function FavoritesScreen() {
  const { favorites } = useFavorites();
  const { setSelectedTopic } = useTopic();
  const router = useRouter();

  const favoriteProblems = problems.filter((p) => favorites.includes(p.id));

  const handleProblemPress = (problem) => {
    setSelectedTopic('Favorites');
    router.push({ pathname: '/(tabs)', params: { problemId: problem.id, favoritesOnly: 'true' } });
  };

  if (favoriteProblems.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.emptyText}>You haven't favorited any problems yet.</ThemedText>
      </ThemedView>
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
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
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
