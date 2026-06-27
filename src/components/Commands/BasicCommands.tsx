import React, { useRef } from 'react';
import { basicCommands } from '../../lib/commands/basic';
import { CommandButton } from './CommandButton';

interface BasicCommandsProps {
  onCommand: (fn: (text: string) => string) => void;
  favoriteCommandIds: string[];
  onToggleFavoriteCommand: (id: string) => void;
}

export const BasicCommands: React.FC<BasicCommandsProps> = React.memo(({ 
  onCommand,
  favoriteCommandIds,
  onToggleFavoriteCommand
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current && e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div 
      ref={scrollRef}
      onWheel={handleWheel}
      className="flex flex-nowrap overflow-x-auto gap-2 pb-1 scrollbar-hide"
    >
      {basicCommands.map(cmd => (
        <CommandButton
          key={cmd.id}
          command={cmd}
          onClick={() => onCommand(cmd.execute)}
          isFavorited={favoriteCommandIds.includes(cmd.id)}
          onToggleFavorite={() => onToggleFavoriteCommand(cmd.id)}
        />
      ))}
    </div>
  );
});

BasicCommands.displayName = 'BasicCommands';
