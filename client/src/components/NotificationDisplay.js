import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import Toast from './Toast';

const NotificationDisplay = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed w-full px-2 sm:px-0 sm:w-auto bottom-[max(env(safe-area-inset-bottom),0.5rem)] sm:bottom-[max(env(safe-area-inset-bottom),1rem)] left-0 sm:left-4 flex flex-col-reverse items-start gap-y-[1px] sm:gap-y-2 z-50">
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