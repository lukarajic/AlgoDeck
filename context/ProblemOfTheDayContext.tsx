
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import leetcodeProblems from '../data/leetcode_problems.json';

interface Problem {
  id: number;
  title: string;
  description: string;
  solution: string;
  category: string;
  difficulty: string;
}

interface ProblemOfTheDayContextType {
  problemOfTheDay: Problem | null;
  isCompleted: boolean;
  markAsCompleted: () => void;
}

const ProblemOfTheDayContext = createContext<ProblemOfTheDayContextType | undefined>(undefined);

const mappedProblems: Problem[] = leetcodeProblems.map((p: any) => ({
  id: p.id,
  title: p.title,
  description: p.content,
  solution: p.solution,
  category: p.topicTags && p.topicTags.length > 0 ? p.topicTags[0] : 'Unknown',
  difficulty: p.difficulty,
}));

export const ProblemOfTheDayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [problemOfTheDay, setProblemOfTheDay] = useState<Problem | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const today = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  }, []);

  useEffect(() => {
    const getProblem = () => {
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
      );
      const problemIndex = dayOfYear % mappedProblems.length;
      setProblemOfTheDay(mappedProblems[problemIndex]);
    };

    const checkCompletionStatus = async () => {
      const lastCompletionDate = await AsyncStorage.getItem('problemOfTheDayCompletedDate');
      if (lastCompletionDate === today) {
        setIsCompleted(true);
      } else {
        setIsCompleted(false);
      }
    };

    getProblem();
    checkCompletionStatus();
  }, [today]);

  const markAsCompleted = async () => {
    setIsCompleted(true);
    await AsyncStorage.setItem('problemOfTheDayCompletedDate', today);
  };

  return (
    <ProblemOfTheDayContext.Provider value={{ problemOfTheDay, isCompleted, markAsCompleted }}>
      {children}
    </ProblemOfTheDayContext.Provider>
  );
};

export const useProblemOfTheDay = () => {
  const context = useContext(ProblemOfTheDayContext);
  if (!context) {
    throw new Error('useProblemOfTheDay must be used within a ProblemOfTheDayProvider');
  }
  return context;
};
