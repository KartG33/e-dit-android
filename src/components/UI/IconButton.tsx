import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  isActive?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  icon, 
  isActive = false, 
  className = '', 
  ...props 
}) => {
  return (
    <button
      {...props}
      className={`p-1.5 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] text-white' 
          : 'glass-button text-gray-300'
      } ${className}`}
    >
      {icon}
    </button>
  );
};
