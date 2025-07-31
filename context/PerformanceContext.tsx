import React, { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    const loadPerformanceData = async () => {
      const storedData = await AsyncStorage.getItem('performanceData');
      if (storedData) {
        setPerformanceData(JSON.parse(storedData));
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
  };

  const getReviewProblems = () => {
    const now = new Date();
    return Object.keys(performanceData).filter(problemId => {
      const problem = performanceData[problemId];
      return new Date(problem.nextReview) <= now;
    });
  };

  return (
    <PerformanceContext.Provider value={{ performanceData, updatePerformance, getReviewProblems }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => useContext(PerformanceContext);