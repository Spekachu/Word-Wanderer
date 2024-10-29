export const fetchUserPreferences = async (userId, getAuthHeaders) => {
	const apiUrl = process.env.NODE_ENV === 'production' ? "/api" : process.env.REACT_APP_API_URL + "/api";
  const response = await fetch(`${apiUrl}/user/user-preferences/${userId}`,
		{
			credentials: 'include',
			headers: getAuthHeaders()
		});
  return response.json();
};