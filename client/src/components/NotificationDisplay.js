import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import Toast from './Toast';

const NotificationDisplay = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed w-full sm:w-auto bottom-0 sm:bottom-4 left-0 sm:left-4 flex flex-col-reverse items-start gap-y-[1px] sm:gap-y-2 z-50">
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