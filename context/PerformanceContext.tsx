import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import leetcodeProblemsData from '@/data/leetcode_problems.json';

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

const mappedProblems: Problem[] = (leetcodeProblemsData as LeetcodeProblem[] || []).filter(p => p).map((p: LeetcodeProblem) => ({
  id: p.id,
  title: p.title,
  description: p.content,
  solution: p.solution,
  category: p.topicTags && p.topicTags.length > 0 ? p.topicTags[0] : 'Unknown',
  difficulty: p.difficulty,
}));

interface PerformanceEntry {
  correct: number;
  incorrect: number;
  srsLevel: number;
  nextReview: Date;
}

interface PerformanceData {
  [problemId: string]: PerformanceEntry;
}

interface PerformanceContextType {
  performanceData: PerformanceData;
  updatePerformance: (problemId: number, isCorrect: boolean) => Promise<void>;
  getReviewProblems: () => string[];
  currentStreak: number;
  resetPerformance: () => Promise<void>;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

const SRS_LEVELS = [
  { hours: 4 },
  { hours: 8 },
  { hours: 24 },
  { hours: 3 * 24 },
  { hours: 7 * 24 },
  { hours: 2 * 7 * 24 },
  { hours: 4 * 7 * 24 },
  { hours: 16 * 7 * 24 },
];

export const PerformanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lastPracticeDate, setLastPracticeDate] = useState<string | null>(null);

  useEffect(() => {
    const loadPerformanceData = async () => {
      const storedPerformanceData = await AsyncStorage.getItem('performanceData');
      if (storedPerformanceData) {
        setPerformanceData(JSON.parse(storedPerformanceData));
      }

      const storedStreak = await AsyncStorage.getItem('currentStreak');
      if (storedStreak) {
        setCurrentStreak(parseInt(storedStreak, 10));
      }

      const storedLastPracticeDate = await AsyncStorage.getItem('lastPracticeDate');
      if (storedLastPracticeDate) {
        setLastPracticeDate(storedLastPracticeDate);
      }
    };
    loadPerformanceData();
  }, []);

  const updatePerformance = async (problemId: number, isCorrect: boolean) => {
    const updatedData = { ...performanceData };
    if (!updatedData[problemId]) {
      updatedData[problemId] = { correct: 0, incorrect: 0, srsLevel: 0, nextReview: new Date() };
    }

    if (isCorrect) {
      updatedData[problemId].correct++;
      updatedData[problemId].srsLevel = (updatedData[problemId].srsLevel || 0) + 1;
    } else {
      updatedData[problemId].incorrect++;
      updatedData[problemId].srsLevel = 0;
    }

    const srsLevel = updatedData[problemId].srsLevel;
    const reviewInterval = SRS_LEVELS[Math.min(srsLevel, SRS_LEVELS.length - 1)].hours;
    const nextReview = new Date();
    nextReview.setHours(nextReview.getHours() + reviewInterval);
    updatedData[problemId].nextReview = nextReview;

    setPerformanceData(updatedData);
    await AsyncStorage.setItem('performanceData', JSON.stringify(updatedData));
    await updateStreak();
  };

  const resetPerformance = async () => {
    setPerformanceData({});
    setCurrentStreak(0);
    setLastPracticeDate(null);
    await AsyncStorage.removeItem('performanceData');
    await AsyncStorage.removeItem('currentStreak');
    await AsyncStorage.removeItem('lastPracticeDate');
  };

  const updateStreak = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStreak = currentStreak;
    if (lastPracticeDate) {
      const lastDate = new Date(lastPracticeDate);
      lastDate.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak++;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    setCurrentStreak(newStreak);
    setLastPracticeDate(today.toISOString());
    await AsyncStorage.setItem('currentStreak', newStreak.toString());
    await AsyncStorage.setItem('lastPracticeDate', today.toISOString());
  };

  const getReviewProblems = useCallback(() => {
    const now = new Date();
    return Object.keys(performanceData).filter(problemId => {
      const problem = performanceData[problemId];
      return new Date(problem.nextReview) <= now;
    });
  }, [performanceData]);

  return (
    <PerformanceContext.Provider value={{ performanceData, updatePerformance, getReviewProblems, currentStreak, resetPerformance }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

export const usePerformanceStats = () => {
  const { performanceData } = usePerformance();
  interface TopicStatsEntry {
    correct: number;
    incorrect: number;
    accuracy: number;
  }

  interface PerformanceStats {
    [topic: string]: TopicStatsEntry;
  }
  const stats: PerformanceStats = {};
  let totalCorrect = 0;
  let totalIncorrect = 0;

  for (const problemId in performanceData) {
    const { correct, incorrect } = performanceData[problemId];
    const problem = mappedProblems.find(p => p.id === parseInt(problemId));
    if (!problem) continue;

    const topic = problem.category;
    if (!stats[topic]) {
      stats[topic] = { correct: 0, incorrect: 0, accuracy: 0 };
    }
    stats[topic].correct += correct;
    stats[topic].incorrect += incorrect;
    totalCorrect += correct;
    totalIncorrect += incorrect;
  }

  for (const topic in stats) {
    const { correct, incorrect } = stats[topic];
    stats[topic].accuracy = correct + incorrect > 0 ? (correct / (correct + incorrect)) * 100 : 0;
  }

  const overallAccuracy = totalCorrect + totalIncorrect > 0 ? (totalCorrect / (totalCorrect + totalIncorrect)) * 100 : 0;

  return { stats, overallAccuracy };
};
