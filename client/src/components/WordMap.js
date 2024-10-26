import React, { useEffect, useState, useRef, useCallback, useContext, useMemo } from 'react';
import Word from './Word';
import { AppContext } from '../contexts/AppContext';
import useDebounce from '../utils/useDebounce';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchWords } from '../api/fetchWords';
import { fetchUserWordAssociations } from '../api/fetchUserWordAssociations';
import { useAnimationFrame } from '../hooks/useAnimationFrame';
import { useGesture } from '@use-gesture/react';
import Slider from '@mui/material/Slider';

const WordMap = () => {
	const { addNotification } = useNotification();
	const { getAuthHeaders, accessToken, setAccessToken, isLoggedIn, setUserWordAssociations } = useAuth();
	const { 
		isDragging, 
		setIsDragging, 
		partOfSpeech,
		cefrLevel,
		relatedContext,
		userLanguage,
		userLearningLanguage		
	} = useContext(AppContext);
	const [wordList, setWordList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const wordRefs = useRef([]); // To store references to word elements
	const mapRef = useRef(null); // Reference to the word map container
	const [panOffset, setPanOffset] = useState({ x: 0, y: 0 }); // Current offset
  const [zoomLevel, setZoomLevel] = useState(0.75); // Zoom level
  const zoomMin = 0.5;
  const zoomMax = 1;
	const [positions, setPositions] = useState([null]);
	const [wordDimensions, setWordDimensions] = useState([null]);
	const [dragStartTime, setDragStartTime] = useState(null);
	const dragThreshold = 100; // milliseconds

	const debouncedPartOfSpeech = useDebounce(partOfSpeech, 300);
  const debouncedCefrLevel = useDebounce(cefrLevel, 300);
  const debouncedUserLanguage = useDebounce(userLanguage, 300);
  const debouncedUserLearningLanguage = useDebounce(userLearningLanguage, 300);

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
			const newZoomLevel = Math.min(Math.max(zoomLevel + zoomDelta, zoomMin), zoomMax);
			setZoomLevel(newZoomLevel);
		});
	}, [zoomLevel, queueUpdate]);

	const handlePan = useCallback((deltaX, deltaY) => {
		queueUpdate(() => {
			const mapRect = mapRef.current.getBoundingClientRect();
			const minX = -mapRect.width / 2;
			const maxX = mapRect.width / 2;
			const minY = -mapRect.height / 2;
			const maxY = mapRect.height / 2;

			const newOffsetX = Math.max(minX, Math.min(maxX, panOffset.x + deltaX));
			const newOffsetY = Math.max(minY, Math.min(maxY, panOffset.y + deltaY));

			setPanOffset({ x: newOffsetX, y: newOffsetY });
		});
	}, [panOffset, queueUpdate]);

	useEffect(() => {
		const getWords = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await fetchWords(
					debouncedUserLanguage,
					debouncedUserLearningLanguage,
					debouncedCefrLevel,
					debouncedPartOfSpeech,
					addNotification
				);
				setWordList(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		getWords();
	}, [debouncedUserLanguage, debouncedUserLearningLanguage, debouncedCefrLevel, debouncedPartOfSpeech]);

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
		if (isLoggedIn && wordList.length && accessToken.length) {
			getUserWordAssociations();
		}
	}, [isLoggedIn, wordList, accessToken]);

	useEffect(() => {
		if (!wordList.length || !mapRef.current) return;

		const newPositions = [];
		const newWordDimensions = [];

		let currentDirection = -1; // Start with 'right'
		let quadrantSpots = {
			// alternating, row 0 is center row, col 0 is center col. odd rows go down, even rows go up, odd cols go down, even cols go up
			right: [],
			down: [],
			left: [],
			up: []
		};
		//each time a word gets placed, it creates an available point next to it

		wordList.forEach((word, index) => {
			let centerX = 0, centerY = 0;
			const wordHalfWidth = (wordRefs.current[index]?.offsetWidth + 4) / 2 || 0;
			const wordHalfHeight = (wordRefs.current[index]?.offsetHeight + 4) / 2 || 0;
			newWordDimensions.push({width: wordRefs.current[index]?.offsetWidth, height: wordRefs.current[index]?.offsetHeight});

			let addPos = false;
			if (index > 0) {
				if (currentDirection === 1) { // Down quadrant
					if (quadrantSpots.down.length > 0) {
						centerX = quadrantSpots.down[0][0];
						centerY = quadrantSpots.down[0][1] + wordHalfHeight;

						const temp = quadrantSpots.right.concat(quadrantSpots.left).concat(quadrantSpots.down);
						const closest = findClosestToCenter(temp);
						if (closest === quadrantSpots.down[0]) {

							quadrantSpots.down.shift();

							quadrantSpots.down.push([centerX, centerY + wordHalfHeight]);
							quadrantSpots.right.push([centerX + wordHalfWidth, centerY]);
							quadrantSpots.left.push([centerX - wordHalfWidth, centerY]);

							addPos = true;
						} else {
							currentDirection++;
						}
					}
				}
				if (currentDirection === 3) { // Up quadrant
					if (quadrantSpots.up.length > 0) {
						centerX = quadrantSpots.up[0][0];
						centerY = quadrantSpots.up[0][1] - wordHalfHeight;

						const temp = quadrantSpots.right.concat(quadrantSpots.left).concat(quadrantSpots.up);
						const closest = findClosestToCenter(temp);
						if (closest === quadrantSpots.up[0]) {
							quadrantSpots.up.shift();

							quadrantSpots.up.push([centerX, centerY - wordHalfHeight]);
							quadrantSpots.right.push([centerX + wordHalfWidth, centerY]);
							quadrantSpots.left.push([centerX - wordHalfWidth, centerY]);
							
							addPos = true;
						} else {
							currentDirection = 0;
						}
					}
				}
				if (currentDirection === 0) { // Right quadrant
					if (quadrantSpots.right.length > 0) {
						const closest = findClosestToCenter(quadrantSpots.right, true);
						centerX = closest[0] + wordHalfWidth;
						centerY = closest[1];

						quadrantSpots.right.push([centerX + wordHalfWidth, centerY]);

						addPos = true;
					}
				}
				if (currentDirection === 2) { // Left quadrant
					if (quadrantSpots.left.length > 0) {

						const closest = findClosestToCenter(quadrantSpots.left, true);
						centerX = closest[0] - wordHalfWidth;
						centerY = closest[1];

						quadrantSpots.left.push([centerX - wordHalfWidth, centerY]);

						addPos = true;
					}
				}
			} else { // First word at the center
				quadrantSpots.right.push([wordHalfWidth, 0]);
				quadrantSpots.down.push([0, wordHalfHeight]);
				quadrantSpots.left.push([-wordHalfWidth, 0]);
				quadrantSpots.up.push([0, -wordHalfHeight]);

				// console.log(quadrantSpots);
				addPos = true;
			}
			if (addPos) {
				newPositions.push({ centerX, centerY });
				if (mapRef.current) {
					if (Math.abs((centerX + wordHalfWidth) * 2) > mapRef.current.offsetWidth) {
						mapRef.current.style.width = `${Math.abs((centerX + wordHalfWidth)*2)}px`;
					}
					if (Math.abs((centerY + wordHalfHeight) * 2) > mapRef.current.offsetHeight) {
						mapRef.current.style.height = `${Math.abs((centerY + wordHalfHeight)*2)}px`;
					}
				}
			}

			// Move to the next quadrant
			currentDirection++;
			if (currentDirection > 3) {
				currentDirection = 0;
			}
		});

		setPositions(newPositions);
		setWordDimensions(newWordDimensions);
		if (wordList.length && newPositions.length && mapRef.current) {
			mapRef.current.classList.add("loaded");
		}
	}, [wordList]);

	function findClosestToCenter(spots, remove = false) {
		if (spots.length === 0) return null; // Return null if no spots are given

		let closestSpotIndex = 0;
		let closestSpot = spots[0];
		let minDistance = Math.sqrt(closestSpot[0] ** 2 + closestSpot[1] ** 2); // Initial distance to [0,0]

		spots.forEach((spot, index) => {
			const distance = Math.sqrt(spot[0] ** 2 + spot[1] ** 2); // Calculate distance from center

			if (distance < minDistance) {
				minDistance = distance;
				closestSpot = spot;
				closestSpotIndex = index;
			}
		});

		// If the 'remove' flag is true, remove the closest spot from the array
		if (remove) {
			spots.splice(closestSpotIndex, 1);
		}

		return closestSpot;
	}
	
	if (error) {
		return <div>Error: {error.message}</div>;
	}

	const handleSliderChange = (event, newValue) => {
		setZoomLevel(newValue);
	};

	return (
		<>
			<div 
				className={`word-map text-white w-full h-dvh overflow-hidden fixed top-0 left-0 touch-none transition-opacity duration-300 ${
					loading ? 'opacity-0' : 'opacity-100'
				}`}
				style={{
					cursor: isDragging ? 'grabbing' : 'grab',
				}}
				{...bind()}
			>
				<div className="absolute left-1/2 top-1/2 transform-gpu -translate-x-1/2 -translate-y-1/2">
					<div ref={mapRef} className='will-change-transform' 
					style={{
						transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoomLevel})`
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
					</div>
				</div>
				
			</div>
			<div className="fixed right-2 top-16 w-36 backdrop-blur-sm bg-black/10 rounded-full h-4 flex items-center justify-center px-2">
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
