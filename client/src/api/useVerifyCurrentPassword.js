import { useAuth } from '../contexts/AuthContext';

export const useVerifyCurrentPassword = () => {
	const {apiUrl, currentUser, getAuthHeaders} = useAuth();
	
  const verifyCurrentPassword = async (password) => {
		try {
			const response = await fetch(`${apiUrl}/user/verify-password`, {
				method: 'POST',
				credentials: 'include',
				headers: getAuthHeaders(),
				body: JSON.stringify({ email: currentUser.email, password }),
			});

			if (!response.ok) {
				throw new Error('Failed to verify password');
			}

			const data = await response.json();
			return data.isValid;
		} catch (error) {
			console.error('Error verifying password:', error);
			return false;
		}};

  return verifyCurrentPassword;
};
