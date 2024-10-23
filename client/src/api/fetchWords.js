export const fetchWords = async (userLanguage, userLearningLanguage, cefrLevel, partOfSpeech, addNotification) => {
  try {
    // Fetch words (can be cached)
		const apiUrl = process.env.NODE_ENV === 'production' ? "/api" : process.env.REACT_APP_API_URL + "/api";
    const wordsResponse = await fetch(
      `${apiUrl}/words?sourceLanguage=${userLanguage}&targetLanguage=${userLearningLanguage}&level=${cefrLevel}&partOfSpeech=${partOfSpeech}`
    );

    if (!wordsResponse.ok) {
      throw new Error('Failed to fetch words');
    }

    const words = await wordsResponse.json();

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