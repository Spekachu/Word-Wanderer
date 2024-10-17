import React, { createContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export const AppContext = createContext();

export const WordProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const location = useLocation();

  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [selectedHighlight, setSelectedHighlight] = useState("#ffffff");
  const [activeContent, setActiveContent] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  // settings for api calls
  const [partOfSpeech, set_partOfSpeech] = useState("verb");
  const [cefrLevel, set_cefrLevel] = useState("a1");
  const [relatedContext, set_relatedContext] = useState("");
  const [userLanguage, set_userLanguage] = useState("en");
  const learning = i18n.language === "de" ? "en" : "de";
  const [userLearningLanguage, set_userLearningLanguage] = useState(learning);
  const [userWordAssociations, setUserWordAssociations] = useState({});

  // Reset certain values when the route changes
  useEffect(() => {
    setActiveContent(false);
    setShowEmojiPicker(false);
    setShowHighlightPicker(false);
    setSelectedWord(null);
    setSelectedSticker(null);
    // Add any other values you want to reset here
  }, [location.pathname]);

  // Function to reset content window
  const resetContentWindow = () => {
    setActiveContent(false);
    setShowEmojiPicker(false);
    setShowHighlightPicker(false);
    // Add any other resets you need here
  };

  return (
    <AppContext.Provider value={{ 
      selectedWord, setSelectedWord, 
      activeContent, setActiveContent,
      selectedSticker, setSelectedSticker,
      isDragging, setIsDragging,
      partOfSpeech, set_partOfSpeech,
      cefrLevel, set_cefrLevel,
      relatedContext, set_relatedContext,
      userLanguage, set_userLanguage,
      userLearningLanguage, set_userLearningLanguage,
      showEmojiPicker, setShowEmojiPicker,
      selectedHighlight, setSelectedHighlight,
      showHighlightPicker, setShowHighlightPicker,
      userWordAssociations, setUserWordAssociations,
      resetContentWindow
    }}>
      {children}
    </AppContext.Provider>
  );
};