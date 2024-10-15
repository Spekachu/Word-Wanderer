import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import Toast from './Toast';

const NotificationDisplay = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed bottom-4 left-4 flex flex-col-reverse items-start space-y-2 space-y-reverse z-50">
      {notifications.map((notification) => (
        <Toast 
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationDisplay;