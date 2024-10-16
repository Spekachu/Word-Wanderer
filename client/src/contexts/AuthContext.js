import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [accessToken, setAccessToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
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
			const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/refresh-token`, {
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
			console.log('newAccessToken:', newAccessToken);
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
			setUser(null);
			return false;
		}
	};

  const register = async (email, password) => {
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
				credentials: 'include',
			});
			const data = await response.json();
			if (response.ok) {
				setAccessToken(data.accessToken);
				setIsLoggedIn(true);
				setUser(data.user);
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
			const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
				credentials: 'include',
			});
			const data = await response.json();
			if (response.ok) {
				setAccessToken(data.accessToken);
				setIsLoggedIn(true);
				setUser(data.user); // Ensure the backend sends user data
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
			await fetch(`${process.env.REACT_APP_API_URL}/api/users/logout`, {
				method: 'POST',
				credentials: 'include',
			});
			// Clear local state immediately
			setAccessToken(null);
			setIsLoggedIn(false);
			setUser(null);
			navigate('/');
			addNotification('Logged out successfully', 'success');
		} catch (error) {
			console.error('Logout error:', error);
			addNotification('An error occurred during logout', 'error');
		}
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
    <AuthContext.Provider value={{ isLoggedIn, user, register, login, logout, checkAuth, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);