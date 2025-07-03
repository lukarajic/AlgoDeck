
import React, { createContext, useState, useContext } from 'react';

const TopicContext = createContext({
  selectedTopic: 'All',
  setSelectedTopic: (topic: string) => {},
});

export const useTopic = () => useContext(TopicContext);

export const TopicProvider = ({ children }) => {
  const [selectedTopic, setSelectedTopic] = useState('All');

  return (
    <TopicContext.Provider value={{ selectedTopic, setSelectedTopic }}>
      {children}
    </TopicContext.Provider>
  );
};
