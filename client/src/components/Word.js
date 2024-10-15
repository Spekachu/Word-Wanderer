import { forwardRef, useContext, useEffect, useState, useCallback } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useNotification } from '../contexts/NotificationContext';

const Word = forwardRef(({ index, word, position, loaded, dimensions }, ref) => {
  const { 
    selectedWord, setSelectedWord, 
    activeContent, setActiveContent, 
    selectedSticker, setSelectedSticker, 
    isDragging, 
    setShowEmojiPicker, 
    selectedHighlight, setSelectedHighlight, 
    setShowHighlightPicker 
  } = useContext(AppContext);

  const { addNotification } = useNotification();

  const [discovered, setDiscovered] = useState(!!word.user_association);
  const [sticker, setSticker] = useState(word.user_association?.emoji || "");
  const [highlight, setHighlight] = useState(word.user_association?.highlight_color || "#ffffff");
  const [dragging, setDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const saveWordAssociation = useCallback(async (wordId, emoji, highlightColor) => {
    const token = localStorage.getItem('token');
    
    // Update local state immediately
    setSticker(emoji);
    setHighlight(highlightColor);
    setDiscovered(true);

    if (!token) {
      addNotification("Changes saved locally. Log in to save permanently.", "info");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/word-association`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          word_id: wordId,
          emoji: emoji,
          highlight_color: highlightColor
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save word association');
      }

    } catch (error) {
      console.error('Error saving word association:', error);
      addNotification("Failed to save changes to server. Your changes are saved locally.", "error", 7000);
    }
  }, [addNotification]);

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
      if (!discovered) {
        setDiscovered(true);
        saveWordAssociation(word.id, sticker, highlight);
      }
      setIsSelected(true);
      setActiveContent(true);
      setSelectedWord(word);
    }
  }, [dragging, selectedWord, word, activeContent, sticker, highlight, discovered, setShowEmojiPicker, setSelectedHighlight, setActiveContent, setShowHighlightPicker, setSelectedSticker, setSelectedWord, saveWordAssociation]);

  useEffect(() => {
    if (selectedWord?.id === word.id && activeContent) {
      if (selectedSticker !== sticker || selectedHighlight !== highlight) {
        saveWordAssociation(word.id, selectedSticker, selectedHighlight);
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
        className={`word select-none border-2 border-white px-[.75em] pb-1 absolute rounded-full hover:bg-white hover:text-black -translate-x-1/2 -translate-y-1/2 opacity-0 backdrop-blur-sm text-nowrap whitespace-nowrap ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${
          isMouseDown ? 'cursor-grabbing' : 'cursor-pointer'
        } ${
          isSelected ? 'bg-white text-black shadow-[0_0_.5em_.25em_white]' : discovered ? 'bg-white/85 text-black shadow-[0_0_.5em_.25em_transparent]' : 'shadow-[0_0_.5em_.25em_transparent]'
        }`}
        style={{
          top: `calc(50% + ${position.centerY}px)`,
          left: `calc(50% + ${position.centerX}px)`,
          position: 'absolute',
          transition: `color .25s ease, background .25s ease, box-shadow .25s ease, border .25s ease, opacity .25s ease ${index * 0.0075}s`,
          fontSize: `${Math.max(1.5, 3 - Math.min(index / 30, 1.5))}rem`,
          ...(highlight !== "#ffffff" && { backgroundColor: highlight })
        }}
      >
        <span className='relative inline-block'>{word.translations.target?.translation}</span>
      </div>
      {sticker && (
        <div 
          className={`absolute pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 drop-shadow-[-1px_-1px_0_rgba(255,255,255,0.9)] text-slate-700 ${
          loaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            top: `calc(50% + ${position.centerY - (dimensions.height / 2)}px + .35em)`,
            left: `calc(50% + ${position.centerX - (dimensions.width / 2)}px + .35em)`,
            position: 'absolute',
            transition: `color .25s ease, background .25s ease, box-shadow .25s ease, opacity .25s ease ${index * 0.0075}s`,
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