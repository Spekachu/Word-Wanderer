export const fetchWords = async (userLanguage, userLearningLanguage, cefrLevel, partOfSpeech, addNotification, getAuthHeaders, setAccessToken) => {
  try {
    // Fetch words (can be cached)
    const wordsResponse = await fetch(
      `${process.env.REACT_APP_API_URL}/api/words?sourceLanguage=${userLanguage}&targetLanguage=${userLearningLanguage}&level=${cefrLevel}&partOfSpeech=${partOfSpeech}`,
      {
        headers: getAuthHeaders()
      }
    );

    if (!wordsResponse.ok) {
      throw new Error('Failed to fetch words');
    }

    const words = await wordsResponse.json();

    const newAccessToken = wordsResponse.headers.get('Access-Token');
    if (newAccessToken) {
      setAccessToken(newAccessToken);
    }

    return words;
  } catch (err) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      addNotification("Network error. Please check your connection and try again.", "error");
    } else {
      addNotification(err.message || "An unexpected error occurred. Please try again later.", "error");
    }
    throw err;
  }
};