/**
 * Finds the spot closest to the center [0,0] from an array of spots
 * @param {Array} spots - Array of [x,y] coordinates
 * @param {boolean} remove - Whether to remove the closest spot from the array
 * @returns {Array|null} The closest spot or null if no spots
 */
export function findClosestToCenter(spots, remove = false) {
  if (spots.length === 0) return null;

  let closestSpotIndex = 0;
  let closestSpot = spots[0];
  let minDistance = Math.sqrt(closestSpot[0] ** 2 + closestSpot[1] ** 2);

  spots.forEach((spot, index) => {
    const distance = Math.sqrt(spot[0] ** 2 + spot[1] ** 2);

    if (distance < minDistance) {
      minDistance = distance;
      closestSpot = spot;
      closestSpotIndex = index;
    }
  });

  if (remove) {
    spots.splice(closestSpotIndex, 1);
  }

  return closestSpot;
}

/**
 * Calculates word positions in a quadrant-based layout
 * @param {Array} wordList - List of words to position
 * @param {Array} wordRefs - References to word DOM elements
 * @param {Object} mapRef - Reference to the map container
 * @returns {Object} Calculated positions and dimensions
 */
export function calculateWordPositions(wordList, wordRefs, mapRef) {
  if (!wordList?.length || !mapRef.current) return { positions: [], wordDimensions: [] };

  const newPositions = [];
  const newWordDimensions = [];
  let currentDirection = -1;
  let quadrantSpots = {
    right: [],
    down: [],
    left: [],
    up: []
  };

  wordList.forEach((word, index) => {
    let centerX = 0, centerY = 0;
    const wordHalfWidth = (wordRefs.current[index]?.offsetWidth + 4) / 2 || 0;
    const wordHalfHeight = (wordRefs.current[index]?.offsetHeight + 4) / 2 || 0;
    newWordDimensions.push({
      width: wordRefs.current[index]?.offsetWidth,
      height: wordRefs.current[index]?.offsetHeight
    });

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

    currentDirection++;
    if (currentDirection > 3) {
      currentDirection = 0;
    }
  });

  return { positions: newPositions, wordDimensions: newWordDimensions };
}

/**
 * Handles zooming calculations
 * @param {number} zoomDelta - Amount to change zoom by
 * @param {number} currentZoom - Current zoom level
 * @param {number} zoomMin - Minimum zoom level
 * @param {number} zoomMax - Maximum zoom level
 * @returns {number} New zoom level
 */
export function calculateZoom(zoomDelta, currentZoom, zoomMin, zoomMax) {
  return Number((Math.min(Math.max(currentZoom + zoomDelta, zoomMin), zoomMax)).toFixed(2));
}

/**
 * Handles panning calculations
 * @param {number} deltaX - X movement amount
 * @param {number} deltaY - Y movement amount
 * @param {Object} currentOffset - Current pan offset {x, y}
 * @param {Object} mapRect - Map container dimensions
 * @returns {Object} New pan offset {x, y}
 */
export function calculatePan(deltaX, deltaY, currentOffset, mapRect) {
  const minX = -mapRect.width / 2;
  const maxX = mapRect.width / 2;
  const minY = -mapRect.height / 2;
  const maxY = mapRect.height / 2;

  return {
    x: Math.max(minX, Math.min(maxX, currentOffset.x + deltaX)),
    y: Math.max(minY, Math.min(maxY, currentOffset.y + deltaY))
  };
}
