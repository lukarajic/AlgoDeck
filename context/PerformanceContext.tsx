import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PerformanceContext = createContext(null);

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
      updatedData[problemId] = { correct: 0, incorrect: 0 };
    }
    if (isCorrect) {
      updatedData[problemId].correct++;
    } else {
      updatedData[problemId].incorrect++;
    }
    setPerformanceData(updatedData);
    await AsyncStorage.setItem('performanceData', JSON.stringify(updatedData));
  };

  return (
    <PerformanceContext.Provider value={{ performanceData, updatePerformance }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => useContext(PerformanceContext);