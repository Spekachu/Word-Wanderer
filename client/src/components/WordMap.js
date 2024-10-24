import React, { useEffect, useState, useRef, useCallback, useContext, useMemo } from 'react';
import Word from './Word';
import { AppContext } from '../contexts/AppContext';
import useDebounce from '../utils/useDebounce';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchWords } from '../api/fetchWords';
import { fetchUserWordAssociations } from '../api/fetchUserWordAssociations';

const WordMap = () => {
	const { addNotification } = useNotification();
	const { getAuthHeaders, accessToken, setAccessToken, isLoggedIn } = useAuth();
	const { 
		isDragging, 
		setIsDragging, 
		partOfSpeech,
		cefrLevel,
		relatedContext,
		userLanguage,
		userLearningLanguage,
		setUserWordAssociations
	} = useContext(AppContext);
	const [wordList, setWordList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const wordRefs = useRef([]); // To store references to word elements
	const mapRef = useRef(null); // Reference to the word map container
	const [panOffset, setPanOffset] = useState({ x: 0, y: 0 }); // Current offset
	const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1); // Zoom level
  const zoomMin = 0.5;
  const zoomMax = 2;
  const [isMouseDown, setIsMouseDown] = useState(false); // Zoom level
	const [positions, setPositions] = useState([null]);
	const [wordDimensions, setWordDimensions] = useState([null]);

	const debouncedPartOfSpeech = useDebounce(partOfSpeech, 300);
  const debouncedCefrLevel = useDebounce(cefrLevel, 300);
  const debouncedUserLanguage = useDebounce(userLanguage, 300);
  const debouncedUserLearningLanguage = useDebounce(userLearningLanguage, 300);

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
    } else {
			console.log("Not logged in or no word list or no access token");
      setUserWordAssociations({});
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

	// Handle mousedown event
	const handleMouseDown = (e) => {
		setIsMouseDown(true);
		setLastMousePos({ x: e.clientX ? e.clientX : e?.touches[0]?.clientX, y: e.clientY ? e.clientY : e.touches[0].clientY });
	};
	// Handle touchstart event
	const handleTouchStart = (e) => {
		handleMouseDown(e);
	};
	
	// Handle mousemove event (when dragging)
	const handleMouseMove = useCallback((e) => {
    if (!isMouseDown) return;
		// console.log("TOUCH MOVE");

		let cX = e.clientX ? e?.clientX : e?.touches[0]?.clientX;
		let cY = e.clientY ? e?.clientY : e?.touches[0]?.clientY;
		
		const deltaX = cX - lastMousePos.x;
		const deltaY = cY - lastMousePos.y;

		// console.log(lastMousePos.x, lastMousePos.y);
		if (Math.abs(deltaX) > 15 || Math.abs(deltaY) > 5) {
			setIsDragging(true);
		}

    let newOffsetX = panOffset.x + deltaX;
    let newOffsetY = panOffset.y + deltaY;

    // Calculate boundaries (prevent dragging out of screen bounds)
    const mapRect = mapRef.current.getBoundingClientRect();

    const minX = -mapRect.width / 2;
    const maxX = mapRect.width / 2;
    const minY = -mapRect.height / 2;
    const maxY = mapRect.height / 2;

		if (newOffsetX < minX) {
			newOffsetX = minX;
		} else if (newOffsetX > maxX) {
			newOffsetX = maxX;
		}
		if (newOffsetY < minY) {
			newOffsetY = minY;
		} else if (newOffsetY > maxY) {
			newOffsetY = maxY;
		}

    setPanOffset({
      x: newOffsetX,
      y: newOffsetY,
    });

    // Update last mouse position
		setLastMousePos({ x: e.clientX ? e.clientX : e?.touches[0]?.clientX, y: e.clientY ? e.clientY : e.touches[0].clientY });
  }, [lastMousePos, panOffset, isMouseDown, setIsDragging]);

	// Handle mouseup event (stop dragging)
	const handleMouseUp = () => {
		setIsDragging(false);
		setIsMouseDown(false);
	};
	
	// Handle zoom via scroll wheel
  const handleWheel = useCallback((e) => {
    // e.preventDefault();
    const zoomDelta = e.deltaY * -0.001; // Adjust zoom speed
    const newZoomLevel = Math.min(Math.max(zoomLevel + zoomDelta, zoomMin), zoomMax); // Bound the zoom level
    const mapRect = mapRef.current.getBoundingClientRect();
		
		let newOffset = panOffset;
		
    const minX = -mapRect.width / 2;
    const maxX = mapRect.width / 2;
    const minY = -mapRect.height / 2;
    const maxY = mapRect.height / 2;

		if (newOffset.x < minX) {
			newOffset.x = minX;
		} else if (newOffset.x > maxX) {
			newOffset.x = maxX;
		}
		if (newOffset.y < minY) {
			newOffset.y = minY;
		} else if (newOffset.y > maxY) {
			newOffset.y = maxY;
		}
		setPanOffset({
			x: newOffset.x,
			y: newOffset.y,
		});

    setZoomLevel(newZoomLevel);
  }, [panOffset, zoomLevel]);

	useEffect(() => {
		const mapContainer = mapRef.current;
    // Add wheel event only to the map container
    if (mapContainer) {
      mapContainer.addEventListener('wheel', handleWheel);
    }

		return () => {
			// Clean up event listeners when the component unmounts
      if (mapContainer) {
        mapContainer.removeEventListener('wheel', handleWheel);
      }
		};
  });

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	return (
		<div className="word-map text-white w-full h-dvh overflow-hidden fixed top-0 left-0 touch-none"
			onMouseDown={handleMouseDown} 
			onTouchStart={handleTouchStart} 
			onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
			onTouchCancel={handleMouseUp}
			style={{
				cursor: isMouseDown ? 'grabbing' : 'grab', // Change cursor when dragging
			}}>
			<div ref={mapRef} className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform' 
			style={{
				transform: `translate3d(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px), 0) scale(${zoomLevel})`, // Apply panning offset
			}}>
				{wordList?.map((word, index) => (
					<Word
						key={word.id}
						index={index}
						word={word}
						position={positions[index] || { centerX: 0, centerY: 0 }}
						loaded={mapRef.current?.classList.contains("loaded")}
						dimensions={wordDimensions[index] || { width: 0, height: 0 }}
						ref={(el) => (wordRefs.current[index] = el)}
					/>
				))}
			</div>
		</div>
	);
};

export default WordMap;
