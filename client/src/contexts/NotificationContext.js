import React, { createContext, useState, useContext, useCallback, useRef } from 'react';

const NotificationContext = createContext();

let notificationId = 0;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const animatingNotifications = useRef(new Set());

  const removeNotification = useCallback((id) => {
    setNotifications(prevNotifications => {
      const notificationToRemove = prevNotifications.find(n => n.id === id);
      if (notificationToRemove && !animatingNotifications.current.has(id)) {
        animatingNotifications.current.add(id);
        notificationToRemove.exiting = true;
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
          animatingNotifications.current.delete(id);
        }, 300); // Duration of the slide-out animation
        return [...prevNotifications];
      }
      return prevNotifications;
    });
  }, []);

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = `${Date.now()}-${notificationId++}`;
    
    // Remove any existing notifications with the same message
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.message !== message)
    );

    // Add the new notification
    setNotifications(prevNotifications => [
      { id, message, type, exiting: false },
      ...prevNotifications
    ]);

    // Set up auto-dismiss
    setTimeout(() => removeNotification(id), duration);
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);