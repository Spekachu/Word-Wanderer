import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/refresh-token`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        setIsLoggedIn(true);
        // You might want to fetch and set user data here
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsLoggedIn(false);
      setUser(null);
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
        setIsLoggedIn(true);
        setUser(data.user);
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
      setIsLoggedIn(false);
      setUser(null);
      navigate('/');
      addNotification('Logged out successfully', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      addNotification('An error occurred during logout', 'error');
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, register, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);