
import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useAchievements, Achievement } from '@/context/AchievementsContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import Icon from '@expo/vector-icons/FontAwesome';
import { useThemeColor } from '@/hooks/useThemeColor';

const AchievementsScreen = () => {
  const { achievements, unlockedAchievements } = useAchievements();
  const unlockedColor = useThemeColor({}, 'tint');
  const lockedColor = useThemeColor({}, 'text');
  const unlockedBg = useThemeColor({}, 'tint');
  const lockedBg = useThemeColor({}, 'background');
  const errorTextColor = useThemeColor({}, 'errorText');

  const renderItem = ({ item }: { item: Achievement }) => {
    const isUnlocked = unlockedAchievements.includes(item.id);

    return (
      <View
        style={[
          styles.achievementItem,
          {
            backgroundColor: isUnlocked ? unlockedBg : lockedBg,
            borderColor: isUnlocked ? unlockedColor : lockedColor,
            borderWidth: isUnlocked ? 2 : 1,
            opacity: isUnlocked ? 1 : 0.7,
          },
        ]}>
        <Icon name={item.icon} size={30} color={isUnlocked ? lockedBg : lockedColor} />
        <View style={styles.achievementTextContainer}>
          <ThemedText style={[styles.title, { color: isUnlocked ? errorTextColor : lockedColor }]}>{item.title}</ThemedText>
          <ThemedText style={[styles.description, { color: isUnlocked ? errorTextColor : lockedColor }]}>{item.description}</ThemedText>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.header}>Achievements</ThemedText>
      <FlatList
        data={achievements}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  achievementTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default AchievementsScreen;
