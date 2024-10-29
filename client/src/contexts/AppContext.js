import React, { createContext, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import * as api from '../api';
import useDebounce from '../utils/useDebounce';

export const AppContext = createContext();

export const WordProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const { isLoggedIn, currentUser, getAuthHeaders } = useAuth();

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
  const [zoomLevel, setZoomLevel] = useState(0.75);
  const learning = i18n.language === "de" ? "en" : "de";
  const [userLearningLanguage, set_userLearningLanguage] = useState(learning);

  // Add a ref to track initial load
  const isInitialLoad = useRef(true);

  // Add debounced versions of the preferences
  const debouncedPartOfSpeech = useDebounce(partOfSpeech, 1000);
  const debouncedCefrLevel = useDebounce(cefrLevel, 1000);
  const debouncedUserLanguage = useDebounce(userLanguage, 1000);
  const debouncedLearningLanguage = useDebounce(userLearningLanguage, 1000);
  const debouncedZoomLevel = useDebounce(zoomLevel, 1000);

  // Load user preferences when logged in
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      loadUserPreferences();
    }
  }, [isLoggedIn, currentUser]);

  // Save preferences when they change (but not on initial load)
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    
    if (isLoggedIn && currentUser) {
      saveUserPreferences();
    }
  }, [
    debouncedPartOfSpeech, 
    debouncedCefrLevel, 
    debouncedUserLanguage, 
    debouncedLearningLanguage, 
    debouncedZoomLevel
  ]);

	
  const loadUserPreferences = async () => {
    try {
      console.log("fetching user prefs");
      const { part_of_speech, cefr_level, user_language, learning_language, zoom_level } = await api.fetchUserPreferences(currentUser.id, getAuthHeaders);
      console.log("user prefs fetched", { part_of_speech, cefr_level, user_language, learning_language, zoom_level });
      
      if (part_of_speech) set_partOfSpeech(part_of_speech);
      if (cefr_level) set_cefrLevel(cefr_level);
      if (user_language) set_userLanguage(user_language);
      if (learning_language) set_userLearningLanguage(learning_language); 
      if (zoom_level) setZoomLevel(Number(zoom_level));
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const saveUserPreferences = async () => {
    try {
      console.log("Client saving user prefs");
      await api.saveUserPreferences(currentUser.id, {
        part_of_speech: debouncedPartOfSpeech,
        cefr_level: debouncedCefrLevel,
        user_language: debouncedUserLanguage,
        learning_language: debouncedLearningLanguage,
        zoom_level: debouncedZoomLevel || 0.75
      }, getAuthHeaders);
    } catch (error) {
      console.error('Client error saving user preferences:', error);
    }
  };


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
			zoomLevel, setZoomLevel,
      resetContentWindow
    }}>
      {children}
    </AppContext.Provider>
  );
};