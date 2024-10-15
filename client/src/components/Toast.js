import React from 'react';

const Toast = ({ notification, onClose }) => {
  return (
    <div 
      className={`px-4 py-2 rounded shadow-lg text-white flex items-center justify-between
                  ${notification.exiting ? 'animate-slide-out-left' : 'animate-slide-in-left'}
                  transition-all duration-300 linear
                  ${
                    notification.type === 'error' ? 'bg-red-500' :
                    notification.type === 'success' ? 'bg-green-500' : 'bg-orange-500'
                  }`}
    >
      <span className="mr-2">{notification.message}</span>
      <button 
        onClick={onClose}
        className="ml-2 text-white hover:text-gray-200 focus:outline-none"
        aria-label="Close"
      >
        &times;
      </button>
    </div>
  );
};

export default Toast;