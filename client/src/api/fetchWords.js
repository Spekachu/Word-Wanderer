import { getAuthHeaders, checkAuth, logout, setAccessToken } from '../contexts/AuthContext';

export const fetchWords = async (userLanguage, userLearningLanguage, cefrLevel, partOfSpeech, addNotification, getAuthHeaders, checkAuth, logout, setAccessToken) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/words?sourceLanguage=${userLanguage}&targetLanguage=${userLearningLanguage}&level=${cefrLevel}&partOfSpeech=${partOfSpeech}`,
      {
        credentials: 'include',
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        const isRefreshed = await checkAuth();
        if (isRefreshed) {
          return fetchWords(userLanguage, userLearningLanguage, cefrLevel, partOfSpeech);
        } else {
          addNotification("Your session has expired. Please log in again.", "error");
          logout();
          throw new Error('Authentication failed');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch words');
      }
    }

    const newAccessToken = response.headers.get('Access-Token');
    if (newAccessToken) {
      setAccessToken(newAccessToken);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      addNotification("Network error. Please check your connection and try again.", "error");
    } else {
      addNotification(err.message || "An unexpected error occurred. Please try again later.", "error");
    }
    throw err;
  }
};