export const saveUserPreferences = async (userId, preferences, getAuthHeaders) => {
	const apiUrl = process.env.NODE_ENV === 'production' ? "/api" : process.env.REACT_APP_API_URL + "/api";
  const response = await fetch(`${apiUrl}/user/user-preferences/${userId}`, {
    method: 'POST',
		credentials: 'include',
		headers: getAuthHeaders(),
    body: JSON.stringify(preferences),
  });
  return response.json();
};