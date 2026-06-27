import React from 'react';
import { Command } from '../../lib/commands/types';
import { Star } from 'lucide-react';

interface CommandButtonProps {
  command: Command;
  onClick: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}

export const CommandButton: React.FC<CommandButtonProps> = React.memo(({ 
  command, 
  onClick,
  isFavorited = false,
  onToggleFavorite
}) => {
  return (
    <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-lg transition-all duration-300 hover:bg-white/10 hover:border-white/20 transform hover:scale-[1.01] active:scale-[0.99] group shadow-sm">
      <button
        onClick={onClick}
        className="pl-3 pr-2.5 py-1.5 text-sm font-medium text-gray-200 whitespace-nowrap"
        title={command.description || command.name}
      >
        {command.name}
      </button>
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`pr-2.5 pl-0.5 py-1.5 flex items-center justify-center transition-all duration-200 ${
            isFavorited 
              ? 'text-yellow-400 opacity-100' 
              : 'text-gray-500 hover:text-yellow-300 opacity-0 group-hover:opacity-100'
          }`}
          title={isFavorited ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          <Star size={13} fill={isFavorited ? 'currentColor' : 'none'} />
        </button>
      )}
    </div>
  );
});

CommandButton.displayName = 'CommandButton';
