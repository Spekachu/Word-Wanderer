import { useAuth } from '../contexts/AuthContext';

export const useVerifyCurrentPassword = async (email, password, getAuthHeaders) => {
	const {apiUrl} = useAuth();
	try {
		const response = await fetch(`${apiUrl}/api/user/verify-password`, {
			method: 'POST',
			credentials: 'include',
			headers: getAuthHeaders(),
			body: JSON.stringify({ email, password }),
		});

		if (!response.ok) {
			throw new Error('Failed to verify password');
		}

		const data = await response.json();
		return data.isValid;
	} catch (error) {
		console.error('Error verifying password:', error);
		return false;
	}
};
