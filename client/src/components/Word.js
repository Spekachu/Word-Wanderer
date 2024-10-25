import { forwardRef, useContext, useEffect, useState, useCallback } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

const Word = forwardRef(({ index, word, position, dimensions }, ref) => {
	const { isLoggedIn, logout, getAuthHeaders, userWordAssociations, updateUserWordAssociation } = useAuth();
  const { 
    selectedWord, setSelectedWord, 
    activeContent, setActiveContent, 
    selectedSticker, setSelectedSticker, 
    isDragging, 
    setShowEmojiPicker, 
    selectedHighlight, setSelectedHighlight, 
    setShowHighlightPicker,
		userLearningLanguage
  } = useContext(AppContext);

  const { addNotification } = useNotification();

  const [discovered, setDiscovered] = useState(!!userWordAssociations[word.id]);
  const [sticker, setSticker] = useState(userWordAssociations[word.id]?.emoji || "");
  const [highlight, setHighlight] = useState(userWordAssociations[word.id]?.highlightColor || "#ffffff");
  const [dragging, setDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [discoveredThisLanguage, setDiscoveredThisLanguage] = useState(false);

	useEffect(() => {
		const wordAssociation = userWordAssociations[word.id];
		setSticker(wordAssociation?.emoji || "");
		setHighlight(wordAssociation?.highlightColor || "#ffffff");
		setDiscoveredThisLanguage(wordAssociation?.languageCodes.includes(userLearningLanguage) || false);
		setDiscovered(!!wordAssociation);
	}, [userWordAssociations, word.id]);
	
  const saveWordAssociation = useCallback(async (wordId, emoji, highlightColor, languageCode) => {
    // Update local state immediately
    setSticker(emoji);
    setHighlight(highlightColor);
    setDiscovered(true);
    setDiscoveredThisLanguage(true);

    // Update the userWordAssociations in AuthContext
    updateUserWordAssociation(wordId, emoji, highlightColor, languageCode);

    if (!isLoggedIn) {
      // addNotification("Changes saved temporarily. Log in to save permanently.", "info");
      return;
    }

    try {
			const apiUrl = process.env.NODE_ENV === 'production' ? "/api" : process.env.REACT_APP_API_URL + "/api";
      const response = await fetch(`${apiUrl}/user/word-association`, {
        method: 'POST',
				headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          word_id: wordId,
          emoji: emoji,
          highlight_color: highlightColor,
					language_code: languageCode
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          addNotification("Your session has expired. Please log in again.", "error");
					logout();
        } else if (response.status === 404) {
          addNotification("Word not found. Please try again.", "error");
        } else {
          const errorData = await response.json();
          addNotification(errorData.message || "Failed to save word association", "error");
        }
        return;
      }

      // addNotification("Word association saved successfully!", "success");

    } catch (error) {
      console.error('Error saving word association:', error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        addNotification("Network error. Please check your connection and try again.", "error");
      } else {
        addNotification("An unexpected error occurred. Please try again later.", "error");
      }
    }
  }, [addNotification, isLoggedIn, updateUserWordAssociation]);

  const handleWordClick = useCallback(() => {
    if (dragging) {
      setDragging(false);
      return;
    }
    setShowEmojiPicker(false);

    if (selectedWord?.id === word.id && activeContent) {
      setActiveContent(false);
    } else {
      setSelectedSticker(sticker);
      setSelectedHighlight(highlight);
      if (!discoveredThisLanguage) {
        setDiscovered(true);
				setDiscoveredThisLanguage(true);
        saveWordAssociation(word.id, sticker, highlight, userLearningLanguage);
      }
      setIsSelected(true);
      setActiveContent(true);
      setSelectedWord(word);
    }
  }, [dragging, selectedWord, word, activeContent, sticker, highlight, discovered, setShowEmojiPicker, setSelectedHighlight, setActiveContent, setShowHighlightPicker, setSelectedSticker, setSelectedWord, saveWordAssociation]);

  useEffect(() => {
    if (selectedWord?.id === word.id && activeContent) {
      if (selectedSticker !== sticker || selectedHighlight !== highlight) {
        saveWordAssociation(word.id, selectedSticker, selectedHighlight, userLearningLanguage);
      }
      setIsSelected(true);
    } else {
      setIsSelected(false);
    }
  }, [selectedWord, activeContent, selectedSticker, selectedHighlight]);

  const handleMouseDown = useCallback(() => {
    setDragging(isDragging);
    setIsMouseDown(true);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  useEffect(() => {
    setDragging(isDragging);
  }, [isDragging]);

  return (
    <>
      <div
        onClick={() => handleWordClick(word)} 
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        ref={ref}
        className={`word select-none border-2 border-white px-[.75em] pb-1 absolute rounded-full hover:bg-white hover:!text-black -translate-x-1/2 -translate-y-1/2 backdrop-blur-sm text-nowrap whitespace-nowrap ${
          isMouseDown ? 'cursor-grabbing' : 'cursor-pointer'
        } ${
          isSelected ? 'bg-white text-black shadow-[0_0_.5em_.25em_white]' : discoveredThisLanguage ? 'bg-white/85 text-black shadow-[0_0_.5em_.25em_transparent]' : 'shadow-[0_0_.5em_.25em_transparent] border-dashed'
        }`}
        style={{
          top: `calc(50% + ${position.centerY}px)`,
          left: `calc(50% + ${position.centerX}px)`,
          position: 'absolute',
          transition: `color .25s ease, background .25s ease, box-shadow .25s ease, border .25s ease, opacity .25s ease`,
          fontSize: `${Math.max(1.5, 3 - Math.min(index / 30, 1.5))}rem`,
          ...(highlight !== "#ffffff" && discoveredThisLanguage && { backgroundColor: highlight }),
          ...(highlight !== "#ffffff" && !discoveredThisLanguage && isSelected && { backgroundColor: highlight }),
          ...(highlight !== "#ffffff" && !discoveredThisLanguage && !isSelected && { color: highlight })
        }}
      >
        <span className='relative inline-block'>{word.translations.target?.translation}</span>
      </div>
      {sticker && (
        <div 
					loading='lazy'
          className={`absolute pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 drop-shadow-[-1px_-1px_0_rgba(255,255,255,0.9)] text-slate-700`}
          style={{
            top: `calc(50% + ${position.centerY - (dimensions.height / 2)}px + .35em)`,
            left: `calc(50% + ${position.centerX - (dimensions.width / 2)}px + .35em)`,
            position: 'absolute',
            transition: `color .25s ease, background .25s ease, box-shadow .25s ease, opacity .25s ease`,
            fontSize: `${Math.max(1.5, 2.25 - Math.min(index / 30, 1))}rem`
          }}
        >
          {sticker}
        </div>
      )}
    </>
  );
});

export default Word;