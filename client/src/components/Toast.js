import React from 'react';

const Toast = ({ notification, onClose }) => {
  return (
    <div 
      className={`w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 sm:rounded shadow-lg text-white flex items-start justify-between gap-2
                  ${notification.exiting ? 'animate-slide-out-left' : 'animate-slide-in-left'}
                  transition-all duration-300 linear
                  ${
                    notification.type === 'error' ? 'bg-red-500' :
                    notification.type === 'success' ? 'bg-green-500' : 'bg-orange-500'
                  }`}
    >
      <span>{notification.message}</span>
      <button 
        onClick={onClose}
        className="text-white hover:text-gray-200 focus:outline-none text-lg leading-tight"
        aria-label="Close"
      >
        &times;
      </button>
    </div>
  );
};

export default Toast;