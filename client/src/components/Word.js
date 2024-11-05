import { forwardRef, useContext, useEffect, useState, useCallback } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { WordMapContext } from '../contexts/WordMapContext';
import { useAnimationFrame } from '../hooks/useAnimationFrame';

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
		userLearningLanguage,
		setPinPosition,
		setHoverPinPosition,
		setIsHovering,
		resetHoverPinPosition,
		holdHoverPinPosition,
		zoomLevel
  } = useContext(AppContext);
	const { panOffset, setPanOffset } = useContext(WordMapContext);

  const { addNotification } = useNotification();

	const queueUpdate = useAnimationFrame();

  const [discovered, setDiscovered] = useState(!!userWordAssociations[word.id]);
  const [sticker, setSticker] = useState(userWordAssociations[word.id]?.emoji || "");
  const [highlight, setHighlight] = useState(userWordAssociations[word.id]?.highlightColor || "#ffffff");
  const [isSelected, setIsSelected] = useState(false);
  const [discoveredThisLanguage, setDiscoveredThisLanguage] = useState(false);
  const [clickStartTime, setClickStartTime] = useState(null);
  const clickThreshold = 200; // milliseconds

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

	const callSetPinPosition = useCallback(() => {
		setPinPosition({
			x: `calc(50% + ${position.centerX + (dimensions.width / 3)}px)`,
			y: `calc(50% + ${position.centerY - (dimensions.height / 4)}px)`
		});
	}, [position, dimensions]);

  const handleWordClick = useCallback(() => {
    setShowEmojiPicker(false);

    if (selectedWord?.id === word.id && activeContent) {
      setActiveContent(false);
      setPinPosition(null);
			resetHoverPinPosition();
    } else {
			queueUpdate(() => {
				//only setPanOffset on mobile screens
				let newX = Number(-position.centerX*zoomLevel);
				let newY = Number(-(position.centerY+dimensions.height)*zoomLevel);
				const winWFraction = window.innerWidth/4;
				const winHFraction = window.innerHeight/8;
				if (window.innerWidth <= 768) {
					setPanOffset({ x: newX, y: newY });
				} else {
					const xD = panOffset.x - newX;
					const xNewD = Math.abs(xD) - winWFraction;
					if (Math.abs(xD) > winWFraction) {
						newX = xD > 0 ? panOffset.x - xNewD : panOffset.x + xNewD;
					} else {
						newX = panOffset.x;
					}
					const yD = panOffset.y - newY;
					const yNewD = Math.abs(yD) - winHFraction;
					if (Math.abs(yD) > winHFraction) {
						newY = yD > 0 ? panOffset.y - yNewD : panOffset.y + (yNewD/1);
					} else {
						newY = panOffset.y;
					}
					setPanOffset({ x: newX, y: newY });
				}
				callSetPinPosition();
			});
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
  }, [selectedWord, word, activeContent, sticker, highlight, discovered, setShowEmojiPicker, setSelectedHighlight, setActiveContent, setShowHighlightPicker, setSelectedSticker, setSelectedWord, saveWordAssociation, setPinPosition, callSetPinPosition, position, queueUpdate]);

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

	
  useEffect(() => {
    if (selectedWord?.id === word.id && activeContent) {
			callSetPinPosition();
		}
  }, [callSetPinPosition]);

  const handleMouseDown = useCallback(() => {
    setClickStartTime(Date.now());
  }, []);

  const handleMouseUp = useCallback(() => {
    if (clickStartTime && Date.now() - clickStartTime < clickThreshold && !isDragging) {
      handleWordClick();
    }
    setClickStartTime(null);
  }, [clickStartTime, isDragging, handleWordClick]);

	const handleWordHover = useCallback(() => {
		setIsHovering(true);
		holdHoverPinPosition();
		setHoverPinPosition({
			x: `calc(50% + ${position.centerX + (dimensions.width / 3)}px)`,
			y: `calc(50% + ${position.centerY - (dimensions.height / 4)}px)`
		});
	}, [position, dimensions]);
	
	const handleWordHoverEnd = useCallback(() => {
		setIsHovering(false);
		resetHoverPinPosition();
	}, [position, dimensions]);

  return (
    <>
      <div
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
				onMouseEnter={handleWordHover}
				onMouseLeave={handleWordHoverEnd}
        ref={ref}
        className={`word select-none 
					border-2 border-white 
					px-[.75em] pb-1 
					absolute 
					rounded-full 
					hover:!text-black 
					-translate-x-1/2 -translate-y-1/2 
					text-nowrap 
					whitespace-nowrap 
					before:content-[\'\']
					before:rounded-full
					before:absolute
					before:inset-[0px]
					before:border-2
					before:border-orange-500
					before:border-dashed
					before:pointer-events-none
					before:opacity-0
					before:transition-opacity
					before:duration-500
					${
          isSelected ? 'bg-white text-black hover:bg-white before:opacity-100' : discoveredThisLanguage ? 'bg-white text-black hover:bg-white' : 'border-dashed hover:bg-white/75'
        }`}
        style={{
          top: `calc(50% + ${position.centerY}px)`,
          left: `calc(50% + ${position.centerX}px)`,
          position: 'absolute',
          transition: `color .25s ease, background .25s ease, box-shadow .25s ease, border .25s ease, opacity .25s ease`,
          fontSize: `2.5rem`,
          ...(highlight !== "#ffffff" && discoveredThisLanguage && { backgroundColor: highlight }),
          ...(highlight !== "#ffffff" && !discoveredThisLanguage && isSelected && { backgroundColor: highlight }),
          ...(highlight !== "#ffffff" && !discoveredThisLanguage && !isSelected && { color: highlight }),
					cursor: isDragging ? 'grabbing' : 'pointer',
        }}
      >
        <span className='relative inline-block'>{word.translations.target?.translation}</span>
      </div>
      {sticker && (
        <div 
					loading='lazy'
          className={`absolute pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 drop-shadow-[-1px_-1px_0_rgba(255,255,255,0.9)] text-rose-950`}
          style={{
            top: `calc(50% + ${position.centerY - (dimensions.height / 2)}px + .35em)`,
            left: `calc(50% + ${position.centerX - (dimensions.width / 2)}px + .35em)`,
            position: 'absolute',
            transition: `color .25s ease, background .25s ease, box-shadow .25s ease, opacity .25s ease`,
						fontSize: `2.25rem`,
          }}
        >
          {sticker}
        </div>
      )}
    </>
  );
});

export default Word;
