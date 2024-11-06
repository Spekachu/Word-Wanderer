import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import Word from './Word';
import { AppContext } from '../contexts/AppContext';
import { WordMapContext } from '../contexts/WordMapContext';
import useDebounce from '../utils/useDebounce';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchWords } from '../api/fetchWords';
import { fetchUserWordAssociations } from '../api/fetchUserWordAssociations';
import { useAnimationFrame } from '../hooks/useAnimationFrame';
import { useGesture } from '@use-gesture/react';
import Slider from '@mui/material/Slider';
import MapPin from './MapPin';
import HoverMapPin from './HoverMapPin';
import useWordListCache from '../utils/useWordListCache';
import { calculateWordPositions, calculateZoom, calculatePan } from '../utils/wordMapCalculations';

const WordMap = () => {
	const { addNotification } = useNotification();
	const { getAuthHeaders, accessToken, setAccessToken, isLoggedIn, setUserWordAssociations, checkAuth } = useAuth();
	const { 
		isDragging, 
		setIsDragging, 
		partOfSpeech,
		cefrLevel,
		relatedContext,
		userLanguage,
		userLearningLanguage,
		zoomLevel, setZoomLevel	
	} = useContext(AppContext);
	const { panOffset, setPanOffset } = useContext(WordMapContext);
	const wordRefs = useRef([]); // To store references to word elements
	const mapRef = useRef(null); // Reference to the word map container
	const zoomMin = 0.5;
	const zoomMax = 1;
	const [dragStartTime, setDragStartTime] = useState(null);
	const dragThreshold = 100; // milliseconds

	const debouncedPartOfSpeech = useDebounce(partOfSpeech, 300);
	const debouncedCefrLevel = useDebounce(cefrLevel, 300);
	const debouncedUserLanguage = useDebounce(userLanguage, 300);
	const debouncedUserLearningLanguage = useDebounce(userLearningLanguage, 300);

	const { 
		data: wordList, 
		positions,
		wordDimensions,
		updatePositionsAndDimensions,
		isLoading, 
		error 
	} = useWordListCache(
		fetchWords,
		debouncedUserLanguage,
		debouncedUserLearningLanguage,
		debouncedCefrLevel,
		debouncedPartOfSpeech,
		addNotification
	);

	const queueUpdate = useAnimationFrame();

	const bind = useGesture({
		onWheel: ({ delta: [, dy] }) => {
			handleZoom(-dy * 0.001);
		},
		onDragStart: () => {
			setDragStartTime(performance.now());
		},
		onDrag: ({ delta: [dx, dy], movement: [mx, my], timeStamp }) => {
			if (dragStartTime && timeStamp - dragStartTime > dragThreshold) {
				setIsDragging(true);
			}
			handlePan(dx, dy);
		},
		onDragEnd: () => {
			setIsDragging(false);
			setDragStartTime(null);
		},
	}, {
		eventOptions: { passive: false }
	});

	const handleZoom = useCallback((zoomDelta) => {
		queueUpdate(() => {
			const newZoomLevel = calculateZoom(zoomDelta, zoomLevel, zoomMin, zoomMax);
			setZoomLevel(newZoomLevel);
		});
	}, [zoomLevel, queueUpdate]);

	const handlePan = useCallback((deltaX, deltaY) => {
		queueUpdate(() => {
			if (!mapRef.current) return;
			const mapRect = mapRef.current.getBoundingClientRect();
			const newOffset = calculatePan(deltaX, deltaY, panOffset, mapRect);
			setPanOffset(newOffset);
		});
	}, [panOffset, queueUpdate]);

	useEffect(() => {
		const getUserWordAssociations = async () => {
			try {
				const data = await fetchUserWordAssociations(
					addNotification, getAuthHeaders, setAccessToken
				);
				setUserWordAssociations(data);
			} catch (err) {
				setUserWordAssociations({});
				console.log("ERROR getting user word associations", err);
			}
		};
		if (checkAuth()) {
			getUserWordAssociations();
		}
	}, [isLoggedIn, wordList, accessToken]);

	useEffect(() => {
		if (!wordList?.length || !mapRef.current) return;

		const { positions: newPositions, wordDimensions: newWordDimensions } = calculateWordPositions(wordList, wordRefs, mapRef);

		if (newPositions.length && newWordDimensions.length) {
			updatePositionsAndDimensions(newPositions, newWordDimensions);
		}
		if (wordList.length && newPositions.length && mapRef.current) {
			mapRef.current.classList.add("loaded");
		}
	}, [wordList, updatePositionsAndDimensions]);
	
	if (error) {
		return <div>Error: {error}</div>;
	}

	const handleSliderChange = (event, newValue) => {
		setZoomLevel(newValue);
	};

	const renderContent = () => {
		if (isLoading) {
			return (
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="relative w-24 h-24">
						<div className="inset-4 absolute w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
						<div className="inset-0 absolute w-24 h-24 border-4 border-white border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite]"></div>
					</div>
				</div>
			);
		}

		return (
			<div className="absolute left-1/2 top-1/2 transform-gpu -translate-x-1/2 -translate-y-1/2">
				<div ref={mapRef} className='will-change-transform' 
				style={{
					transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoomLevel})`,
					transition: isDragging ? 'none' : 'transform 0.5s ease-out',
				}}>
					{wordList?.map((word, index) => (
						<Word
							key={word.id}
							index={index}
							word={word}
							position={positions[index] || { centerX: 0, centerY: 0 }}
							dimensions={wordDimensions[index] || { width: 0, height: 0 }}
							ref={(el) => (wordRefs.current[index] = el)}
						/>
					))}
					<HoverMapPin />
					<MapPin />
				</div>
			</div>
		);
	};

	return (
		<>
			<div 
				className={`word-map text-white w-full h-dvh overflow-hidden fixed top-0 left-0 touch-none`}
				style={{
					cursor: isDragging ? 'grabbing' : 'grab',
				}}
				{...bind()}
			>
				{renderContent()}
			</div>
			<div className="fixed right-2 top-[calc(4rem+env(safe-area-inset-top))] w-36 backdrop-blur-sm bg-[#8a5663] bg-opacity-50 rounded-full h-4 flex items-center justify-center px-2">
				<Slider
					value={zoomLevel}
					min={zoomMin}
					max={zoomMax}
					step={0.01}
					onChange={handleSliderChange}
					aria-labelledby="zoom-slider"
					size="small"
					color="white"
				/>
			</div>
		</>
	);
};

export default WordMap;
