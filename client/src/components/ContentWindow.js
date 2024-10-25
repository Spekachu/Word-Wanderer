import { useContext, useRef, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import { FaArrowAltCircleDown, FaVolumeUp } from "react-icons/fa";
import { RiEmojiStickerLine } from "react-icons/ri";
import EmojiPicker from 'emoji-picker-react'; 
import { IoIosCloseCircle } from "react-icons/io";
import { PiHighlighterDuotone } from "react-icons/pi";
import { useTranslation } from 'react-i18next';

const ContentWindow = () => {
  const { selectedWord, activeContent, setActiveContent, selectedSticker, setSelectedSticker, showEmojiPicker, setShowEmojiPicker,selectedHighlight, setSelectedHighlight, showHighlightPicker, setShowHighlightPicker, userLearningLanguage } = useContext(AppContext);

	const emojiPickerRef = useRef(null);
  const { t, i18n } = useTranslation();

  function closeContentWindow() {
    setActiveContent(false);
		setShowEmojiPicker(false);
		setShowHighlightPicker(false);
  }

  function onEmojiClick(emojiData, event) {
    setSelectedSticker(emojiData.emoji); // Save selected emoji in state
    setShowEmojiPicker(false); // Close emoji picker after selection
  }

  function removeSticker() {
    setSelectedSticker(null); // Save selected emoji in state
    setShowEmojiPicker(false); // Close emoji picker after selection
  }

  function toggleHighlightPicker() {
		setShowHighlightPicker(!showHighlightPicker);
  }

  function setHighlight(color) {
		setSelectedHighlight(color);
  }

	function playPronunciation(text) {
		// Check if the browser supports speech synthesis
		if ('speechSynthesis' in window) {
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.lang = userLearningLanguage;

			// Cancel any ongoing speech synthesis
			window.speechSynthesis.cancel();

			// Speak the text
			window.speechSynthesis.speak(utterance);
		} else {
			console.warn('Speech synthesis is not supported in this browser.');
		}
	}

	useEffect(() => {
		if (activeContent && showEmojiPicker) {
			const timeoutId = setTimeout(() => {
				emojiPickerRef.current.scrollIntoView({
					behavior: "smooth"
				});
			}, 150);
	
			// Cleanup timeout if the component unmounts or dependencies change
			return () => clearTimeout(timeoutId);
		}
	}, [showEmojiPicker, activeContent]);	

  return (
    <div id="ContentWindow"
			loading='lazy'
			tabIndex="-1"
      className={`relative
				transition-all
				bg-white 
				text-stone-900 
				p-8 
				backdrop-blur-sm 
				shadow-[0_0_0_4px_rgba(255,200,200,1)]
				sm:shadow-[0_0_0_8px_rgba(255,200,200,0.75)]
				sm:rounded-tl-3xl
				z-10 
				w-full
				sm:w-[calc(100%-2rem)]
				sm:max-w-lg 
				ml-auto
				transform-gpu
				will-change-transform
				${
        activeContent ? showEmojiPicker ?  'min-h-[35rem] max-h-dvh translate-y-[calc(100dvh-12rem)]' : 'min-h-48 translate-y-[calc(100dvh-12rem)]' : 'min-h-48 translate-y-[calc(100dvh+1rem)] pointer-events-none opacity-0'
      }`}
    >
			<div className={`absolute bottom-full left-0 sm:left-4 w-full sm:w-[calc(100%-2rem)] overflow-hidden origin-bottom transition-all ${showHighlightPicker ? "h-20" : "h-0"}`}>
				<div className="flex h-full absolute w-full top-0 left-0 items-end">
					{[
						"#ffffff", 
						"#fee2e2",
						"#ffedd5",
						"#fef9c3",
						"#ecfccb",
						"#dcfce7",
						"#d1fae5",
						"#cffafe",
						"#e0f2fe",
						"#e0e7ff",
						"#f3e8ff",
						"#fce7f3",
						"#fecaca",
						"#fed7aa",
						"#fde68a",
						"#fef08a",
						"#d9f99d",
						"#bbf7d0",
						"#a7f3d0",
						"#99f6e4",
						"#a5f3fc",
						"#bae6fd",
						"#bfdbfe",
						"#c7d2fe",
						"#ddd6fe",
						"#e9d5ff",
						"#f5d0fe",
						"#fbcfe8"
					].map((color) => (
						<div
							key={color}
							onClick={() => setHighlight(color)}
							className={`w-auto grow h-16 border border-white rounded-t-full transition origin-bottom cursor-pointer hover:scale-y-125 ${
								selectedHighlight === color ? "scale-y-125" : ""
							}`}
							style={{
								backgroundColor: color,
							}}
						/>
					))}
				</div>
			</div>

      {/* Close button */}
      <button className='text-4xl p-1 absolute right-0 -top-4 text-[#a58b8b] bg-white rounded-full hover:text-[#ecb1b1] transition-colors' onClick={closeContentWindow}>
        <FaArrowAltCircleDown />
      </button>

      {/* Emoji sticker button */}
      <button 
        className={`
          text-4xl p-1 absolute left-0 -top-4 transition-colors aspect-square
        `}
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        aria-label={selectedSticker ? t('contentWindow.changeSticker') : t('contentWindow.addSticker')}
        title={selectedSticker ? t('contentWindow.changeSticker') : t('contentWindow.addSticker')}
      >
        <div className={`
          ${selectedSticker 
            ? 'drop-shadow-[-.1rem_-.1rem_0_rgba(255,255,255,0.9)]' 
            : ''
          }
        `}>
          {selectedSticker || <RiEmojiStickerLine className='rounded-full text-[#a58b8b] bg-white hover:text-[#ecb1b1] transition-colors' />}
        </div>
      </button>
      {/* Emoji sticker remove button */}
			{selectedSticker && (
				<button className='text-2xl absolute left-12 -top-3 text-red-400 bg-white/90 rounded-full hover:text-red-600 transition-colors' onClick={removeSticker}>
        	<IoIosCloseCircle />
      	</button>
			)}
			<button className={`text-2xl absolute right-14 -top-3 p-1  border-2 border-[#a58b8b] hover:border-[#ecb1b1] rounded-full hover:text-[#ecb1b1] transition-colors ${
				selectedHighlight === "#ffffff" ? "text-[#a58b8b]" : ""
			}`} 
			style={{
				backgroundColor: selectedHighlight,
				...(selectedHighlight !== "#ffffff" && { color: selectedHighlight })
			}}
			onClick={toggleHighlightPicker}>
				<PiHighlighterDuotone />
			</button>

      {/* Emoji picker */}
      <div 
        loading='lazy' 
        ref={emojiPickerRef} 
        className={`fixed right-0 bottom-0 z-20 w-full transition-all ${
        showEmojiPicker ? "h-[calc(100%-2rem)]" : "translate-y-full opacity-0 pointer-events-none h-0 origin-bottom"
      }`}
      >
        <EmojiPicker 
          onEmojiClick={onEmojiClick} 
          width="100%" 
          height="100%" 
          autoFocusSearch={false} 
          open={showEmojiPicker}
          lazyLoadEmojis={true}
          skinTonesDisabled={true} 
          previewConfig={{
            defaultCaption: t('contentWindow.pickSticker')
          }}
        />
      </div>

      {/* Conditionally render the content */}
      {selectedWord && activeContent && (
        <>
          <p className='text-4xl capitalize'>
            <span className='relative inline-block'>{selectedHighlight !== "#ffffff" && (
						<span className='absolute -z-10 w-[calc(100%+2rem)] min-w-40 h-full top-0 -left-4 -skew-y-1' 
						style={{
							backgroundColor: selectedHighlight
						}}></span>
					)}{selectedWord.translations.target.translation}
					<button 
						className="ml-2 text-2xl text-slate-900 hover:text-slate-500 transition-colors"
						onClick={() => playPronunciation(selectedWord.translations.target.translation)}
					>
						<FaVolumeUp />
					</button></span>
					</p>
					<hr className='mt-2'  />
          <p className='text-xl'>
						{selectedWord.translations.source.translation}
						{selectedWord.translations.source.alternateTranslations?.length > 0 && (
							<span>
								{selectedWord.translations.source.alternateTranslations?.map((alt, index) => (
									<span key={index}>
										, {alt.translation}{index < selectedWord.translations.source.alternateTranslations?.length - 1 && ', '}
									</span>
								))}
							</span>
						)}
					</p>

					{selectedWord.translations.source.literal_translation && (
						<p className='text-lg'>
							<i>{selectedWord.translations.source.literal_translation}</i>
							{selectedWord.translations.source.alternateTranslations?.length > 0 && (
								<span>
									{selectedWord.translations.source.alternateTranslations?.map((alt, index) => (
										<span key={index}>
											{alt.literal_translation && (
												<span>
													, <i>{alt.literal_translation}</i>
												</span>
											)}
										</span>
									))}
								</span>
							)}
						</p>
					)}
					<hr className='mt-2'  />
        </>
      )}
    </div>
  );
}

export default ContentWindow;
