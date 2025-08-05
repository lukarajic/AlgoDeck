import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PerformanceContext = createContext(null);

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

export const PerformanceProvider = ({ children }) => {
  const [performanceData, setPerformanceData] = useState({});
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

  const updatePerformance = async (problemId, isCorrect, reset = false) => {
    if (reset) {
      setPerformanceData({});
      await AsyncStorage.removeItem('performanceData');
      return;
    }

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
    <PerformanceContext.Provider value={{ performanceData, updatePerformance, getReviewProblems, currentStreak }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => useContext(PerformanceContext);