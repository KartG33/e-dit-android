import React, { useRef, useState } from 'react';
import { sunoCommands } from '../../lib/commands/suno';
import { CommandButton } from './CommandButton';
import { EditTagsPanel } from './EditTagsPanel';

interface SunoCommandsProps {
  text: string;
  onCommand: (fn: (text: string) => string) => void;
  favoriteCommandIds: string[];
  onToggleFavoriteCommand: (id: string) => void;
}

export const SunoCommands: React.FC<SunoCommandsProps> = React.memo(({ 
  text,
  onCommand,
  favoriteCommandIds,
  onToggleFavoriteCommand
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showEditTags, setShowEditTags] = useState(false);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current && e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleEditTagsClick = () => {
    if (text.trim() && /\[([^\]]+)\]/.test(text)) {
      setShowEditTags(true);
    }
  };

  return (
    <>
      <div 
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex flex-nowrap overflow-x-auto gap-2 pb-1 scrollbar-hide w-full"
      >
        {sunoCommands.map(cmd => (
          <CommandButton
            key={cmd.id}
            command={cmd}
            onClick={() => onCommand(cmd.execute)}
            isFavorited={favoriteCommandIds.includes(cmd.id)}
            onToggleFavorite={() => onToggleFavoriteCommand(cmd.id)}
          />
        ))}
        
        <button
          onClick={handleEditTagsClick}
          className="flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
        >
          <span className="text-[10px] text-white/50 group-hover:text-blue-400 transition-colors">✎</span>
          <span className="text-sm text-white/80 font-medium whitespace-nowrap">Edit Tags</span>
        </button>
      </div>

      {showEditTags && (
        <EditTagsPanel
          text={text}
          onApply={(newText) => onCommand(() => newText)}
          onClose={() => setShowEditTags(false)}
        />
      )}
    </>
  );
});

SunoCommands.displayName = 'SunoCommands';
