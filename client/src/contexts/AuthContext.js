import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [accessToken, setAccessToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userWordAssociations, setUserWordAssociations] = useState({});
  const navigate = useNavigate();
  const { addNotification } = useNotification();
	const apiUrl = process.env.NODE_ENV === 'production' ? "/api" : process.env.REACT_APP_API_URL + "/api";

  useEffect(() => {
    let isMounted = true;
    const performAuthCheck = async () => {
      if (isMounted) {
        await checkAuth();
      }
    };
    performAuthCheck();
    return () => {
      isMounted = false;
    };
  }, []);

	const getAuthHeaders = () => {
		return {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		};
	};

	const refreshAccessToken = async () => {
		try {
			const response = await fetch(`${apiUrl}/user/refresh-token`, {
				method: 'POST',
				credentials: 'include',
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
			}
			const { accessToken, user, userWordAssociations } = await response.json();
			setAccessToken(accessToken);
			setCurrentUser(user);
			setUserWordAssociations(userWordAssociations);
			return { accessToken, user, userWordAssociations };
		} catch (error) {
			console.error('Error refreshing token:', error.message);
			logout();
			return null;
		}
	};

  const checkAuth = async () => {
		try {
			const result = await refreshAccessToken();
			if (result) {
				setIsLoggedIn(true);
				return true;
			} else {
				throw new Error('Failed to refresh token');
			}
		} catch (error) {
			console.error('Error checking authentication:', error.message);
			setAccessToken(null);
			setIsLoggedIn(false);
			setCurrentUser(null);
			setUserWordAssociations({});
			return false;
		}
	};

  const register = async (email, password) => {
		try {
			const response = await fetch(`${apiUrl}/user/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
				credentials: 'include',
			});
			const data = await response.json();
			if (response.ok) {
				setAccessToken(data.accessToken);
				setIsLoggedIn(true);
				setCurrentUser(data.user);
				navigate('/map');
				addNotification('Registration successful!', 'success');
			} else {
				addNotification(data.message || 'Registration failed', 'error');
			}
		} catch (error) {
			console.error('Registration error:', error);
			addNotification('An error occurred during registration', 'error');
		}
	};

  const login = async (email, password) => {
		try {
			const response = await fetch(`${apiUrl}/user/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
				credentials: 'include',
			});
			const data = await response.json();
			if (response.ok) {
				setAccessToken(data.accessToken);
				setIsLoggedIn(true);
				setCurrentUser(data.user); // Ensure the backend sends user data
				navigate('/map');
				addNotification('Login successful!', 'success');
			} else {
				addNotification(data.message || 'Login failed', 'error');
			}
		} catch (error) {
			console.error('Login error:', error);
			addNotification('An error occurred during login', 'error');
		}
	};

  const logout = async () => {
		try {
			await fetch(`${apiUrl}/user/logout`, {
				method: 'POST',
				credentials: 'include',
			});
			// Clear local state immediately
			setAccessToken(null);
			setIsLoggedIn(false);
			setCurrentUser(null);
			setUserWordAssociations({});
			addNotification('You are logged out', 'info');
		} catch (error) {
			console.error('Logout error:', error);
			addNotification('An error occurred during logout', 'error');
		}
	};
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${apiUrl}/user/update-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: currentUser.email, oldPassword:currentPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        addNotification('Password updated successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Update password error:', error);
      addNotification(error.message || 'An error occurred while updating password', 'error');
      throw error;
    }
  };

  const sendPasswordResetEmail = async (email) => {
    try {
      const response = await fetch(`${apiUrl}/user/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        addNotification('Password reset email sent', 'success');
      } else {
        throw new Error(data.message || 'Failed to send password reset email');
      }
    } catch (error) {
      console.error('Send password reset email error:', error);
      addNotification(error.message || 'An error occurred while sending password reset email', 'error');
      throw error;
    }
  };

  const deleteUser = async () => {
    // Implement delete user logic here
  };

	// Axios interceptor to handle token expiration
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newToken = await refreshAccessToken();
          if (newToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

	
  const updateUserWordAssociation = (wordId, emoji, highlightColor, languageCode) => {
    setUserWordAssociations(prevAssociations => ({
      ...prevAssociations,
      [wordId]: {
        ...prevAssociations[wordId],
        emoji,
        highlightColor,
        languageCodes: [...new Set([...(prevAssociations[wordId]?.languageCodes || []), languageCode])]
      }
    }));
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      currentUser, 
      register, 
      login, 
      logout, 
      checkAuth, 
      getAuthHeaders, 
      accessToken, 
      setAccessToken,
      updatePassword,
      sendPasswordResetEmail,
      userWordAssociations, setUserWordAssociations,
			updateUserWordAssociation,
      deleteUser,
			apiUrl
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
