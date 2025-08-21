import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import achievementsData from '@/data/achievements.json';
import problems from '@/data/leetcode_problems.json';
import { usePerformance } from '@/context/PerformanceContext';
import { Problem } from '@/types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface AchievementsContextType {
  achievements: Achievement[];
  unlockedAchievements: string[];
  unlockAchievement: (id: string) => void;
  checkAchievements: () => void;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export const AchievementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { performanceData, currentStreak } = usePerformance();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  useEffect(() => {
    setAchievements(achievementsData);
    loadUnlockedAchievements();
  }, []);

  useEffect(() => {
    if (performanceData) {
      checkAchievements();
    }
  }, [performanceData, currentStreak]);

  const loadUnlockedAchievements = async () => {
    try {
      const unlocked = await AsyncStorage.getItem('unlocked_achievements');
      if (unlocked) {
        setUnlockedAchievements(JSON.parse(unlocked));
      }
    } catch (error) {
      console.error('Failed to load unlocked achievements:', error);
    }
  };

  const unlockAchievement = async (id: string) => {
    setUnlockedAchievements(prevUnlocked => {
      if (prevUnlocked.includes(id)) {
        return prevUnlocked;
      }

      const newUnlocked = [...prevUnlocked, id];
      AsyncStorage.setItem('unlocked_achievements', JSON.stringify(newUnlocked));

      const unlockedAchievement = achievements.find(ach => ach.id === id);
      if (unlockedAchievement) {
        Alert.alert(
          'Achievement Unlocked!',
          `${unlockedAchievement.title}: ${unlockedAchievement.description}`,
          [{ text: 'OK' }]
        );
      }
      return newUnlocked;
    });
  };

  const checkAchievements = () => {
    if (!performanceData || currentStreak === null) return; // Ensure performanceData and currentStreak are not null

    const allProblems: Problem[] = problems as Problem[]; // Explicitly cast problems to Problem[]
    const validProblems = allProblems.filter((p: Problem) => p);

    const correctProblems = Object.keys(performanceData).filter(id => performanceData[id].correct > 0);
    const correctCount = correctProblems.length;

    // Problem Count Achievements
    if (correctCount >= 1) unlockAchievement('FIRST_CORRECT');
    if (correctCount >= 10) unlockAchievement('ALL_CORRECT_10');
    if (correctCount >= 25) unlockAchievement('ALL_CORRECT_25');
    if (correctCount >= 50) unlockAchievement('ALL_CORRECT_50');
    if (correctCount >= 100) unlockAchievement('ALL_CORRECT_100');

    // Streak Achievements
    if (currentStreak >= 3) unlockAchievement('STREAK_3');
    if (currentStreak >= 7) unlockAchievement('STREAK_7');

    // Generic mastery check function
    const checkMastery = (problemsToCheck: Problem[], achievementId: string) => {
        if (problemsToCheck.length === 0) return;

        const allSolved = problemsToCheck.every((p: Problem) => {
            const perf = performanceData[p.id.toString()];
            return perf && perf.correct > 0;
        });

        if (!allSolved) return;

        let totalCorrect = 0;
        let totalIncorrect = 0;
        for (const problem of problemsToCheck) {
            const perf = performanceData[problem.id.toString()]; // Corrected from p.id.toString()
            if (perf) {
                totalCorrect += perf.correct;
                totalIncorrect += perf.incorrect;
            }
        }

        if (totalCorrect + totalIncorrect === 0) return;

        const accuracy = (totalCorrect / (totalCorrect + totalIncorrect)) * 100;

        if (accuracy >= 95) {
            unlockAchievement(achievementId);
        }
    };

    // Difficulty Mastery
    checkMastery(validProblems.filter((p: Problem) => p.difficulty === 'Easy'), 'EASY_MASTER');
    checkMastery(validProblems.filter((p: Problem) => p.difficulty === 'Medium'), 'MEDIUM_MASTER');
    checkMastery(validProblems.filter((p: Problem) => p.difficulty === 'Hard'), 'HARD_MASTER');

    // Topic Mastery
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Array')), 'TOPIC_MASTER_ARRAY');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('String')), 'TOPIC_MASTER_STRING');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Hash Table')), 'TOPIC_MASTER_HASH_TABLE');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Linked List')), 'TOPIC_MASTER_LINKED_LIST');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Tree')), 'TOPIC_MASTER_TREE');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Dynamic Programming')), 'TOPIC_MASTER_DYNAMIC_PROGRAMMING');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Binary Search')), 'TOPIC_MASTER_BINARY_SEARCH');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Backtracking')), 'TOPIC_MASTER_BACKTRACKING');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Math')), 'TOPIC_MASTER_MATH');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Two Pointers')), 'TOPIC_MASTER_TWO_POINTERS');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Stack')), 'TOPIC_MASTER_STACK');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Greedy')), 'TOPIC_MASTER_GREEDY');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Sorting')), 'TOPIC_MASTER_SORTING');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Heap')), 'TOPIC_MASTER_HEAP');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Matrix')), 'TOPIC_MASTER_MATRIX');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Bit Manipulation')), 'TOPIC_MASTER_BIT_MANIPULATION');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Divide and Conquer')), 'TOPIC_MASTER_DIVIDE_AND_CONQUER');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Recursion')), 'TOPIC_MASTER_RECURSION');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Trie')), 'TOPIC_MASTER_TRIE');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Merge Sort')), 'TOPIC_MASTER_MERGE_SORT');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Sliding Window')), 'TOPIC_MASTER_SLIDING_WINDOW');
    checkMastery(validProblems.filter((p: Problem) => Array.isArray(p.topicTags) && p.topicTags.includes('Combinatorics')), 'TOPIC_MASTER_COMBINATORICS');
  };

  return (
    <AchievementsContext.Provider value={{ achievements, unlockedAchievements, unlockAchievement, checkAchievements }}>
      {children}
    </AchievementsContext.Provider>
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
};