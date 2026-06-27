import React from 'react';
import { Pin } from 'lucide-react';

interface TabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  isActive: boolean;
  isDefault?: boolean;
  onSetDefault?: (e: React.MouseEvent) => void;
}

export const TabButton: React.FC<TabButtonProps> = ({ 
  label, 
  isActive, 
  isDefault = false,
  onSetDefault,
  ...props 
}) => {
  return (
    <button
      {...props}
      className={`px-5 py-2 text-sm font-medium rounded-t-xl transition-all duration-300 relative flex items-center gap-1.5 group ${
        isActive
          ? 'text-blue-400 bg-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
          : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'
      }`}
    >
      <span>{label}</span>
      {onSetDefault && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onSetDefault(e);
          }}
          className={`transition-all duration-200 ${
            isDefault 
              ? 'text-blue-400 opacity-100' 
              : 'text-gray-500 hover:text-blue-300 opacity-0 group-hover:opacity-100'
          }`}
          title={isDefault ? 'Вкладка по умолчанию' : 'Сделать вкладкой по умолчанию'}
        >
          <Pin size={12} className={isDefault ? 'rotate-[45deg] fill-current' : ''} />
        </span>
      )}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] rounded-t-full" />
      )}
    </button>
  );
};
