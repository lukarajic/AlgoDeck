
import React, { createContext, useState, useContext } from 'react';

const TopicContext = createContext({
  selectedTopic: 'All',
  setSelectedTopic: (topic: string) => {},
  isFavoritesMode: false,
  setIsFavoritesMode: (isFavorites: boolean) => {},
});

export const useTopic = () => useContext(TopicContext);

export const TopicProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [isFavoritesMode, setIsFavoritesMode] = useState(false);

  return (
    <TopicContext.Provider value={{ selectedTopic, setSelectedTopic, isFavoritesMode, setIsFavoritesMode }}>
      {children}
    </TopicContext.Provider>
  );
};
