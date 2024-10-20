import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [accessToken, setAccessToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  useEffect(() => {
    checkAuth();
  }, []);

	const getAuthHeaders = () => {
		return {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		};
	};

	const refreshAccessToken = async () => {
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/refresh-token`, {
				method: 'POST',
				credentials: 'include',
			});
			if (response.ok) {
				const { accessToken } = await response.json();
				setAccessToken(accessToken);
				return accessToken;
			} else {
				throw new Error('Failed to refresh token');
			}
		} catch (error) {
			console.error('Error refreshing token:', error);
			logout();
			return null;
		}
	};

  const checkAuth = async () => {
		try {
			const newAccessToken = await refreshAccessToken();
			// console.log('newAccessToken:', newAccessToken);
			if (newAccessToken) {
				setIsLoggedIn(true);
				// Optionally fetch user data here if needed
				return true;
			} else {
				throw new Error('Failed to refresh token');
			}
		} catch (error) {
			console.error('Error checking authentication:', error);
			setAccessToken(null);
			setIsLoggedIn(false);
			setCurrentUser(null);
			return false;
		}
	};

  const register = async (email, password) => {
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/register`, {
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
			const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/login`, {
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
			await fetch(`${process.env.REACT_APP_API_URL}/api/user/logout`, {
				method: 'POST',
				credentials: 'include',
			});
			// Clear local state immediately
			setAccessToken(null);
			setIsLoggedIn(false);
			setCurrentUser(null);
			navigate('/');
			addNotification('Logged out successfully', 'success');
		} catch (error) {
			console.error('Logout error:', error);
			addNotification('An error occurred during logout', 'error');
		}
	};
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/update-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/forgot-password`, {
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
      deleteUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);