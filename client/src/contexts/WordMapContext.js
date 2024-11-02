import { createContext, useState } from 'react';

const WordMapContext = createContext();

const WordMapProvider = ({ children }) => {
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  return (
    <WordMapContext.Provider value={{ panOffset, setPanOffset }}>
      {children}
    </WordMapContext.Provider>
  );
};

export { WordMapProvider, WordMapContext };