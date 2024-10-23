export const fetchUserWordAssociations = async (addNotification, getAuthHeaders, setAccessToken) => {
  try {

    // Fetch user word associations (should not be cached)
		const apiUrl = process.env.NODE_ENV === 'production' ? "/api" : process.env.REACT_APP_API_URL + "/api";
    const associationsResponse = await fetch(
      `${apiUrl}/user/word-associations`,
      {
        credentials: 'include',
        headers: getAuthHeaders()
      }
    );

    const associationsMap = await associationsResponse.json();

    return associationsMap;
  } catch (err) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      addNotification("Network error. Please check your connection and try again.", "error");
    } else {
      addNotification(err.message || "An unexpected error occurred. Please try again later.", "error");
    }
    throw err;
  }
};