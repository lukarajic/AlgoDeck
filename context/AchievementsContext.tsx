
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import achievementsData from '@/data/achievements.json';
import problems from '@/data/problems.json';
import { usePerformance, usePerformanceStats } from '@/context/PerformanceContext';

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
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const { stats } = usePerformanceStats();
  const { currentStreak } = usePerformance();

  useEffect(() => {
    setAchievements(achievementsData);
    loadUnlockedAchievements();
  }, []);

  useEffect(() => {
    checkAchievements();
  }, [stats, currentStreak]);

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
    if (!stats) return;

    const correctAnswers = Object.values(stats).reduce((acc, topic) => acc + topic.correct, 0);
    if (correctAnswers >= 1) {
        unlockAchievement('FIRST_CORRECT');
    }
    if (correctAnswers >= 10) {
        unlockAchievement('ALL_CORRECT_10');
    }

    if (currentStreak >= 3) {
        unlockAchievement('STREAK_3');
    }
    if (currentStreak >= 7) {
        unlockAchievement('STREAK_7');
    }

    for (const topic in stats) {
      if (stats[topic].accuracy === 100) {
        const achievementId = `TOPIC_MASTER_${topic.toUpperCase()}`;
        unlockAchievement(achievementId);
      }
    }
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
