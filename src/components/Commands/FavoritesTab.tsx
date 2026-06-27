import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db/schema';
import { basicCommands } from '../../lib/commands/basic';
import { sunoCommands } from '../../lib/commands/suno';
import { CommandButton } from './CommandButton';
import { Star } from 'lucide-react';

interface FavoritesTabProps {
  onCommand: (fn: (text: string) => string) => void;
  favoriteCommandIds: string[];
  onToggleFavoriteCommand: (id: string) => void;
  favoritePresetIds: number[];
  onToggleFavoritePreset: (id: number) => void;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({ 
  onCommand, 
  favoriteCommandIds, 
  onToggleFavoriteCommand,
  favoritePresetIds,
  onToggleFavoritePreset
}) => {
  const presets = useLiveQuery(() => db.presets.filter(p => p.type === 'chain').toArray());

  const allCmds = [...basicCommands, ...sunoCommands];
  
  const favoritedCmds = allCmds.filter(cmd => favoriteCommandIds.includes(cmd.id));
  const favoritedPresets = presets?.filter(p => favoritePresetIds.includes(p.id!)) || [];

  const handleExecutePreset = (preset: any) => {
    if (!preset.commandIds || !Array.isArray(preset.commandIds)) return;
    onCommand((text) => {
      let result = text;
      for (const id of preset.commandIds) {
        const cmd = allCmds.find(c => c.id === id);
        if (cmd && typeof cmd.execute === 'function') {
          result = cmd.execute(result);
        }
      }
      return result;
    });
  };

  if (favoritedCmds.length === 0 && favoritedPresets.length === 0) {
    return (
      <div className="text-gray-500 text-sm py-1.5 px-2 flex items-center">
        У вас пока нет избранных команд или пресетов. Пометьте их звёздочкой в других вкладках!
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 p-1 items-center">
      {/* Favorited Commands */}
      {favoritedCmds.map(cmd => (
        <CommandButton
          key={cmd.id}
          command={cmd}
          onClick={() => onCommand(cmd.execute)}
          isFavorited={true}
          onToggleFavorite={() => onToggleFavoriteCommand(cmd.id)}
        />
      ))}

      {/* Favorited Presets */}
      {favoritedPresets.map(preset => (
        <div 
          key={preset.id} 
          className="flex items-center gap-1 bg-blue-950/20 border border-blue-500/20 hover:border-blue-500/40 rounded-xl px-3 py-1.5 transition-all shadow-sm"
        >
          <button
            onClick={() => handleExecutePreset(preset)}
            className="text-sm font-medium text-blue-200 hover:text-blue-100 mr-1"
            title={`Применить пресет: ${preset.name}`}
          >
            {preset.name}
          </button>
          <button
            onClick={() => onToggleFavoritePreset(preset.id!)}
            className="p-1 text-yellow-400 hover:text-gray-400 transition-colors"
            title="Убрать из избранного"
          >
            <Star size={14} fill="currentColor" />
          </button>
        </div>
      ))}
    </div>
  );
};
