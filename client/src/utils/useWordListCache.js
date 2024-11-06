import { useState, useEffect, useCallback } from 'react';

const CACHE_EXPIRATION = 60 * 60 * 1000; // 1 hour in milliseconds

const cache = new Map();

const generateCacheKey = (language, learningLanguage, cefrLevel, partOfSpeech) => {
  return `${language}-${learningLanguage}-${cefrLevel}-${partOfSpeech}`;
};

const useWordListCache = (
  fetchFunction,
  language,
  learningLanguage,
  cefrLevel,
  partOfSpeech,
  addNotification
) => {
  const [data, setData] = useState(null);
  const [positions, setPositions] = useState([]);
  const [wordDimensions, setWordDimensions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear cache when filters change
  useEffect(() => {
    const cacheKey = generateCacheKey(language, learningLanguage, cefrLevel, partOfSpeech);
    cache.delete(cacheKey);
  }, [language, learningLanguage, cefrLevel, partOfSpeech]);

  useEffect(() => {
    const fetchData = async () => {
      const cacheKey = generateCacheKey(language, learningLanguage, cefrLevel, partOfSpeech);

      try {
        setIsLoading(true);
        setError(null);
        const newData = await fetchFunction(
          language,
          learningLanguage,
          cefrLevel,
          partOfSpeech,
          addNotification
        );

        // Store in cache with timestamp
        cache.set(cacheKey, {
          data: newData,
          positions: [],
          wordDimensions: [],
          timestamp: Date.now()
        });

        setData(newData);
        setPositions([]);
        setWordDimensions([]);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [language, learningLanguage, cefrLevel, partOfSpeech, fetchFunction, addNotification]);

  const invalidateCache = useCallback(() => {
    const cacheKey = generateCacheKey(language, learningLanguage, cefrLevel, partOfSpeech);
    cache.delete(cacheKey);
  }, [language, learningLanguage, cefrLevel, partOfSpeech]);

  const updatePositionsAndDimensions = useCallback((newPositions, newWordDimensions) => {
    const cacheKey = generateCacheKey(language, learningLanguage, cefrLevel, partOfSpeech);
    const cachedData = cache.get(cacheKey);
    
    // Only update if values have changed
    const positionsChanged = JSON.stringify(positions) !== JSON.stringify(newPositions);
    const dimensionsChanged = JSON.stringify(wordDimensions) !== JSON.stringify(newWordDimensions);
    
    if (cachedData && (positionsChanged || dimensionsChanged)) {
      cache.set(cacheKey, {
        ...cachedData,
        positions: newPositions,
        wordDimensions: newWordDimensions,
      });
      if (positionsChanged) setPositions(newPositions);
      if (dimensionsChanged) setWordDimensions(newWordDimensions);
    }
  }, [language, learningLanguage, cefrLevel, partOfSpeech, positions, wordDimensions]);

  return { 
    data, 
    positions, 
    wordDimensions, 
    isLoading, 
    error, 
    invalidateCache,
    updatePositionsAndDimensions 
  };
};

export default useWordListCache;
