import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import problems from '../../data/problems.json';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTopic } from '../../context/TopicContext';

const TopicsScreen = () => {
  const { setSelectedTopic } = useTopic();
  const router = useRouter();
  const topics = ['All', ...new Set(problems.map((problem) => problem.category))];

  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    router.push('/');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Topics</ThemedText>
      <FlatList
        data={topics}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectTopic(item)}>
            <View style={styles.topicItem}>
              <ThemedText>{item}</ThemedText>
            </View>
          </TouchableOpacity>
        )}
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
  },
  topicItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default TopicsScreen;